# Decisiones

Registro breve de decisiones de diseño: contexto, decisión y consecuencia.

### 1. Sin backend: dominio en el cliente y datos ficticios
**Contexto.** El objetivo es mostrar cómo se articula la función con la SuperApp y validarla con usuarios, no operar un servicio.
**Decisión.** Catálogo ficticio en `src/features/rutas/datos.ts` y persistencia en `localStorage`.
**Consecuencia.** Despliegue estático y gratuito. Los reportes solo se ven en el navegador donde se hicieron, lo que basta para demostrar el ciclo hogar → organización → hogar.

### 2. Los avisos y reportes guardan la cuadra
**Contexto.** La dirección es un dato personal (Ley 1581 de 2012), y para avisar basta saber qué rutas pasan por la cuadra.
**Decisión.** El aviso y los reportes guardan la clave y la descripción de la cuadra («Calle 65 Sur entre Carrera 80 y Carrera 81»), nunca la placa.
**Consecuencia.** Menos datos personales que proteger, y una prueba automatizada lo vigila.

### 3. Mostrar todas las organizaciones, sin escoger
**Contexto.** Las rutas de aprovechamiento no son exclusivas, y una función pública no debe favorecer a una organización.
**Decisión.** Cuando varias rutas cubren la cuadra, se muestran todas. La primera es la más próxima, no una «recomendada».

### 4. Honestidad antes que cobertura
**Contexto.** Un horario equivocado devuelve la bolsa al camión y destruye la confianza.
**Decisión.** Si la cuadra carece de ruta en el catálogo, se puede ensayar la solicitud de aviso. Si la consulta se ajusta a una zona vecina, se muestra un horario de referencia y se omiten avisos y reportes. Las fechas de validación son simuladas.

### 5. Hora de Bogotá con desfase fijo
**Contexto.** El navegador puede estar en otra zona horaria, y Colombia no tiene horario de verano.
**Decisión.** Todos los cálculos usan UTC−5 fijo y reciben la hora como parámetro.
**Consecuencia.** Resultados iguales en cualquier equipo, y pruebas deterministas.

### 6. Incidencias separadas de las PQR
**Contexto.** «¿No pasaron?» es una incidencia operativa que la organización resuelve; una queja formal tiene su propio régimen.
**Decisión.** El reporte de prueba recibe un número de seguimiento y aparece en la vista de organizaciones del mismo navegador.

### 7. Inicio e identidad visual de Bogotá
**Decisión.** Inicio presenta la consulta y los ejemplos. La barra lateral en escritorio y la barra inferior en celular dan acceso a las secciones. Reciclaje usa un solo campo y destaca el día y la hora en el resultado. La interfaz usa el rojo y el amarillo de la paleta distrital y tipografía del sistema. [Manual de Marca Ciudad](https://bogota.gov.co/sites/default/files/inline-files/manual-de-marca-ciudad-bogota-actualizacion-noviembre-2025_c-1.pdf)
