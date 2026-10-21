import "server-only";
import { createHash } from "node:crypto";
import { deliverVisitRequest } from "./visitDelivery";

const maxBytes = 16_384;
const clients = new Map<string, { count: number; expires: number }>();
const fail = (message: string, status: number) => Response.json({ status: status === 429 ? "limited" : "error", message }, { status });

export async function handleWaitingListPost(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== new URL(request.url).origin)) return fail("Origen de solicitud no permitido.", 403);
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") ?? "")) return fail("Formato de solicitud no válido.", 415);
  if (Number(request.headers.get("content-length")) > maxBytes) return fail("La solicitud excede el tamaño permitido.", 413);
  const now = Date.now();
  for (const [key, value] of clients) if (value.expires <= now) clients.delete(key);
  const address = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const key = createHash("sha256").update(address.slice(0, 256)).digest("hex");
  const current = clients.get(key) ?? { count: 0, expires: now + 15 * 60_000 };
  if (current.count >= 10 || (!clients.has(key) && clients.size >= 2000)) return fail("Demasiadas solicitudes. Espere unos minutos.", 429);
  clients.set(key, { ...current, count: current.count + 1 });
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail("La solicitud está vacía.", 400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) { await reader.cancel(); return fail("La solicitud excede el tamaño permitido.", 413); }
      chunks.push(chunk.value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Datos de solicitud no válidos.", 400);
    const form = new FormData();
    const fields = new Set(["fullName", "specialty", "whatsapp", "email", "room", "consent", "website", "requestId"]);
    for (const [name, value] of Object.entries(body)) {
      if ((!fields.has(name) && !/^utm_[a-z0-9_]{1,40}$/i.test(name)) || typeof value !== "string" || value.length > 4096) return fail("Datos de solicitud no válidos.", 400);
      form.set(name, value);
    }
    const result = await deliverVisitRequest(form);
    const status = result.status === "success" ? 200 : result.status === "validation" ? 422 : result.status === "unavailable" ? 503 : result.status === "limited" ? 429 : 502;
    return Response.json(result, { status });
  } catch {
    return fail("No fue posible procesar la solicitud. Sus datos siguen en el formulario.", 400);
  }
}
