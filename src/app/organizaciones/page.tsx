import type { Metadata } from "next";
import { Cabecera } from "@/components/ui";
import { HerramientaOrganizaciones } from "@/features/reportes/herramienta-organizaciones";

export const metadata: Metadata = { title: "Herramienta para organizaciones" };

export default function PaginaOrganizaciones() {
  return (
    <>
      <Cabecera
        antetitulo="Organizaciones de recicladores"
        titulo="Rutas y reportes"
        descripcion="Consulta las rutas de ejemplo y ensaya cómo responder a los reportes guardados en este navegador."
      />
      <HerramientaOrganizaciones />
    </>
  );
}
