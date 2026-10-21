# Mendara — Fase 7: movimiento

Implementación mediante código fuente, sin navegador, capturas, automatización visual ni servidores locales. No se instalaron dependencias.

## Movimiento por sección

- **Hero:** entrada coordinada de marca, encabezado, tres líneas existentes del título, descripción, CTA y disponibilidad. Textos de 700 ms con retrasos acotados a 540 ms. Fotografía de escala 1.035 a 1 durante 1.4 s, con encuadre final intacto. Hover discreto del CTA.
- **Invitación:** entrada de textos e ícono, y revelado horizontal de la línea dorada. Los paneles no se desplazan. El CSS de esta sección, sus títulos y su distribución 65/35 permanecen intactos.
- **Beneficios:** revelado escalonado de la lista y microinteracción de íconos con puntero preciso.
- **Consultorios:** entrada de introducción y galería; transición de 280 ms al cambiar de nivel, con opacidad inicial 0.55 y desplazamiento de 4 px. Hover de elevación de 2 px, contorno dorado discreto, sombra suave e imagen de escala 1.025. El contenido de los detalles aparece suavemente al abrirse, sin animar su altura. Selector, navegación, desplazamiento nativo y lógica de details permanecen iguales.
- **Doctora:** aparición del retrato enmarcado, cita como bloque, línea dorada y firma. Sin modificar fotografía, marco ni encuadre.
- **Instalaciones:** entradas escalonadas, zoom de imagen 1.025 y transición del overlay usando el verde existente.
- **Ubicación e inversión:** revelado de título, dirección, mapa reservado, indicadores y beneficio fundador; microinteracciones de íconos. Sin contadores ni cambios comerciales.
- **Formulario:** entrada del encabezado y formulario; transición de bordes al cambiar de estado, microinteracción del botón y aparición por opacidad de errores/confirmación. Sin animar altura, campos ni distribución. La entrada se cancela al tocar o enfocar el bloque para no moverlo durante la edición. No se modificaron validaciones, consentimiento, envío ni mensajes.
- **Footer:** aparición de marca y bloque editorial, incluyendo su divisor; revelado de la línea dorada corta. Marca, frase y distribución conservadas.

## Arquitectura y accesibilidad

Una isla cliente sin marcado adicional coordina las entradas mediante un solo Intersection Observer. Motion Mini utiliza animaciones nativas de opacidad y transformaciones. Las secciones de servidor permanecen en servidor; los atributos `data-motion` identifican únicamente los elementos participantes.

Las entradas por visibilidad se ejecutan una vez por montaje. La secuencia del hero no vuelve a ejecutarse al regresar con scroll. Los cambios de nivel y estados interactivos sí responden a cada acción correspondiente.

El HTML inicial no oculta contenido. Si JavaScript o las APIs de animación fallan, el contenido permanece visible. `prefers-reduced-motion` evita las entradas y efectos decorativos; un cambio de preferencia durante una animación cancela los efectos activos. Al finalizar o cancelar se restauran los estilos originales para no bloquear hover o foco.

No hay parallax, listeners nuevos de scroll, scroll hijacking, nuevos efectos continuos, filtros, cambios de tipografía, espaciado, datos, recursos, SEO o caché. Se conserva el spinner de envío existente. Las animaciones de mensajes no introducen transiciones de geometría; el comportamiento previo de espacio ocupado por mensajes se mantiene.

## Verificación

- ESLint: correcto, sin advertencias.
- TypeScript: correcto.
- Build de producción: correcto, ruta `/` prerenderizada estáticamente.
- Pruebas Node: 12 correctas, seis nuevas de movimiento y seis existentes de formulario con servicios simulados. No se enviaron correos.
- Pruebas de movimiento: preferencia reducida inicial y dinámica, ejecución única, prioridad de foco/puntero, limpieza y restauración de estilos ante finalización, cancelación o error.
- Inspección del HTML compilado: 51 elementos de movimiento sin estilos iniciales que oculten el contenido.
- Comparación de archivos protegidos y AST: recursos, datos, lógica de servidor, configuración, estilos globales y lógica del formulario conservados. En las secciones de servidor se agregaron únicamente marcadores de movimiento, salvo las clases de movimiento del hero.

**Límite:** no se verificaron visualmente los efectos ni su fluidez en dispositivos reales, según la prohibición expresa de utilizar navegadores y capturas. Las comprobaciones fueron de código, compilación y pruebas unitarias; no equivalen a una revisión visual.

## Archivos de implementación modificados

Todos dentro de `D:/mendaramedica-landing/`:

- `src/app/page.tsx`
- `src/components/HeroSection.tsx`
- `src/components/BrandWordmark.tsx`
- `src/components/InvitationSection.tsx`
- `src/components/BenefitsSection.tsx`
- `src/components/BenefitsSection.module.css`
- `src/components/ConsultingRoomsSection.tsx`
- `src/components/ConsultingRoomsSection.module.css`
- `src/components/DoctorSection.tsx`
- `src/components/FacilitiesSection.tsx`
- `src/components/FacilitiesSection.module.css`
- `src/components/LocationSection.tsx`
- `src/components/InvestmentSection.tsx`
- `src/components/LocationInvestment.module.css`
- `src/components/ContactSection.tsx`
- `src/components/ContactSection.module.css`
- `src/components/VisitForm.tsx` — únicamente atributos declarativos en el formulario.
- `src/components/ClosingSection.tsx`

## Archivos creados

- `src/components/motion/entrance.ts`
- `src/components/motion/MotionExperience.tsx`
- `src/components/motion/Motion.module.css`
- `tests/motion.test.mjs`
- `FASE7_ANIMACIONES.md` — este informe.
- `.impeccable/review/phase7-source-before.json` y `.impeccable/review/phase7-protected.json` — inventarios locales de comparación, sin datos ingresados por visitantes.

El build y TypeScript también actualizan sus artefactos generados habituales en `.next/` y `tsconfig.tsbuildinfo`.
