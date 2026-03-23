import Link from "next/link";
import type { Certificado } from "@/lib/certificados";
import CopyCodeButton from "@/components/CopyCodeButton";

type Props = {
  certificado: Certificado | null;
};

function formatDate(value: string): string {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const latamMatch = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);

  let date: Date | null = null;

  if (isoMatch) {
    date = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
  } else if (latamMatch) {
    const day = latamMatch[1].padStart(2, "0");
    const month = latamMatch[2].padStart(2, "0");
    const year = latamMatch[3];
    date = new Date(`${year}-${month}-${day}T00:00:00`);
  }

  if (!date || Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default function CertificateStatusCard({ certificado }: Props) {
  if (!certificado) {
    return (
      <section className="panel-enter mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-red-200 bg-white p-7 shadow-panel">
        <div className="flex items-center gap-3 text-red-700">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-xl" aria-hidden>
            ✖
          </span>
          <h2 className="text-2xl font-bold">Certificado no valido</h2>
        </div>
        <p className="mt-4 text-slate-700">
          El codigo ingresado no existe en nuestra base de certificados. Verifica el QR o el codigo manual.
        </p>
      </section>
    );
  }

  return (
    <section className="panel-enter mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-red-200 bg-white p-7 shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-red-700">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-xl" aria-hidden>
            ✔
          </span>
          <h2 className="text-2xl font-bold">Certificado valido</h2>
        </div>
        <CopyCodeButton codigo={certificado.codigo} />
      </div>

      <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">
        <Detail label="Nombre completo" value={certificado.nombre} />
        <Detail label="Curso" value={certificado.curso} />
        <Detail label="Fecha" value={formatDate(certificado.fecha)} />
        <Detail label="Codigo" value={certificado.codigo} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={certificado.pdf}
          target="_blank"
          rel="noopener noreferrer"
          download={certificado.pdf.startsWith("/") ? "" : undefined}
          className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          Descargar PDF
        </a>
        <Link
          href="/"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
        >
          Verificar otro codigo
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Previsualizacion del certificado
        </p>
        <iframe
          src={certificado.pdf}
          title={`Vista previa ${certificado.codigo}`}
          className="h-[420px] w-full rounded-lg border border-slate-200 sm:h-[560px]"
          loading="lazy"
        />
        <p className="mt-2 text-xs text-slate-500">
          Si no ves el documento, usa el boton Descargar PDF.
        </p>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <article>
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </article>
  );
}
