# Auditoría visual — fase 6A

Fecha: 16 de octubre de 2026. Alcance: correcciones pequeñas respaldadas por comparación visual y restauración de la tipografía del cierre. Se mantienen copy, imágenes, datos comerciales, formulario y lógica de carruseles.

## Cambios comprobados

- Hero auditado sin cambios: los límites y métricas del titular coinciden antes/después a 1440, 1000, 768 y 390 px.
- Invitación en escritorio: contenedor máximo de 1120 a 1280 px; a 1440 px el inicio del texto pasa de x=216 a x=136 px y coincide con beneficios y consultorios. Padding superior/inferior de 58/60 a 48/48 px; altura de sección de 405.625 a 383.625 px (22 px menos). Separación de columnas de 64 a 48 px e inset de especialidad de 56 a 40 px.
- Consultorios: proporción fotográfica de 1.5 a 1.4 con las mismas imágenes. Las líneas de precio conservan su alineación. Espacio inferior del carril de 14 a 8 px, margen superior de notas de 12 a 8 px y cierre de sección de 50 a 42 px en móvil y de 48 a 40 px en escritorio.
- Cierre: retirada la base marfil; restaurada la marca tipográfica provisional anterior en Cormorant dorado. Se conservan frase y divisor. La marca tiene rol de imagen y nombre accesible para lectores de pantalla. No se crea un logotipo nuevo.

## Verificación y evidencia

Lint, TypeScript y compilación de producción aprobados. Seis pruebas de servicios simulados aprobadas; no se envió correo real. El detector de diseño devuelve `[]`.

La revisión en navegador mediante CDP usó archivos locales, sin servidor, a 1440, 1000, 768, 390 y 320 px. Pasaron filtros, detalles, flechas móviles, teclado de galería, validación y foco del formulario, y conservación de datos cuando el envío no está disponible. Imágenes cargadas y ausencia de desbordamiento horizontal de página en los cinco anchos.

Capturas y métricas: `.impeccable/review/phase6-before-<ancho>.png/json` y `phase6-after-<ancho>.png/json`; recortes con sufijos `-top`, `-rooms` y `-footer`. La comparación SHA256 conserva sin cambios los archivos protegidos de datos, recursos, servicios, interacciones, paquetes y configuración.

## Límites y pendientes

No se verificaron por HTTP el optimizador de imágenes, el transporte de acciones de Next ni el proveedor de correo. El envío continúa deshabilitado y los datos pendientes conservan su estado. Esta revisión no acredita preparación completa para publicación. La revisión independiente no encontró defectos visuales materiales en las cinco anchuras y confirmó resuelta su única observación de accesibilidad en la marca del footer. La compilación final posterior a esa corrección también pasó.

Documentación: se amplía `DESIGN.md` preservando sus secciones previas y se crea este informe. No se modifica ni migra `.impeccable/design.json`.
