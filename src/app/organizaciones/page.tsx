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
        descripcion="Herramienta gratuita para que cada organización mantenga sus rutas al día y responda los reportes «¿No pasaron?» de su cuadra."
      />
      <HerramientaOrganizaciones />
    </>
  );
}
