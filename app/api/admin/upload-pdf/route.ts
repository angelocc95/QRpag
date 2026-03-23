import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo invalido' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Solo se permiten archivos PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const safeName = file.name.replace(/\s+/g, '-');
    const fileName = `${Date.now()}-${safeName}`;

    const { data, error } = await supabaseServer.storage
      .from('pdfs')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: urlData } = supabaseServer.storage.from('pdfs').getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al subir PDF' },
      { status: 500 }
    );
  }
}
