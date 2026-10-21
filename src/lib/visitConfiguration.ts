import "server-only";
import { getSheetsConfiguration } from "./googleSheets";

export const unavailableMessage = "El envío de solicitudes no está disponible por el momento. Sus datos se conservarán en este formulario mientras mantenga la página abierta.";

export function getVisitConfiguration() {
  let privacyUrl: string | null = null;
  try {
    const url = new URL(process.env.VISIT_PRIVACY_POLICY_URL ?? "");
    if (url.protocol === "https:" && !url.username && !url.password && process.env.VISIT_PRIVACY_APPROVED === "true") privacyUrl = url.href;
  } catch { /* No se publica un enlace hasta contar con la política oficial aprobada. */ }
  const { enabled } = getSheetsConfiguration();
  return { enabled, privacyUrl };
}
