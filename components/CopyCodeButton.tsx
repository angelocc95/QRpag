"use client";

import { useState } from "react";

export default function CopyCodeButton({ codigo }: { codigo: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      onClick={copyCode}
      type="button"
      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
    >
      {copied ? "Copiado" : "Copiar codigo"}
    </button>
  );
}
