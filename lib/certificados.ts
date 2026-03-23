import certificados from "@/data/certificados.json";

export type Certificado = {
  codigo: string;
  nombre: string;
  curso: string;
  fecha: string;
  pdf: string;
};

const registros = certificados as Certificado[];

export function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

export function getCertificadoByCode(code: string): Certificado | null {
  const codigo = normalizeCode(code);
  return registros.find((item) => normalizeCode(item.codigo) === codigo) ?? null;
}
