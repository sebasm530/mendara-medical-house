import "server-only";
import { createHash } from "node:crypto";
import { getVisitConfiguration, unavailableMessage } from "./visitConfiguration";
import { appendWaitingListRow } from "./googleSheets";
import { validateVisit, type VisitResult } from "./visitValidation";
import { notifyWaitingList } from "./waitingListNotification";

const windowMs = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; expires: number }>();
const submissions = new Map<string, { hash: string; expires: number; result: Promise<VisitResult> }>();
let globalWindow = { count: 0, expires: 0 };

function allowAttempt(email: string): boolean {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  if (globalWindow.expires <= now) globalWindow = { count: 0, expires: now + 60_000 };
  const key = createHash("sha256").update(email.toLowerCase()).digest("hex");
  const current = attempts.get(key) ?? { count: 0, expires: now + windowMs };
  if (globalWindow.count >= 10 || current.count >= 3 || (!attempts.has(key) && attempts.size >= 1000)) return false;
  globalWindow.count++;
  attempts.set(key, { count: current.count + 1, expires: current.expires });
  return true;
}

function origin(form: FormData): string | null {
  const attribution = new URLSearchParams();
  let count = 0;
  for (const [key, value] of form) {
    if (!key.toLowerCase().startsWith("utm_")) continue;
    if (!/^utm_[a-z0-9_]{1,40}$/i.test(key) || typeof value !== "string" || value.length > 256 || /[\x00-\x1f]/u.test(value) || ++count > 12) return null;
    if (value.trim()) attribution.set(key.toLowerCase(), value.trim());
  }
  attribution.sort();
  return attribution.size ? attribution.toString() : "Directo";
}

export async function deliverVisitRequest(form: FormData): Promise<VisitResult> {
  if (form.get("website")) return { status: "error", message: "No se pudo procesar la solicitud. Revise el formulario e inténtelo nuevamente." };
  const { data, errors } = validateVisit(form);
  if (Object.keys(errors).length) return { status: "validation", errors, message: "Revise los campos indicados para solicitar su ingreso a la lista de espera." };
  if (!getVisitConfiguration().enabled) return { status: "unavailable", message: unavailableMessage };
  const requestId = form.get("requestId");
  const attribution = origin(form);
  if (typeof requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(requestId) || attribution === null || attribution.length > 4096) {
    return { status: "error", message: "No se pudo validar la solicitud o su origen. Recargue la página e inténtelo nuevamente." };
  }
  const now = Date.now();
  for (const [id, value] of submissions) if (value.expires <= now) submissions.delete(id);
  const hash = createHash("sha256").update(JSON.stringify({ data, attribution })).digest("hex");
  const previous = submissions.get(requestId);
  if (previous) return previous.hash === hash ? previous.result : { status: "error", message: "La solicitud cambió. Actualice la página antes de volver a enviarla." };
  if (submissions.size >= 1000 || !allowAttempt(data.email)) return { status: "limited", message: "Se alcanzó el límite temporal de solicitudes. Espere unos minutos antes de volver a intentarlo." };
  const result = (async (): Promise<VisitResult> => {
    let savedDate: string;
    try {
      const date = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Costa_Rica", year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
      }).format(new Date());
      savedDate = `${date} (UTC-06:00)`;
      await appendWaitingListRow([
        savedDate, data.fullName, data.specialty, data.whatsapp, data.email,
        data.room ? `Consultorio ${data.room}` : "Sin preferencia", "Pendiente", attribution,
      ]);
    } catch {
      return { status: "error", message: "No pudimos confirmar el guardado de su solicitud. Sus datos siguen en el formulario; inténtelo nuevamente en unos momentos." };
    }
    try {
      await notifyWaitingList(data, savedDate, attribution, requestId);
    } catch {
      console.error("[Mendara] waitlist_notification_failed", { reason: "notification_exception", requestId });
    }
    return { status: "success" };
  })();
  submissions.set(requestId, { hash, expires: now + windowMs, result });
  const response = await result;
  if (response.status !== "success") submissions.delete(requestId);
  return response;
}
