import type { Metadata } from "next";
import { Cabecera, Tarjeta } from "@/components/ui";
import { RUTAS } from "@/features/rutas/datos";
import { ZONAS } from "@/features/territorio/zonas";

export const metadata: Metadata = { title: "Sobre el prototipo" };

const REPOSITORIO = "https://github.com/davideforerocuniandes/2026-20-mbit4219-reciclamos";

const REAL_SIMULADO = [
  ["Lectura de direcciones de Bogotá (Calle, Carrera, Diagonal, Transversal, Avenida, Sur, Este, Bis)", "Real: funciona con cualquier dirección bien escrita."],
  ["Ubicación de la cuadra y la localidad", "Simulada con zonas aproximadas sobre la malla vial. En producción: geocodificador de IDECA."],
  ["Rutas, organizaciones y horarios", "Ficticios. En producción: microrrutas registradas en el SUI y validadas por la UAESP."],
  ["Próxima recolección y hora del aviso", "Reales: se calculan con la hora de Bogotá (UTC−5)."],
  ["Aviso de la noche anterior", "Simulado: vista previa en pantalla. En producción: notificación de la SuperApp."],
  ["Reportes y respuestas", "Guardados solo en este navegador. En producción: herramienta web y WhatsApp de la organización."],
] as const;

export default function Acerca() {
  const pilotos = ZONAS.filter((z) => RUTAS.some((r) => r.zonaId === z.id)).map((z) => z.nombre);
  return (
    <>
      <Cabecera
        antetitulo="MBIT 4219 · Universidad de los Andes · 2026-20"
        titulo="Sobre el prototipo"
        descripcion="Reciclamos es una propuesta académica de transformación digital: una función de la Bogotá SuperApp que le dice a cada hogar qué día y a qué hora sacar la bolsa blanca para que llegue a un reciclador y no al camión de la basura."
      />
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Tarjeta aria-labelledby="titulo-real">
          <h2 id="titulo-real" className="text-lg font-bold">
            Qué es real y qué es simulado
          </h2>
          <dl className="mt-3 divide-y divide-borde">
            {REAL_SIMULADO.map(([que, como]) => (
              <div key={que} className="py-3 first:pt-0 last:pb-0">
                <dt className="font-semibold">{que}</dt>
                <dd className="text-sm text-gris">{como}</dd>
              </div>
            ))}
          </dl>
        </Tarjeta>

        <div className="space-y-4">
          <Tarjeta aria-labelledby="titulo-privacidad">
            <h2 id="titulo-privacidad" className="text-lg font-bold">
              Privacidad por diseño
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem]">
              <li>La consulta no guarda tu dirección ni la envía a ningún servidor.</li>
              <li>El aviso guarda solo la cuadra, con tu autorización (Ley 1581 de 2012), y puedes cancelarlo.</li>
              <li>Los reportes se asocian a la cuadra, no a la dirección.</li>
              <li>Los enlaces de ejemplo llevan un identificador, nunca una dirección.</li>
            </ul>
          </Tarjeta>

          <Tarjeta aria-labelledby="titulo-cobertura">
            <h2 id="titulo-cobertura" className="text-lg font-bold">
              Cobertura del prototipo
            </h2>
            <p className="mt-2 text-[0.95rem]">Localidades con rutas de prueba: {pilotos.join(", ")}.</p>
            <p className="mt-1 text-sm text-gris">
              Cualquier dirección urbana de Bogotá recibe un horario de prueba de la localidad más cercana. Un sector pequeño de Kennedy muestra el
              mensaje «todavía no hay ruta registrada», tal como haría la función real donde no hay organizaciones con rutas verificadas.
            </p>
          </Tarjeta>

          <Tarjeta aria-labelledby="titulo-equipo">
            <h2 id="titulo-equipo" className="text-lg font-bold">
              Equipo
            </h2>
            <p className="mt-2 text-[0.95rem]">
              David Alejandro Abril Medina, Paula Andrea Cañon Camelo, David Elias Forero Cobos y Maria Paulina Ocampo Peralta. Profesor: Javier
              Orlando Torres Páez.
            </p>
            <p className="mt-2 text-sm">
              <a href={REPOSITORIO} className="font-semibold text-verde-700 underline underline-offset-4" rel="noopener noreferrer">
                Código fuente en GitHub
              </a>
            </p>
          </Tarjeta>
        </div>
      </div>
      <p className="mt-6 max-w-3xl text-sm text-gris">
        No es un servicio oficial de la Alcaldía de Bogotá ni de la UAESP. Los nombres de organizaciones son ficticios y no representan a organizaciones
        reales de recicladores.
      </p>
    </>
  );
}
