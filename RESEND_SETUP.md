# Notificaciones de la lista de espera

La configuración vigente está en el [README](README.md#variables-privadas-del-servidor) y en `.env.example`.

El endpoint `POST /api/waiting-list` guarda primero la solicitud en Google Sheets. Solo después de confirmar la escritura utiliza el SDK oficial de Resend para enviar HTML con datos escapados y texto plano al responsable.

Variables privadas del correo:

- `RESEND_API_KEY`: clave de Resend.
- `RESEND_FROM_EMAIL`: remitente verificado.
- `NOTIFICATION_EMAIL`: destinatario del equipo de Mendara.

La ausencia de variables o un fallo de Resend no invalida la solicitud guardada ni provoca otra escritura en Sheets. El sistema registra motivos genéricos sin direcciones privadas ni secretos. No se envía confirmación automática al solicitante.

Los antiguos nombres `RESEND_TO_EMAIL` y `VISIT_FORM_ENABLED` no se utilizan. El interruptor actual es `WAITLIST_FORM_ENABLED`; las variables de privacidad tienen el comportamiento descrito en el README.

No versionar credenciales. Configurarlas en el servidor y recompilar/reiniciar bajo control del encargado cuando corresponda.

Pruebas aisladas existentes, sin red ni correos reales:

```sh
node --test tests/visit-request.test.mjs
```
