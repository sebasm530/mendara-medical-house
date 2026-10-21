# Mendara Medical House

Landing de Mendara Medical House, en La Sabana, San José, Costa Rica, dirigida a médicos especialistas interesados en alquilar consultorios y solicitar ingreso a su lista de espera. Incluye catálogo de consultorios, beneficios, testimonio, instalaciones, ubicación, inversión y FAQ.

El formulario guarda solicitudes en Google Sheets y notifica al responsable mediante Resend después de confirmar el guardado. No utiliza base de datos, ORM ni autenticación de usuarios.

## Stack y requisitos

Versiones instaladas y resueltas en el lockfile al preparar la entrega:

| Tecnología | Versión |
| --- | --- |
| Next.js / App Router | 16.4.2 |
| React / React DOM | 19.3.1 |
| TypeScript | 5.9.3 |
| Tailwind CSS | 4.3.3 |
| Motion | 14.3.0 |
| Lucide React | 1.58.0 |
| Resend, SDK oficial | 6.34.1 |
| ESLint | 9.39.5 |

Tailwind CSS, Motion y Lucide React completan el stack. Consultar `package.json` para los rangos y `package-lock.json` para las versiones exactas de todas las dependencias. Inter y Cormorant Garamond están alojadas localmente en `src/fonts`, con sus licencias.

Next.js instalado requiere **Node.js >=20.9.0** y Resend **>=20**. Esta entrega se verifica con **Node.js 22.18.0 y npm 10.9.3**. El proyecto no fija `engines` en `package.json`. Las pruebas existentes usan APIs de Node.js 22: reproducirlas con la versión verificada.

## Instalación y compilación

Desde la raíz del repositorio:

```sh
npm ci
```

Copiar `.env.example` a un archivo privado `.env.local` y completar los valores. No versionarlo. La plantilla deja el envío deshabilitado con `WAITLIST_FORM_ENABLED=false`; cambiarlo cuando la configuración esté lista.

```sh
npm run lint
npm run typecheck
npm run build
```

El build necesita las dependencias de desarrollo: no omitirlas antes de compilar. Utilizar el lockfile sin actualizaciones automáticas de dependencias durante el despliegue.

## Producción

El comando existente, después de compilar, es:

```sh
npm start
```

Ejecuta `next start`. El encargado debe configurar el proceso persistente, el mecanismo de inicio y puerto admitidos, y el proxy HTTPS del subdominio. `PORT`, si lo exige el alojamiento, pertenece al runtime de Next.js y no es una credencial de Mendara.

**Esta aplicación necesita un servidor Node.js.** El endpoint `POST /api/waiting-list` usa el runtime `nodejs`, criptografía y credenciales privadas. `next.config.ts` tiene configuración vacía: no define `output: "export"` ni `output: "standalone"`. No se incluye un `server.js` personalizado. Subir solo `public/` o convertirlo en sitio estático no conserva el formulario.

## Variables privadas del servidor

Configurarlas antes del build y mantenerlas disponibles durante la ejecución. La página puede prerenderizar la disponibilidad del formulario y el enlace de privacidad; después de cambiar configuración, recompilar y reiniciar. El endpoint vuelve a comprobar la disponibilidad al procesar cada solicitud.

| Variable | Uso real |
| --- | --- |
| `GOOGLE_SHEETS_ID` | ID de la hoja de cálculo de destino. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ruta absoluta o relativa a la raíz del proyecto al JSON privado de la cuenta de servicio. Alternativa al JSON en entorno. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON completo de la cuenta de servicio en una variable privada. Tiene prioridad sobre la ruta; sirve también para Vercel. |
| `GOOGLE_SHEETS_TAB` | Nombre opcional de la pestaña. Sin definir, se usa el rango `A:H` sin nombre de pestaña. |
| `WAITLIST_FORM_ENABLED` | El valor exacto `false` deshabilita el envío. También se exige una configuración válida de Sheets. |
| `RESEND_API_KEY` | Clave privada de Resend para la notificación opcional. |
| `RESEND_FROM_EMAIL` | Remitente autorizado/verificado. Admite dirección o nombre con dirección entre ángulos. |
| `NOTIFICATION_EMAIL` | Dirección del responsable que recibe la notificación. |
| `VISIT_PRIVACY_POLICY_URL` | URL HTTPS oficial de la política de privacidad. |
| `VISIT_PRIVACY_APPROVED` | `true` permite mostrar la URL de privacidad validada. No controla por sí sola la habilitación del envío. |

Sheets requiere `GOOGLE_SHEETS_ID` y una fuente de credenciales: `GOOGLE_APPLICATION_CREDENTIALS` o `GOOGLE_SERVICE_ACCOUNT_JSON`. Habilitar Google Sheets API en el proyecto de Google Cloud y dar permiso Editor sobre la hoja a la cuenta de servicio.

Nunca utilizar `NEXT_PUBLIC_` para credenciales. Transferir el JSON y las claves al encargado por un canal privado, no mediante GitHub, issues o comentarios. Si se utiliza archivo de credenciales en el hosting, debe permanecer fuera del directorio públicamente servido. `.env.example` no contiene valores reales.

## Google Sheets y Resend

El formulario envía JSON a `POST /api/waiting-list`. El servidor valida campos y consentimiento, limita tamaños, verifica origen y aplica honeypot y límites básicos de solicitudes. Conserva los parámetros `utm_*` como origen; sin ellos registra `Directo`.

Cada solicitud confirmada agrega una fila con las columnas, en este orden:

1. Fecha de solicitud, con zona horaria de Costa Rica.
2. Nombre completo.
3. Especialidad médica.
4. WhatsApp.
5. Correo electrónico.
6. Consultorio de interés o `Sin preferencia`.
7. Estado inicial `Pendiente`.
8. Origen.

El servidor firma un JWT con la cuenta de servicio y obtiene un token OAuth de Google. Escribe mediante `valueInputOption=RAW`, que trata los valores como texto, no como fórmulas. Solo muestra éxito después de confirmar una fila de ocho celdas guardada.

Después utiliza el SDK oficial de Resend para enviar HTML con datos escapados y texto plano. Si faltan variables de correo o falla Resend, la solicitud guardada mantiene su resultado exitoso; no se repite el guardado. No se envían notificaciones si falla la validación o Sheets. No se envía confirmación automática al solicitante.

La limitación de solicitudes y deduplicación son en memoria por proceso; no son distribuidas y se reinician con el proceso. La deduplicación utiliza el ID de solicitud y dura quince minutos. No asumir garantía de entrega exactamente una vez entre reinicios o distintas instancias.

El build de esta entrega finaliza con dos advertencias de Turbopack por las rutas dinámicas de acceso al archivo de credenciales en `src/lib/googleSheets.ts`. Pueden ampliar el rastreo de archivos del servidor. No se modificó esa integración. No publicar ni compartir una copia completa de `.next/` generada con credenciales locales: está excluida de Git. El encargado debe generar y revisar su propia compilación con la configuración privada del hosting.

## Namecheap Stellar Plus y subdominio

El despliegue está destinado a un **subdominio independiente del WordPress principal**, con raíz y proceso propios. Mendara define el subdominio definitivo. No sustituir la raíz ni la instalación de WordPress.

El encargado debe verificar la compatibilidad de **la cuenta real de Namecheap Stellar Plus** con esta versión y configuración de Next.js:

- Administración de aplicaciones Node.js en cPanel y runtime compatible.
- Recursos para instalar, compilar y ejecutar la aplicación, incluidas dependencias nativas de Linux y optimización de imágenes.
- Mecanismo de arranque compatible con `next start`, directorio de trabajo, variables privadas, proxy y reinicios. Si el panel exige un archivo de inicio específico, esta entrega no lo incluye ni presupone que acepte directamente `npm start`.
- Salida HTTPS hacia `oauth2.googleapis.com`, `sheets.googleapis.com` y `api.resend.com`.
- Certificado HTTPS del subdominio, funcionamiento de la API, fuentes, recursos estáticos e imágenes.

Consultar la [guía oficial de aplicaciones Node.js de Namecheap](https://www.namecheap.com/support/knowledgebase/article.aspx/10047/2182/how-to-work-with-nodejs-app/), la [guía de Next.js en cPanel](https://www.namecheap.com/support/knowledgebase/article.aspx/10686/29/how-to-deploy-reactjs-vitejs-react-native-and-nextjs-applications-in-cpanel/) y el [despliegue Node.js de Next.js](https://nextjs.org/docs/app/getting-started/deploying). Estas guías no sustituyen la validación del hosting concreto. La compatibilidad no se ha comprobado en la cuenta de Mendara.

Publicar el repositorio no despliega el sitio. Tras configurar el hosting, realizar una solicitud controlada, confirmar la fila en Sheets y la notificación de Resend, y verificar que el WordPress principal siga funcionando.

## Estructura y pruebas

- `src/app`: página, layout y endpoint de lista de espera.
- `src/components`: secciones, carrusel, acordeón, formulario y animaciones.
- `src/data`: contenido y enlaces.
- `src/lib`: configuración privada, validación, guardado y notificaciones.
- `src/styles`, `src/fonts`: estilos y tipografías locales.
- `public`: recursos originales del proyecto.
- `tests`: pruebas existentes con datos sintéticos y red simulada.

Pruebas de servidor sin solicitudes reales, lectura de credenciales locales ni correos reales:

```sh
node --test tests/visit-request.test.mjs
```

`DESIGN.md`, `PRODUCT.md` y las notas de fases documentan la historia del proyecto y pueden describir estados anteriores. Para instalación y funcionamiento actual prevalecen este README y el código. `LEEME.txt`, `MANIFIESTO.json` y las licencias de fuentes conservan el origen y las limitaciones de uso de los recursos.

## Publicación segura

Revisar `git status`, `git ls-files`, el diff preparado y el historial antes de publicar. No incluir `.env.local`, `.env`, `secrets/`, credenciales, claves privadas, `.next/`, `node_modules/`, logs ni artefactos locales de revisión. La plantilla `.env.example` contiene nombres y ajustes no secretos.

La entrega pública de código no concede por sí sola una licencia de reutilización de marcas, fotografías ni contenidos de terceros. Se conservan las licencias existentes de las fuentes.
