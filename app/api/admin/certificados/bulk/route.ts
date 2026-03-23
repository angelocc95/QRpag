import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

type BulkCertificado = {
  codigo: string;
  nombre: string;
  curso: string;
  fecha: string;
  pdf?: string;
};

type BulkFailure = {
  codigo: string;
  error: string;
};

function chunkArray<T>(input: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
}

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

    const chunks = chunkArray(rows, 100);
    let totalProcessed = 0;
    const failed: BulkFailure[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const { error, data } = await supabaseServer
        .from('certificados')
        .upsert(chunk, { onConflict: 'codigo' })
        .select('codigo');

      if (error) {
        // If a chunk fails, retry row-by-row to isolate bad records and continue.
        for (const row of chunk) {
          const { error: rowError, data: rowData } = await supabaseServer
            .from('certificados')
            .upsert([row], { onConflict: 'codigo' })
            .select('codigo');

          if (rowError) {
            failed.push({ codigo: row.codigo, error: rowError.message });
            continue;
          }

          totalProcessed += rowData?.length ?? 1;
        }

        continue;
      }

      totalProcessed += data?.length ?? chunk.length;
    }

    return NextResponse.json({ success: true, count: totalProcessed, failed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error en carga masiva' },
      { status: 500 }
    );
  }
}
