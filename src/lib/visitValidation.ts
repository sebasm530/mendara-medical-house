export const visitFields = ["fullName", "specialty", "whatsapp", "email", "room", "consent"] as const;
export type VisitField = (typeof visitFields)[number];
export type VisitErrors = Partial<Record<VisitField, string>>;
export interface VisitData {
  fullName: string;
  specialty: string;
  whatsapp: string;
  email: string;
  room: string;
  consent: boolean;
}

export type VisitResult =
  | { status: "success" }
  | { status: "validation"; errors: VisitErrors; message: string }
  | { status: "unavailable" | "error" | "limited"; message: string };

export function isEmail(value: string): boolean {
  return value.length <= 254 && !/[\x00-\x1f\x7f]/u.test(value) && /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/u.test(value);
}

export function validateVisit(form: FormData): { data: VisitData; errors: VisitErrors } {
  const text = (key: string) => typeof form.get(key) === "string" ? (form.get(key) as string).trim() : "";
  const data: VisitData = {
    fullName: text("fullName"), specialty: text("specialty"), whatsapp: text("whatsapp"),
    email: text("email"), room: text("room"),
    consent: form.get("consent") === "accepted",
  };
  const errors: VisitErrors = {};
  if (!data.fullName || data.fullName.length > 120 || /[\r\n\x00-\x1f]/u.test(data.fullName)) errors.fullName = "Ingrese su nombre completo (máximo 120 caracteres).";
  if (!data.specialty || data.specialty.length > 120 || /[\r\n\x00-\x1f]/u.test(data.specialty)) errors.specialty = "Indique su especialidad médica (máximo 120 caracteres).";
  const digits = data.whatsapp.replace(/\D/g, "");
  if (!/^\+[1-9][\d\s().-]*$/u.test(data.whatsapp) || digits.length < 7 || digits.length > 15 || data.whatsapp.length > 40) errors.whatsapp = "Ingrese un número con código de país, por ejemplo +506, y entre 7 y 15 dígitos.";
  if (!isEmail(data.email)) errors.email = "Ingrese un correo electrónico válido.";
  if (data.room && !/^[1-7]$/u.test(data.room)) errors.room = "Seleccione Sin preferencia o un consultorio del 1 al 7.";
  if (!data.consent) errors.consent = "Debe aceptar el uso de sus datos para gestionar su solicitud de ingreso a la lista de espera.";
  return { data, errors };
}
