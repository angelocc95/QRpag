import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

type BulkCertificado = {
  codigo: string;
  nombre: string;
  curso: string;
  fecha: string;
  pdf?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawRows = Array.isArray(body?.rows) ? body.rows : [];

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'No hay registros para procesar.' }, { status: 400 });
    }

    const rows: BulkCertificado[] = rawRows.map((row: Partial<BulkCertificado>) => ({
      codigo: String(row.codigo ?? '').trim(),
      nombre: String(row.nombre ?? '').trim(),
      curso: String(row.curso ?? '').trim(),
      fecha: String(row.fecha ?? '').trim(),
      pdf: String(row.pdf ?? '').trim()
    }));

    const invalidIndex = rows.findIndex(
      (row) => !row.codigo || !row.nombre || !row.curso || !row.fecha
    );

    if (invalidIndex >= 0) {
      return NextResponse.json(
        { error: `Fila invalida en posicion ${invalidIndex + 1}. Revisa campos obligatorios.` },
        { status: 400 }
      );
    }

    const { error, data } = await supabaseServer
      .from('certificados')
      .upsert(rows, { onConflict: 'codigo' })
      .select('codigo');

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, count: data?.length ?? rows.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en carga masiva' },
      { status: 500 }
    );
  }
}
