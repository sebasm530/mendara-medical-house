"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Check, LoaderCircle } from "lucide-react";
import { validateVisit, visitFields, type VisitErrors, type VisitResult, type VisitField } from "@/lib/visitValidation";
import styles from "./ContactSection.module.css";

export function VisitForm({ enabled, privacyUrl }: { enabled: boolean; privacyUrl: string | null }) {
  const [errors, setErrors] = useState<VisitErrors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<VisitResult | null>(null);
  const busy = useRef(false);
  const requestId = useRef<string | null>(null);
  const lastPayload = useRef<string | null>(null);
  const feedback = useRef<HTMLDivElement>(null);

  useEffect(() => { if (result && result.status !== "validation") feedback.current?.focus(); }, [result]);

  function fieldState(field: VisitField, hint?: string) {
    return { "aria-invalid": Boolean(errors[field]), "aria-describedby": [hint, errors[field] ? `visit-${field}-error` : null].filter(Boolean).join(" ") || undefined };
  }
  function error(field: VisitField) {
    return errors[field] ? <p id={`visit-${field}-error`} className={styles.fieldError}>{errors[field]}</p> : null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || result?.status === "success") return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const validation = validateVisit(formData);
    setErrors(validation.errors);
    if (Object.keys(validation.errors).length) {
      setResult({ status: "validation", errors: validation.errors, message: "Revise los campos indicados para solicitar su ingreso a la lista de espera." });
      const first = visitFields.find((field) => validation.errors[field]);
      requestAnimationFrame(() => { if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus(); });
      return;
    }
    if (!enabled) {
      setResult({ status: "unavailable", message: "El envío no está disponible por el momento. Sus datos siguen en este formulario mientras mantenga la página abierta." });
      return;
    }
    busy.current = true;
    setPending(true);
    setResult(null);
    try {
      for (const [name, value] of new URLSearchParams(window.location.search)) {
        if (/^utm_[a-z0-9_]{1,40}$/i.test(name)) formData.set(name.toLowerCase(), value);
      }
      const payload = JSON.stringify(Object.fromEntries(formData));
      if (lastPayload.current !== payload) { requestId.current = crypto.randomUUID(); lastPayload.current = payload; }
      requestId.current ??= crypto.randomUUID();
      formData.set("requestId", requestId.current);
      const response = await fetch("/api/waiting-list", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const outcome: VisitResult = await response.json();
      if (!outcome || !["success", "validation", "unavailable", "error", "limited"].includes(outcome.status)
        || (outcome.status === "success" && !response.ok)) throw new Error("Invalid submission response");
      setResult(outcome);
      if (outcome.status === "validation") setErrors(outcome.errors);
    } catch {
      setResult({ status: "error", message: "No fue posible conectar con el servicio. Sus datos siguen en el formulario; inténtelo nuevamente." });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  if (result?.status === "success") {
    return <div className={styles.success} ref={feedback} role="status" tabIndex={-1}><Check size={32} strokeWidth={1.3} aria-hidden="true" /><h3>Hemos recibido su solicitud.</h3><p>Nuestro equipo revisará su solicitud y le informará sobre los siguientes pasos. El envío no implica aceptación en la lista de espera ni reserva de un consultorio.</p></div>;
  }

  return (
    <form data-motion="rise" data-motion-delay="0.14" className={styles.form} onSubmit={onSubmit} noValidate aria-label="Solicitud de ingreso a la lista de espera de Mendara" aria-busy={pending}>
      <p className={styles.requiredNote}>Los campos con * son obligatorios.</p>
      {!enabled && <p className={styles.notice}>El envío de solicitudes aún no está disponible. Puede completar sus datos, pero no se enviarán hasta habilitar el servicio.</p>}
      <fieldset disabled={pending} className={styles.fieldset}>
        <legend className="sr-only">Datos de su solicitud de ingreso a la lista de espera</legend>
        <div className={styles.fields}>
          <div className={styles.field}><label htmlFor="visit-fullName">Nombre completo *</label><input id="visit-fullName" name="fullName" autoComplete="name" maxLength={120} required {...fieldState("fullName")} />{error("fullName")}</div>
          <div className={styles.field}><label htmlFor="visit-specialty">Especialidad médica *</label><input id="visit-specialty" name="specialty" maxLength={120} required {...fieldState("specialty")} />{error("specialty")}</div>
          <div className={styles.field}><label htmlFor="visit-whatsapp">Número de WhatsApp *</label><input id="visit-whatsapp" name="whatsapp" type="tel" autoComplete="tel" placeholder="+506" maxLength={40} required {...fieldState("whatsapp", "visit-phone-hint")} /><p id="visit-phone-hint" className={styles.hint}>Incluya el código de país.</p>{error("whatsapp")}</div>
          <div className={styles.field}><label htmlFor="visit-email">Correo electrónico *</label><input id="visit-email" name="email" type="email" autoComplete="email" maxLength={254} required {...fieldState("email")} />{error("email")}</div>
          <div className={styles.field}><label htmlFor="visit-room">Consultorio de preferencia <span>(opcional)</span></label><select id="visit-room" name="room" defaultValue="" {...fieldState("room")}><option value="">Sin preferencia</option>{[1, 2, 3, 4, 5, 6, 7].map((number) => <option key={number} value={number}>Consultorio {number}</option>)}</select>{error("room")}</div>
        </div>
        <div className={styles.honeypot} aria-hidden="true"><label htmlFor="visit-website">Sitio web</label><input id="visit-website" name="website" type="text" tabIndex={-1} autoComplete="off" maxLength={200} /></div>
        <div className={styles.consent}>
          <input id="visit-consent" type="checkbox" name="consent" value="accepted" required {...fieldState("consent")} />
          <label htmlFor="visit-consent">Acepto que Mendara Medical House utilice mis datos para contactarme y gestionar mi solicitud de ingreso a la lista de espera.</label>
        </div>
        {error("consent")}
        <p className={styles.privacy}>{privacyUrl ? <a href={privacyUrl} target="_blank" rel="noopener noreferrer">Política de privacidad <span className="sr-only">(abre una nueva pestaña)</span></a> : "Política de privacidad oficial pendiente de aprobación."}</p>
        <button type="submit" className={styles.submit} disabled={pending || !enabled}>
          {pending ? <LoaderCircle className={styles.spinner} size={21} aria-hidden="true" /> : <CalendarDays size={21} strokeWidth={1.4} aria-hidden="true" />}
          <span>{pending ? "Enviando solicitud…" : "Enviar solicitud"}</span><ArrowRight size={19} strokeWidth={1.4} aria-hidden="true" />
        </button>
      </fieldset>
      {result && <div ref={feedback} className={styles.feedback} role="alert" tabIndex={-1}>{result.message}</div>}
      <noscript><p className={styles.notice}>Active JavaScript para validar y enviar su solicitud. No se ha enviado ningún dato.</p></noscript>
    </form>
  );
}
