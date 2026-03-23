import type { Metadata } from "next";
import SearchForm from "@/components/SearchForm";

export const metadata: Metadata = {
  title: "Verificacion de Certificados",
  description: "Consulta la autenticidad de certificados con codigo unico y QR."
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="panel-enter w-full max-w-3xl rounded-3xl bg-white/95 p-6 shadow-panel sm:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Sistema publico</p>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">Verificacion de Certificados</h1>
        <p className="mt-3 text-slate-600">
          Ingresa el codigo del certificado para validar autenticidad, visualizar datos y acceder al PDF oficial.
        </p>
        <SearchForm />
      </section>
    </main>
  );
}
