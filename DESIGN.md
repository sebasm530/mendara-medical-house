# Dirección visual — fase 2

Modo: Persuade. Autoridad: imagen aprobada y pedido de fase 2 del usuario. Mantener su composición editorial; no explorar una identidad alternativa.

## Tokens
Verde selva `#183A22`, verde hoja `#5C6F3A`, oro natural `#C9A96A`, marfil `#F7F3EB`, arena `#E8DCC8`, carbón `#262626`. Centralizados en `src/styles/globals.css`. El tono de oro para texto pequeño se oscurece a `#80683D` para mejorar contraste sobre marfil.

Cormorant Garamond 400/500 e italic 400 para titulares y marca tipográfica provisional. Inter 400/500/600 para lectura y controles. Fuentes locales, cargadas con next/font/local, con licencias en src/fonts.

## Composición
Hero: texto a la izquierda y render de recepción a la derecha, integrado por un degradado marfil suave. No es un fondo de la captura de referencia. El mostrador y la marca real del render deben conservar protagonismo. CTA verde con iconos dorados; foco visible y hover discreto. Sin animación de entrada que oculte contenido.

La franja es una única sección marfil: mensaje de invitación y mensaje de especialidad en dos columnas con un separador fino. El detalle botánico es un icono Leaf decorativo de Lucide; no se usan fotos de plantas externas. En móvil se apilan texto, arquitectura y mensajes, con tamaños y espacios propios.

## Límites de fidelidad
El render disponible es distinto del de la referencia aprobada. La marca superior es tipográfica provisional, sin inventar un monograma oficial. No hay recursos botánicos recortados para reproducir las plantas fotográficas de la referencia. No se generan imágenes nuevas ni se altera public.

## Extensión de fase 3
Se heredan los tokens y las fuentes existentes sin modificar estilos globales, hero ni invitación. Los estilos nuevos están encapsulados en módulos CSS. En escritorio, beneficios presenta una introducción a la izquierda y una composición de tres beneficios arriba y dos centrados abajo a la derecha. En móvil se usan dos columnas y, por debajo de 360 px, una lista de una columna.

Consultorios mantiene la introducción editorial a la izquierda y tres tarjetas visibles a la derecha desde 1000 px. En móvil muestra una tarjeta con parte de la siguiente; el desplazamiento horizontal queda contenido en la lista. El selector de niveles usa botones con aria-pressed y estado anunciado. Los detalles se despliegan en cada tarjeta con details/summary, sin modal. Precios y áreas solo provienen del pedido comercial actualizado. Las imágenes tienen identificación visible de referencia; no son prueba del aspecto de cada consultorio.

Botones táctiles de al menos 44 px, foco visible y respeto a reduced-motion. Iconos en oro natural, sin tarjetas con sombras ni nuevas decoraciones. No se alteran los tokens ni la configuración del sistema visual anterior.

## Extensión de fase 4
Se conserva intacto el sistema y las cuatro secciones anteriores. Estilos nuevos encapsulados en tres módulos CSS. Perfil de doctora en dos columnas desde 900 px: espacio fotográfico arena a la izquierda, bloque editorial verde selva a la derecha. En móvil se apilan. La fotografía y frase están explícitamente pendientes, sin simular un retrato ni un testimonio real.

Instalaciones: cuatro figuras horizontales con etiquetas verde selva e identificación de referencia; todas visibles desde 1000 px y desplazables en tamaños menores mediante scroll-snap táctil o teclado. Hover de escala 1.025 únicamente con puntero apropiado y sin reduced-motion. Sin imagen de parqueo.

Ubicación e inversión comparten fila desde 1100 px, con ubicación y espacio reservado del mapa a la izquierda; datos comerciales e incentivo fundador a la derecha. En móvil se apilan sin orden alternativo. El mapa se representa como estado pendiente, sin cartografía inventada ni marcador. El beneficio fundador usa arena e icono de corona dentro de un círculo de contorno dorado fino. No se agregan tokens globales, dependencias, nuevas animaciones continuas ni secciones adicionales.

## Extensión de fase 5
Contacto en marfil, introducción editorial a la izquierda y formulario claro a la derecha desde 1000 px. Seis campos distribuidos en dos columnas en escritorio y una en móvil. Inputs de 46 px, texto móvil de 16 px, CTA ancho de 52 px, consentimiento y estados de validación asociados. Aviso visible de envío deshabilitado y privacidad pendiente, necesario por el estado real de la integración. Sin sombras ni decoraciones nuevas. Estilos encapsulados, sin tocar secciones previas.

Cierre en verde selva: marca tipográfica provisional dorada claramente identificada, separador fino y frase editorial. Dos columnas desde 700 px, composición apilada y centrada en móvil. Detalle botánico Leaf de Lucide; no se inventa un monograma oficial ni se agregan enlaces ficticios. Transiciones discretas y spinner solo durante un envío habilitado; reduced-motion elimina animación y transiciones. La única isla cliente nueva es VisitForm; ContactSection y ClosingSection permanecen en servidor.

## Ajustes conservadores de fase 6A

Se conserva la dirección editorial, los tokens, textos, recursos y comportamiento existente. El hero fue auditado y permanece intacto. Desde 900 px, la invitación comparte el contenedor de 1280 px con beneficios y consultorios, con 56 px laterales, 48 px verticales y entre columnas, e inset de especialidad de 40 px. A 1440 px, su texto comienza en x=136 px, alineado con las secciones siguientes.

Las fotografías de consultorios conservan sus recursos y usan proporción 1.4 para darles algo más de altura; la tipografía y alineación de precios se mantienen. El carril termina con 8 px de espacio, las notas comienzan a 8 px y el contenedor termina con 42 px en móvil y 40 px desde 1000 px.

El cierre recupera la marca tipográfica provisional anterior en Cormorant dorado sobre verde selva, sin base marfil ni logotipo nuevo. Conserva frase, divisor y detalle botánico. No se migra `.impeccable/design.json`. La evidencia y los límites de validación quedan en `AUDITORIA_VISUAL_6A.md`.
