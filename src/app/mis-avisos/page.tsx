import type { Metadata } from "next";
import { Cabecera } from "@/components/ui";
import { MisAvisos } from "@/features/avisos/mis-avisos";

export const metadata: Metadata = { title: "Mis avisos y reportes" };

export default function PaginaMisAvisos() {
  return (
    <>
      <Cabecera antetitulo="Aseo · Reciclaje" titulo="Mis avisos y reportes" descripcion="Tu aviso de la noche anterior, las cuadras en espera de ruta y el estado de tus reportes." />
      <MisAvisos />
    </>
  );
}
