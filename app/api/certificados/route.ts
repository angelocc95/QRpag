import { getCertificadoByCode, normalizeCode } from "@/lib/certificados";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("codigo");

  if (!codigo) {
    return Response.json({ error: "Codigo requerido" }, { status: 400 });
  }

  const cleanCode = normalizeCode(codigo);
  const certificado = await getCertificadoByCode(cleanCode);

  if (!certificado) {
    return Response.json({ error: "Certificado no encontrado" }, { status: 404 });
  }

  return Response.json(certificado);
}
