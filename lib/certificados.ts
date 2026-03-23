import { supabase } from "./supabase";

export type Certificado = {
  codigo: string;
  nombre: string;
  curso: string;
  fecha: string;
  pdf: string;
};

export function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

export async function getCertificadoByCode(code: string): Promise<Certificado | null> {
  const codigo = normalizeCode(code);
  
  try {
    const { data, error } = await supabase
      .from("certificados")
      .select("*")
      .ilike("codigo", codigo);

    if (error || !data || data.length === 0) return null;

    const exactMatch = data.find((item: any) => normalizeCode(String(item.codigo ?? "")) === codigo);
    const selected = exactMatch ?? data[0];
    
    return {
      codigo: selected.codigo,
      nombre: selected.nombre,
      curso: selected.curso,
      fecha: selected.fecha,
      pdf: selected.pdf
    };
  } catch {
    return null;
  }
}

export async function getCertificados(): Promise<Certificado[]> {
  try {
    const { data, error } = await supabase
      .from("certificados")
      .select("*");

    if (error || !data) return [];
    
    return data.map((item: any) => ({
      codigo: item.codigo,
      nombre: item.nombre,
      curso: item.curso,
      fecha: item.fecha,
      pdf: item.pdf
    }));
  } catch {
    return [];
  }
}
