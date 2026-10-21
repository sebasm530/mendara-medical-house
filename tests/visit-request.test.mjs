import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { generateKeyPairSync, verify } from "node:crypto";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const sheetId = "synthetic-sheet-id-12345";
const email = "synthetic@testing.iam.gserviceaccount.com";
const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
const credentials = JSON.stringify({ type: "service_account", client_email: email, private_key: privateKey });
const confirmation = () => ({ spreadsheetId: sheetId, updates: { updatedRows: 1, updatedColumns: 8, updatedCells: 8, updatedRange: "Sheet1!A2:H2" } });
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
const id = (number) => `12345678-1234-4123-8123-${number.toString(16).padStart(12,"0")}`;

// Isolated unit harness: fake env, synthetic keys, mocked file reads and ALL fetch calls.
// Never loads .env.local, reads secrets/ or writes to the real spreadsheet.
function loadService({ env: overrides = {}, fetch: fakeFetch, resend: fakeSend, file = false } = {}) {
  const env = { GOOGLE_SHEETS_ID: sheetId, GOOGLE_SERVICE_ACCOUNT_JSON: file ? "" : credentials, GOOGLE_APPLICATION_CREDENTIALS: file ? "synthetic-key.json" : "", ...overrides };
  const modules = new Map(), calls = [], mailCalls = [], logs = [], events = [];
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const target = { exports: {} }; modules.set(filename, target);
    const code = ts.transpileModule(fs.readFileSync(filename,"utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    vm.runInNewContext(code, {
      module: target, exports: target.exports,
      require: (name) => name === "server-only" ? {} : name === "resend" ? { Resend: class {
        emails = { send: async (...args) => { mailCalls.push(args); events.push("mail"); return fakeSend ? fakeSend(...args) : { data: { id: "synthetic-mail-id" }, error: null }; } };
      } } : name === "node:fs" ? { existsSync: () => file }
        : name === "node:fs/promises" ? { readFile: async () => credentials }
        : name.startsWith(".") ? load(path.resolve(path.dirname(filename), `${name}.ts`)) : require(name),
      process: { env, cwd: () => root }, Buffer, FormData, Request, Response, AbortSignal, URL, URLSearchParams,
      fetch: async (...args) => {
        calls.push(args);
        events.push(args[0].includes("oauth2") ? "auth" : "sheets");
        if (fakeFetch) return fakeFetch(...args);
        return args[0] === "https://oauth2.googleapis.com/token" ? json({ access_token: "synthetic-token", token_type: "Bearer" }) : json(confirmation());
      },
      console: { log() { assert.fail("PII logging forbidden"); }, warn: (...args) => logs.push({ level: "warn", args }), error: (...args) => logs.push({ level: "error", args }) },
    }, { filename });
    return target.exports;
  }
  return { ...load(path.join(root,"src/lib/visitDelivery.ts")), ...load(path.join(root,"src/lib/visitValidation.ts")), ...load(path.join(root,"src/lib/visitConfiguration.ts")), ...load(path.join(root,"src/lib/waitingListEndpoint.ts")), calls, mailCalls, logs, events };
}
function form(overrides = {}) {
  const values = { fullName: "Persona de prueba", specialty: "Cirugía General", whatsapp: "+506 8888 8888", email: "doctor@example.invalid", room: "", consent: "accepted", website: "", requestId: id(1), ...overrides };
  const data = new FormData(); for (const [key,value] of Object.entries(values)) data.set(key,value); return data;
}
function request(values = Object.fromEntries(form()), headers = {}) {
  return new Request("https://mendara.example/api/waiting-list", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://mendara.example", ...headers }, body: typeof values === "string" ? values : JSON.stringify(values) });
}

test("server validates required fields, consent, limits and international phone numbers", () => {
  const { validateVisit } = loadService();
  assert.equal(Object.keys(validateVisit(form()).errors).length,0);
  assert.equal(Object.keys(validateVisit(form({ whatsapp: "+34 612 345 678" })).errors).length,0);
  const result = validateVisit(form({ fullName:"", specialty:"", whatsapp:"8888", email:"bad", consent:"", room:"8" }));
  for (const field of ["fullName","specialty","whatsapp","email","consent","room"]) assert.ok(result.errors[field]);
  assert.ok(validateVisit(form({ fullName:"x".repeat(121) })).errors.fullName);
  assert.ok(validateVisit(form({ specialty:"x".repeat(121) })).errors.specialty);
  assert.ok(validateVisit(form({ fullName:"x\nheader" })).errors.fullName);
  assert.equal("preferredTime" in validateVisit(form({ preferredTime:"unused" })).data,false);
});

test("missing configuration and explicit disable never call Google; email config is irrelevant", async () => {
  for (const env of [{ GOOGLE_SHEETS_ID:"" },{ GOOGLE_SHEETS_ID:"invalid id" },{ GOOGLE_SERVICE_ACCOUNT_JSON:"", GOOGLE_APPLICATION_CREDENTIALS:"" },{ WAITLIST_FORM_ENABLED:"false" }]) {
    const service=loadService({env}); assert.equal((await service.deliverVisitRequest(form())).status,"unavailable"); assert.equal(service.calls.length,0);
  }
  const service=loadService({env:{ VISIT_FORM_ENABLED:"false", RESEND_API_KEY:"", VISIT_PRIVACY_APPROVED:"false" }});
  assert.equal(service.getVisitConfiguration().enabled,true);
  assert.equal(service.getVisitConfiguration().privacyUrl,null);
});

test("honeypot, invalid request id and excessive UTM reject before any provider request", async () => {
  for(const overrides of [{website:"spam"},{requestId:"invalid"},{utm_source:"x".repeat(257)},Object.fromEntries(Array.from({length:13},(_,i)=>[`utm_test_${i}`,"test"]))]) {
    const service=loadService(); assert.equal((await service.deliverVisitRequest(form(overrides))).status,"error");assert.equal(service.calls.length,0);
  }
  const service=loadService(); assert.equal((await service.deliverVisitRequest(form({email:"bad"}))).status,"validation");assert.equal(service.calls.length,0);
});

test("signed JWT has the Google scope/audience, RS256 signature and one-hour lifetime", async () => {
  const service=loadService(); await service.deliverVisitRequest(form());
  const [url, options]=service.calls[0]; assert.equal(url,"https://oauth2.googleapis.com/token");
  const params=new URLSearchParams(options.body);
  assert.equal(params.get("grant_type"),"urn:ietf:params:oauth:grant-type:jwt-bearer");
  const [header,payload,signature]=params.get("assertion").split(".");
  assert.equal(JSON.parse(Buffer.from(header,"base64url")).alg,"RS256");
  const claims=JSON.parse(Buffer.from(payload,"base64url"));
  assert.equal(claims.iss,email);assert.equal(claims.aud,url);assert.equal(claims.scope,"https://www.googleapis.com/auth/spreadsheets");assert.equal(claims.exp-claims.iat,3600);
  assert.equal(verify("RSA-SHA256",Buffer.from(`${header}.${payload}`),publicKey,Buffer.from(signature,"base64url")),true);
});

test("writes exactly eight RAW string cells in order, Pending state and UTM origin; no mail", async () => {
  const service=loadService();
  assert.equal((await service.deliverVisitRequest(form({fullName:"=1+1",specialty:"+Especialidad",room:"2",utm_source:"instagram",utm_campaign:"apertura 2026",utm_medium:"social"}))).status,"success");
  assert.equal(service.calls.length,2);
  const [url,options]=service.calls[1];const endpoint=new URL(url);
  assert.equal(endpoint.hostname,"sheets.googleapis.com");assert.equal(endpoint.searchParams.get("valueInputOption"),"RAW");assert.equal(endpoint.searchParams.get("insertDataOption"),"INSERT_ROWS");
  const body=JSON.parse(options.body), row=body.values[0];
  assert.equal(body.majorDimension,"ROWS");assert.equal(row.length,8);assert.equal(row.every(v=>typeof v==="string"),true);
  assert.match(row[0],/\(UTC-06:00\)$/);assert.deepEqual(row.slice(1,7),["=1+1","+Especialidad","+506 8888 8888","doctor@example.invalid","Consultorio 2","Pendiente"]);
  const origin=new URLSearchParams(row[7]);assert.equal(origin.get("utm_source"),"instagram");assert.equal(origin.get("utm_campaign"),"apertura 2026");assert.equal(origin.get("utm_medium"),"social");
  assert.equal(options.headers.Authorization,"Bearer synthetic-token");assert.equal(service.calls.some(([u])=>u.includes("resend")),false);
});

test("file credentials, private JSON with escaped newlines and explicit sheet tab work", async () => {
  for(const options of [{file:true},{env:{GOOGLE_SERVICE_ACCOUNT_JSON:JSON.stringify({type:"service_account",client_email:email,private_key:privateKey.replaceAll("\n","\\n")}),GOOGLE_APPLICATION_CREDENTIALS:"missing.json",GOOGLE_SHEETS_TAB:"Lista d'espera"}}]){
    const service=loadService(options);assert.equal((await service.deliverVisitRequest(form())).status,"success");
    const range=decodeURIComponent(new URL(service.calls[1][0]).pathname);
    assert.equal(range.includes(options.file?"/A:H:append":"/'Lista d''espera'!A:H:append"),true);
    const row=JSON.parse(service.calls[1][1].body).values[0];assert.equal(row[5],"Sin preferencia");assert.equal(row[7],"Directo");
  }
});

test("bad credentials, auth errors and unconfirmed/failed writes never report success or expose secrets", async () => {
  const failureCases=[
    {env:{GOOGLE_SERVICE_ACCOUNT_JSON:"invalid-json"}},
    {env:{GOOGLE_SERVICE_ACCOUNT_JSON:JSON.stringify({type:"service_account",client_email:email,private_key:"invalid-private-key"})}},
    {fetch:async()=>json({error:"synthetic-secret"},403)},
    {fetch:async(url)=>url.includes("oauth2")?json({access_token:"synthetic-token"}):json({error:"synthetic-secret"},500)},
    {fetch:async(url)=>url.includes("oauth2")?json({access_token:"synthetic-token"}):json({spreadsheetId:sheetId,updates:{updatedRows:1}})},
    {fetch:async(url)=>url.includes("oauth2")?json({access_token:"synthetic-token"}):json({...confirmation(),spreadsheetId:"wrong-sheet"})},
    {fetch:async()=>{throw new Error("synthetic-private-error");}},
  ];
  for(const options of failureCases){const service=loadService(options);const result=await service.deliverVisitRequest(form());assert.equal(result.status,"error");assert.equal(JSON.stringify(result).includes("synthetic"),false);assert.equal(JSON.stringify(result).includes("private_key"),false);}
});

test("concurrent identical submissions share a write, confirmed retries do not append again", async () => {
  const service=loadService();
  const results=await Promise.all([service.deliverVisitRequest(form()),service.deliverVisitRequest(form())]);
  assert.equal(results.every(r=>r.status==="success"),true);assert.equal(service.calls.length,2);
  assert.equal((await service.deliverVisitRequest(form())).status,"success");assert.equal(service.calls.length,2);
  assert.equal((await service.deliverVisitRequest(form({fullName:"Changed"}))).status,"error");assert.equal(service.calls.length,2);
});

test("basic per-email and process rate limits apply to distinct submissions", async () => {
  const service=loadService();for(let i=1;i<=3;i++)assert.equal((await service.deliverVisitRequest(form({requestId:id(i)}))).status,"success");
  assert.equal((await service.deliverVisitRequest(form({requestId:id(4)}))).status,"limited");
  const global=loadService();for(let i=1;i<=10;i++)assert.equal((await global.deliverVisitRequest(form({email:`test${i}@example.invalid`,requestId:id(i)}))).status,"success");
  assert.equal((await global.deliverVisitRequest(form({email:"extra@example.invalid",requestId:id(11)}))).status,"limited");
});

test("POST endpoint returns confirmed success and validation errors without server/browser", async () => {
  const service=loadService();let response=await service.handleWaitingListPost(request());
  assert.equal(response.status,200);assert.equal((await response.json()).status,"success");
  response=await service.handleWaitingListPost(request(Object.fromEntries(form({email:"bad",requestId:id(2)}))));
  assert.equal(response.status,422);assert.ok((await response.json()).errors.email);
});

test("POST rejects cross-site, malformed, non-string and oversized payloads without Google", async () => {
  const cases=[
    [request({}, {Origin:"https://other.invalid"}),403],
    [request({}, {"Sec-Fetch-Site":"cross-site"}),403],
    [request({}, {"Content-Type":"text/plain"}),415],
    [request("not-json"),400],[request([]),400],[request({fullName:{bad:true}}),400],[request({unexpected:"field"}),400],
    [request({fullName:"x".repeat(17000)}),413],[request({}, {"Content-Length":"20000"}),413],
  ];
  for(const [input,status] of cases){const service=loadService();assert.equal((await service.handleWaitingListPost(input)).status,status);assert.equal(service.calls.length,0);}
});

test("POST request rate limiting protects against repeated malformed requests", async () => {
  const service=loadService();for(let i=0;i<10;i++)assert.equal((await service.handleWaitingListPost(request("bad-json"))).status,400);
  assert.equal((await service.handleWaitingListPost(request())).status,429);assert.equal(service.calls.length,0);
});
const notificationEnv = { RESEND_API_KEY: "synthetic-resend-key", RESEND_FROM_EMAIL: "Mendara <sender@example.invalid>", NOTIFICATION_EMAIL: "owner@example.invalid" };

test("notification follows confirmed Sheets save and includes escaped HTML, plain text and exact metadata", async () => {
  const service = loadService({ env: notificationEnv });
  const name = `<img src=x onerror=alert(1)> & " '`, specialty = "</td><script>alert(1)</script>";
  assert.equal((await service.deliverVisitRequest(form({ fullName: name, specialty, room: "3", utm_source: "instagram", utm_campaign: "apertura" }))).status, "success");
  assert.deepEqual(service.events, ["auth", "sheets", "mail"]);
  assert.equal(service.mailCalls.length, 1);
  const [mail, options] = service.mailCalls[0];
  const row = JSON.parse(service.calls[1][1].body).values[0];
  assert.equal(mail.subject, "Nueva solicitud — Lista de espera Mendara");
  assert.deepEqual(Array.from(mail.to), ["owner@example.invalid"]);
  assert.equal(mail.from, notificationEnv.RESEND_FROM_EMAIL);
  assert.ok(mail.text.includes(name)); assert.ok(mail.text.includes(specialty));
  for (const value of ["+506 8888 8888", "doctor@example.invalid", "Consultorio 3", row[0], row[7]]) assert.ok(mail.text.includes(value));
  for (const label of ["Nombre completo", "Especialidad médica", "WhatsApp", "Correo electrónico", "Consultorio de interés", "Fecha de solicitud", "Origen"]) assert.ok(mail.html.includes(label));
  assert.ok(mail.html.includes("&lt;img src=x onerror=alert(1)&gt; &amp; &quot; &#39;"));
  assert.ok(mail.html.includes("&lt;/td&gt;&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.equal(mail.html.includes("<script>"), false); assert.equal(mail.html.includes("<img"), false);
  for (const color of ["#f7f3eb", "#183a22", "#c9a96a"]) assert.ok(mail.html.includes(color));
  assert.equal(options.idempotencyKey, `waitlist-notification/${id(1)}`);
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(service.logs.length, 0);
});

test("Resend rejection, exception or unconfirmed response preserve success and never re-append Sheets", async () => {
  for (const resend of [
    async () => ({ data: null, error: { message: "synthetic-private-provider-error owner@example.invalid synthetic-resend-key" } }),
    async () => { throw new Error("synthetic-private-provider-error"); },
    async () => ({ data: null, error: null }),
  ]) {
    const service = loadService({ env: notificationEnv, resend });
    assert.equal((await service.deliverVisitRequest(form())).status, "success");
    assert.equal((await service.deliverVisitRequest(form())).status, "success");
    assert.equal(service.calls.length, 2); assert.equal(service.mailCalls.length, 1);
    assert.equal(service.logs.length, 1); assert.equal(service.logs[0].level, "error");
    const log = JSON.stringify(service.logs);
    for (const forbidden of ["synthetic-private-provider-error", "owner@example.invalid", "synthetic-resend-key", "Persona de prueba", "doctor@example.invalid"]) assert.equal(log.includes(forbidden), false);
  }
});

test("missing or invalid Resend configuration only warns and does not disable Sheets", async () => {
  for (const overrides of [{ RESEND_API_KEY: "" }, { RESEND_FROM_EMAIL: "" }, { NOTIFICATION_EMAIL: "" }, { NOTIFICATION_EMAIL: "bad-address" }, { RESEND_FROM_EMAIL: "sender@example.invalid\nInjection" }]) {
    const service = loadService({ env: { ...notificationEnv, ...overrides } });
    assert.equal(service.getVisitConfiguration().enabled, true);
    assert.equal((await service.deliverVisitRequest(form())).status, "success");
    assert.equal(service.calls.length, 2); assert.equal(service.mailCalls.length, 0);
    assert.equal(service.logs.length, 1); assert.equal(service.logs[0].level, "warn");
    const log = JSON.stringify(service.logs);
    assert.equal(log.includes("synthetic-resend-key"), false); assert.equal(log.includes("sender@example.invalid"), false);
  }
});

test("validation, spam and Sheets failures never attempt notification", async () => {
  const invalid = loadService({ env: notificationEnv });
  assert.equal((await invalid.deliverVisitRequest(form({ email: "invalid" }))).status, "validation");
  assert.equal((await invalid.deliverVisitRequest(form({ website: "bot" }))).status, "error");
  assert.equal(invalid.mailCalls.length, 0); assert.equal(invalid.logs.length, 0);
  for (const fetch of [async () => json({ error: "auth failure" }, 403), async (url) => url.includes("oauth2") ? json({ access_token: "synthetic-token" }) : json({ error: "write failure" }, 500)]) {
    const service = loadService({ env: notificationEnv, fetch });
    assert.equal((await service.deliverVisitRequest(form())).status, "error");
    assert.equal(service.mailCalls.length, 0); assert.equal(service.logs.length, 0);
  }
});

test("POST remains HTTP 200 with a confirmed row even if notification throws", async () => {
  const service = loadService({ env: notificationEnv, resend: async () => { throw new Error("synthetic-mail-failure"); } });
  const response = await service.handleWaitingListPost(request());
  assert.equal(response.status, 200); assert.equal((await response.json()).status, "success");
  assert.equal(service.calls.length, 2); assert.equal(service.mailCalls.length, 1);
});
