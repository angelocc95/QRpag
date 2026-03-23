"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeCode } from "@/lib/certificados";

const CODE_PATTERN = /^CERT-\d{3}$/i;

export default function SearchForm() {
  const [codigo, setCodigo] = useState("");
  const router = useRouter();

  const cleanCode = useMemo(() => normalizeCode(codigo), [codigo]);
  const isFormatValid = cleanCode.length === 0 ? true : CODE_PATTERN.test(cleanCode);

  const helperText = cleanCode.length === 0
    ? "Formato sugerido: CERT-001"
    : isFormatValid
      ? "Formato valido"
      : "Formato invalido. Usa algo como CERT-001";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cleanCode) return;
    router.push(`/verificar/${encodeURIComponent(cleanCode)}`);
  }

  return (
    <form className="mt-6 w-full" onSubmit={onSubmit}>
      <label htmlFor="codigo" className="mb-2 block text-sm font-semibold text-slate-700">
        Codigo del certificado
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="codigo"
          name="codigo"
          value={codigo}
          onChange={(event) => setCodigo(event.target.value)}
          placeholder="Ej. CERT-001"
          autoComplete="off"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base uppercase outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={!cleanCode || !isFormatValid}
          className="rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Verificar
        </button>
      </div>
      <p className={`mt-2 text-sm ${isFormatValid ? "text-slate-600" : "text-red-600"}`}>{helperText}</p>
    </form>
  );
}
