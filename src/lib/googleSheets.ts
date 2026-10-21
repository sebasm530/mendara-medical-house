import "server-only";
import { createPrivateKey, sign } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const tokenUrl = "https://oauth2.googleapis.com/token";

export function getSheetsConfiguration() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID?.trim() ?? "";
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim() ?? "";
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ?? "";
  const tab = process.env.GOOGLE_SHEETS_TAB?.trim() ?? "";
  const enabled = process.env.WAITLIST_FORM_ENABLED !== "false"
    && /^[a-zA-Z0-9_-]{10,200}$/.test(spreadsheetId)
    && tab.length <= 100 && !/[\x00-\x1f]/u.test(tab)
    && Boolean(credentialsJson || (credentialsPath && existsSync(resolve(process.cwd(), credentialsPath))));
  return { enabled, spreadsheetId, credentialsJson, credentialsPath, range: tab ? `'${tab.replaceAll("'", "''")}'!A:H` : "A:H" };
}

async function accessToken(configuration: ReturnType<typeof getSheetsConfiguration>) {
  const json = configuration.credentialsJson || await readFile(resolve(process.cwd(), configuration.credentialsPath), "utf8");
  const credentials: unknown = JSON.parse(json);
  if (!credentials || typeof credentials !== "object" || !("type" in credentials) || credentials.type !== "service_account"
    || !("client_email" in credentials) || typeof credentials.client_email !== "string" || !/^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/.test(credentials.client_email)
    || !("private_key" in credentials) || typeof credentials.private_key !== "string") throw new Error("Invalid service account configuration");
  const key = createPrivateKey(credentials.private_key.replaceAll("\\n", "\n"));
  if (key.asymmetricKeyType !== "rsa") throw new Error("Invalid signing key type");
  const issuedAt = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: credentials.client_email, scope: "https://www.googleapis.com/auth/spreadsheets", aud: tokenUrl,
    iat: issuedAt, exp: issuedAt + 3600,
  })}`;
  const assertion = `${unsigned}.${sign("RSA-SHA256", Buffer.from(unsigned), key).toString("base64url")}`;
  const response = await fetch(tokenUrl, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error("Google authentication failed");
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("access_token" in result)
    || typeof result.access_token !== "string" || !result.access_token.trim() || result.access_token.length > 16_384) throw new Error("Invalid Google token response");
  return result.access_token;
}

/** RAW and string cells preserve phones and treat all user input as literal text. */
export async function appendWaitingListRow(row: readonly string[]) {
  const configuration = getSheetsConfiguration();
  if (!configuration.enabled || row.length !== 8) throw new Error("Sheets not configured");
  const token = await accessToken(configuration);
  const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(configuration.spreadsheetId)}/values/${encodeURIComponent(configuration.range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const response = await fetch(endpoint, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ majorDimension: "ROWS", values: [row] }), signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("Sheets append failed");
  const result = await response.json() as { spreadsheetId?: unknown; updates?: { updatedRows?: unknown; updatedColumns?: unknown; updatedCells?: unknown; updatedRange?: unknown } } | null;
  if (result?.spreadsheetId !== configuration.spreadsheetId || result.updates?.updatedRows !== 1
    || result.updates.updatedColumns !== 8 || result.updates.updatedCells !== 8
    || typeof result.updates.updatedRange !== "string" || !result.updates.updatedRange) throw new Error("Sheets write not confirmed");
}
