# Decisiones

Registro breve de decisiones de diseño: contexto, decisión y consecuencia.

### 1. Sin backend: dominio en el cliente y datos ficticios
**Contexto.** El objetivo es mostrar cómo se articula la función con la SuperApp y validarla con usuarios, no operar un servicio.
**Decisión.** Catálogo ficticio en `src/features/rutas/datos.ts` y persistencia en `localStorage`.
**Consecuencia.** Despliegue estático y gratuito. Los reportes solo se ven en el navegador donde se hicieron, lo que basta para demostrar el ciclo hogar → organización → hogar.

### 2. La dirección no se guarda; la cuadra sí
**Contexto.** La dirección es un dato personal (Ley 1581 de 2012), y para avisar basta saber qué rutas pasan por la cuadra.
**Decisión.** El aviso y los reportes guardan la clave y la descripción de la cuadra («Calle 65 Sur entre Carrera 80 y Carrera 81»), nunca la placa.
**Consecuencia.** Menos datos personales que proteger, y una prueba automatizada lo vigila.

### 3. Mostrar todas las organizaciones, sin escoger
**Contexto.** Las rutas de aprovechamiento no son exclusivas, y una función pública no debe favorecer a una organización.
**Decisión.** Cuando varias rutas cubren la cuadra, se muestran todas. La primera es la más próxima, no una «recomendada».

### 4. Honestidad antes que cobertura
**Contexto.** Un horario equivocado devuelve la bolsa al camión y destruye la confianza.
**Decisión.** Si no hay ruta verificada, la app lo dice y ofrece avisar cuando la haya. Cada ruta muestra la fecha de su última validación.

### 5. Hora de Bogotá con desfase fijo
**Contexto.** El navegador puede estar en otra zona horaria, y Colombia no tiene horario de verano.
**Decisión.** Todos los cálculos usan UTC−5 fijo y reciben la hora como parámetro.
**Consecuencia.** Resultados iguales en cualquier equipo, y pruebas deterministas.

### 6. Incidencias separadas de las PQR
**Contexto.** «¿No pasaron?» es una incidencia operativa que la organización resuelve; una queja formal tiene su propio régimen.
**Decisión.** El reporte va a la organización con un número de seguimiento y la pantalla aclara que las PQR siguen el canal del servicio de aseo.

### 7. Diseño adaptable con *container queries*
**Contexto.** Con barra lateral, el espacio del resultado depende del contenedor y no solo del ancho de la pantalla.
**Decisión.** El resultado pasa a dos columnas con `@container`. Las superposiciones (la vista previa del aviso) se dibujan en un portal sobre `<body>` para que `position: fixed` se mida contra la pantalla.
