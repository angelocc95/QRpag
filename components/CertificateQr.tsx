"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

type Props = {
  codigo: string;
};

export default function CertificateQr({ codigo }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const publicBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");

  const verifyUrl = useMemo(() => {
    const baseUrl = publicBaseUrl || (typeof window !== "undefined" ? window.location.origin : "");
    if (!baseUrl) return "";
    return `${baseUrl}/verificar/${encodeURIComponent(codigo)}`;
  }, [codigo, publicBaseUrl]);

  const isLocalUrl = verifyUrl.includes("localhost") || verifyUrl.includes("127.0.0.1");

  useEffect(() => {
    let mounted = true;

    async function generateQr() {
      if (!verifyUrl) return;
      const dataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: "#881337",
          light: "#FFFFFF"
        }
      });

      if (mounted) {
        setQrDataUrl(dataUrl);
      }
    }

    generateQr().catch(() => setQrDataUrl(""));

    return () => {
      mounted = false;
    };
  }, [verifyUrl]);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">QR de validacion</p>
      <p className="mt-1 text-xs text-slate-500">Escanea este QR para abrir la validacion publica del certificado.</p>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div className="flex h-[220px] w-[220px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={`QR del certificado ${codigo}`} className="h-[220px] w-[220px] rounded" />
          ) : (
            <span className="text-sm text-slate-500">Generando QR...</span>
          )}
        </div>

        <div className="w-full">
          <p className="text-xs font-medium text-slate-500">URL del QR</p>
          <p className="mt-1 break-all rounded-md bg-slate-50 p-2 text-sm text-slate-700">{verifyUrl || "Cargando URL..."}</p>
          {isLocalUrl ? (
            <p className="mt-2 text-xs text-red-600">
              Esta URL es local y no abrira desde otro dispositivo. Configura `NEXT_PUBLIC_APP_URL` con tu dominio publico.
            </p>
          ) : null}
          {qrDataUrl ? (
            <a
              href={qrDataUrl}
              download={`${codigo}-qr.png`}
              className="mt-3 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Descargar QR
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
