# Atributos de calidad

| Atributo | Decisión | Cómo se verifica |
|---|---|---|
| **Usabilidad** | Una sola pregunta («¿Dónde vives?»). La dirección se escribe como en el recibo y la app muestra cómo la leyó. Primero el *cuándo*, después el *quién*. Mensajes de error que dicen qué hacer. | Quince formatos de dirección en pruebas unitarias; todos los estados de la consulta y de error en pruebas de punta a punta. |
| **Accesibilidad (WCAG 2.2 AA)** | HTML semántico, etiquetas en todos los campos, `aria-live` en el resultado, foco movido al resultado, enlace «Saltar al contenido», áreas táctiles de 44 px o más, foco visible, contraste revisado y respeto por `prefers-reduced-motion`. | axe-core en cada página y en los formularios, en teléfono y escritorio. Prueba de uso solo con teclado. |
| **Diseño adaptable** | Barra inferior en teléfono y barra lateral en escritorio. *Container queries*: el resultado pasa a dos columnas solo cuando su contenedor tiene espacio, no por el ancho de la pantalla. | Prueba sin desborde horizontal a 320, 360, 768, 1024, 1280 y 1440 px. |
| **Privacidad (Ley 1581 de 2012)** | La consulta no guarda ni envía la dirección. El aviso guarda solo la cuadra, con consentimiento y opción de cancelar. Los enlaces de ejemplo llevan un identificador, nunca una dirección. «Borrar mis datos». | Prueba que revisa que `localStorage` no contiene la placa ni la dirección. |
| **Corrección** | Hora de Bogotá con desfase fijo (UTC−5), independiente de la zona del equipo. Casos borde: ventana en curso, ventana terminada, cambio de semana. | 55 pruebas unitarias del dominio, incluida la integridad del catálogo (zonas sin solaparse, rutas dentro de su zona). |
| **Rendimiento** | Todas las páginas son estáticas. Sin backend ni llamadas de red para consultar. Íconos SVG importados uno a uno. Fuente con `next/font` y `display: swap`. | `next build` reporta las seis rutas como estáticas. |
| **Mantenibilidad** | Dominio puro separado de la interfaz. Organización por funcionalidad. TypeScript estricto. Uniones discriminadas para los estados. | `npm run lint` y `npm run typecheck` en integración continua. |
| **Seguridad** | Sin datos sensibles en el servidor. Cabeceras `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy` (ubicación solo en el propio sitio). Sin `X-Powered-By`. Dependencias de producción sin vulnerabilidades conocidas. | Prueba de cabeceras y `npm audit --omit=dev`. |
| **Honestidad del dato** | Nunca muestra un horario que no puede verificar. Cada ruta muestra la fecha de su última validación en campo. Franja visible de «prototipo, datos ficticios» en todas las pantallas. | Pruebas del estado «sin ruta» y de que toda dirección de la malla recibe resultado. |
| **Portabilidad y despliegue** | Sin variables de entorno. Despliegue en Vercel sin configuración. Node fijado con `engines` y `.node-version`. | Integración continua con Node 24. |

## Riesgo conocido

`npm audit` reporta vulnerabilidades moderadas en `minimatch`, una dependencia de desarrollo que llega por `eslint-config-next`. No entra en la aplicación publicada y se resuelve cuando Next.js actualice esa configuración.
