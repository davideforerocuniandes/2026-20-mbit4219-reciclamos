# Atributos de calidad

| Atributo | Decisión | Cómo se verifica |
|---|---|---|
| **Usabilidad** | Un campo de dirección con un ejemplo visible. El resultado muestra primero el día y la hora. El error indica qué corregir y conserva el valor ingresado. | Quince formatos de dirección en pruebas unitarias; todos los estados de la consulta y de error en pruebas de punta a punta. |
| **Accesibilidad (WCAG 2.2 AA)** | HTML semántico, etiquetas en todos los campos, foco movido al resultado con la fecha y la franja como descripción accesible, enlace «Saltar al contenido», áreas táctiles de 44 px o más, foco visible, contraste revisado y respeto por `prefers-reduced-motion`. | axe-core en cada página y en los formularios, en teléfono y escritorio. Prueba de uso solo con teclado. |
| **Diseño adaptable** | Barra lateral en escritorio y barra inferior en móvil, con espacio de desplazamiento para que el foco quede visible. Los paneles se apilan cuando el contenido tiene poco ancho. | Prueba sin desborde horizontal a 320, 360, 768, 1024, 1280 y 1440 px. Las cinco pantallas se prueban con texto al 200 %. |
| **Privacidad (Ley 1581 de 2012)** | La consulta no guarda ni envía la dirección. El aviso guarda solo la cuadra, con consentimiento y opción de cancelar. Los enlaces de ejemplo llevan un identificador, nunca una dirección. «Borrar mis datos». | Prueba que revisa que `localStorage` no contiene la placa ni la dirección. |
| **Corrección** | Hora de Bogotá con desfase fijo (UTC−5), independiente de la zona del equipo. Casos borde: ventana en curso, ventana terminada, cambio de semana. | Pruebas unitarias del dominio, incluida la integridad del catálogo (zonas sin solaparse, rutas dentro de su zona). |
| **Rendimiento** | Todas las páginas son estáticas. Sin backend ni llamadas de red para consultar. Íconos SVG importados uno a uno. Tipografía del sistema. | `next build` reporta las seis rutas como estáticas. |
| **Mantenibilidad** | Dominio puro separado de la interfaz. Organización por funcionalidad. TypeScript estricto. Uniones discriminadas para los estados. | `npm run lint` y `npm run typecheck` en integración continua. |
| **Seguridad** | Sin datos sensibles en el servidor. Cabeceras `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy` (ubicación permitida en el propio sitio). Sin `X-Powered-By`. Dependencias de producción sin vulnerabilidades conocidas. | Prueba de cabeceras y `npm audit --omit=dev`. |
| **Honestidad del dato** | Identifica los datos ficticios, los horarios de una zona cercana y las acciones simuladas. | Pruebas de cuadra sin ruta, zona cercana, aviso de prueba y reporte local. |
| **Portabilidad y despliegue** | Sin variables de entorno. Despliegue en Vercel sin configuración. Node fijado con `engines` y `.node-version`. | Integración continua con Node 24. |

## Riesgo conocido

`npm audit` reporta vulnerabilidades moderadas en `minimatch`, una dependencia de desarrollo que llega por `eslint-config-next`. No entra en la aplicación publicada y se resuelve cuando Next.js actualice esa configuración.

## Validación con personas

Pedir a personas con distintos niveles de experiencia usando el celular que consulten un horario sin ayuda, expliquen cuándo sacar la bolsa blanca y encuentren cómo reportar una falla. Registrar los pasos donde necesitan ayuda y comprobar si entienden cuáles acciones son simuladas. Revisar el mismo recorrido con un lector de pantalla en un dispositivo real.
