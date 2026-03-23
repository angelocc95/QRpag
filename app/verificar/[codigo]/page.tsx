import type { Metadata } from "next";
import Link from "next/link";
import CertificateStatusCard from "@/components/CertificateStatusCard";
import { getCertificadoByCode, normalizeCode } from "@/lib/certificados";

type Props = {
  params: Promise<{ codigo: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;
  const cleanCode = normalizeCode(codigo);
  const certificado = await getCertificadoByCode(cleanCode);

  return {
    title: certificado
      ? `Certificado ${certificado.codigo} valido`
      : `Certificado ${cleanCode} no valido`,
    description: certificado
      ? `Validacion publica para el certificado ${certificado.codigo}.`
      : `No se encontro informacion para el codigo ${cleanCode}.`
  };
}

export default async function VerifyPage({ params }: Props) {
  const { codigo } = await params;
  const cleanCode = normalizeCode(codigo);
  const certificado = await getCertificadoByCode(cleanCode);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Volver al buscador
        </Link>
        <CertificateStatusCard certificado={certificado} />
      </div>
    </main>
  );
}
