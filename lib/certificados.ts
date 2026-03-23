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
      .ilike("codigo", `%${codigo}%`)
      .single();

    if (error || !data) return null;
    
    return {
      codigo: data.codigo,
      nombre: data.nombre,
      curso: data.curso,
      fecha: data.fecha,
      pdf: data.pdf
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
