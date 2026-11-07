import { EnlaceBoton } from "@/components/ui";

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm font-semibold text-acento">Error 404</p>
      <h1 className="mt-2 text-2xl font-bold">Esta página no existe</h1>
      <p className="mt-2 text-gris">Revisa el enlace o vuelve al inicio para consultar tu horario de reciclaje.</p>
      <EnlaceBoton href="/" className="mt-6">
        Volver al inicio
      </EnlaceBoton>
    </div>
  );
}
