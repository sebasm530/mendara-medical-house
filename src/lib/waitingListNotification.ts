import "server-only";
import { Resend } from "resend";
import { isEmail, type VisitData } from "./visitValidation";

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

/** Best-effort notification: never changes the outcome of a confirmed Sheets write. */
export async function notifyWaitingList(data: VisitData, date: string, origin: string, requestId: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const from = process.env.RESEND_FROM_EMAIL?.trim() ?? "";
  const to = process.env.NOTIFICATION_EMAIL?.trim() ?? "";
  if (!apiKey || !from || !to) {
    console.warn("[Mendara] waitlist_notification_skipped", { reason: "missing_configuration", requestId });
    return;
  }
  const senderAddress = from.match(/<([^<>]+)>$/)?.[1] ?? from;
  if (from.length > 320 || /[\r\n]/.test(from) || !isEmail(senderAddress) || !isEmail(to)) {
    console.warn("[Mendara] waitlist_notification_skipped", { reason: "invalid_email_configuration", requestId });
    return;
  }
  const fields = [
    ["Nombre completo", data.fullName], ["Especialidad médica", data.specialty],
    ["WhatsApp", data.whatsapp], ["Correo electrónico", data.email],
    ["Consultorio de interés", data.room ? `Consultorio ${data.room}` : "Sin preferencia"],
    ["Fecha de solicitud", date], ["Origen", origin],
  ];
  const subject = "Nueva solicitud — Lista de espera Mendara";
  const text = [subject, "", "Estado: Pendiente", "", ...fields.map(([label, value]) => `${label}: ${value}`), "", "Solicitud guardada en Google Sheets. La incorporación a la lista de espera está pendiente de revisión."].join("\n");
  const rows = fields.map(([label, value]) => `<tr><td style="padding:16px 0;border-bottom:1px solid #e8dcc8"><div style="font-size:11px;letter-spacing:0.06em;color:#80683d;margin-bottom:6px">${escapeHtml(label)}</div><div style="font-size:15px;line-height:1.65;color:#183a22;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(value)}</div></td></tr>`).join("");
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f7f3eb;font-family:Arial,Helvetica,sans-serif;color:#183a22"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f3eb"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffdf8;border:1px solid #e8dcc8"><tr><td style="padding:28px 32px;background:#183a22;border-bottom:2px solid #c9a96a"><div style="font-family:Georgia,serif;font-size:28px;letter-spacing:0.12em;color:#c9a96a">MENDARA</div><div style="font-size:10px;letter-spacing:0.22em;color:#f7f3eb;margin-top:8px">MEDICAL HOUSE</div></td></tr><tr><td style="padding:28px 32px"><h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.15;font-weight:400;margin:0 0 12px">Nueva solicitud de lista de espera</h1><p style="font-size:13px;line-height:1.7;margin:0 0 12px">La solicitud se guardó correctamente en Google Sheets.</p><p style="color:#80683d;font-size:12px;margin:0 0 8px">Estado: Pendiente</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table><p style="font-size:12px;line-height:1.75;margin:24px 0 0">La incorporación a la lista de espera está pendiente de revisión.</p></td></tr></table></td></tr></table></body></html>`;
  try {
    const { data: sent, error } = await new Resend(apiKey).emails.send({ from, to: [to], subject, html, text }, { idempotencyKey: `waitlist-notification/${requestId}`, signal: AbortSignal.timeout(8_000) });
    if (error || !sent?.id) console.error("[Mendara] waitlist_notification_failed", { reason: error ? "provider_rejected" : "unconfirmed_delivery", requestId });
  } catch {
    // Never log provider errors, payloads, addresses or credentials.
    console.error("[Mendara] waitlist_notification_failed", { reason: "delivery_exception", requestId });
  }
}
