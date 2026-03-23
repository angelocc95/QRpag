'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Certificado } from '@/lib/certificados';

interface CertificadoConId extends Certificado {
  id?: number;
}

export default function AdminDashboard() {
  const [certificates, setCertificates] = useState<CertificadoConId[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificadoConId | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      router.push('/admin/login');
      return;
    }

    loadCertificates();
  }, [router]);

  async function loadCertificates() {
    try {
      setLoadError('');
      const res = await fetch('/api/admin/certificados', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Error loading certificates');
      }
      const payload = await res.json();
      setCertificates(payload.data || []);
    } catch {
      setLoadError('No se pudo cargar la lista de certificados. Recarga la pagina e intenta de nuevo.');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCert(codigo: string) {
    if (!confirm(`¿Eliminar ${codigo}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/certificados?codigo=${codigo}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error deleting certificate');
      loadCertificates();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  function openEditForm(cert: CertificadoConId) {
    setEditingCert(cert);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCert(null);
    loadCertificates();
  }

  function logout() {
    localStorage.removeItem('adminToken');
    router.push('/');
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Panel de Administrador</h1>
            <p className="text-slate-600 mt-1">Gestiona certificados y PDFs</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Botones */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => {
              setEditingCert(null);
              setShowForm(true);
            }}
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-semibold"
          >
            + Nuevo Certificado
          </button>
          <button
            onClick={() => setShowBulkForm(true)}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-semibold"
          >
            Carga Masiva CSV
          </button>
          <a
            href="/plantilla-certificados.csv"
            download
            className="px-6 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
          >
            Descargar Plantilla
          </a>
        </div>

        {/* Formulario */}
        {showForm && (
          <FormCertificado
            onClose={closeForm}
            editingCert={editingCert}
          />
        )}

        {showBulkForm && (
          <BulkUploadForm
            onClose={() => setShowBulkForm(false)}
            onSuccess={(message) => {
              loadCertificates();
              setNotice(message);
            }}
          />
        )}

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando certificados...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-700 font-medium">No hay certificados para mostrar.</p>
            <p className="text-slate-500 text-sm mt-1">Agrega uno manualmente o usa la carga masiva CSV.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Curso</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm font-semibold text-slate-900">{cert.codigo}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{cert.nombre}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{cert.curso}</td>
                    <td className="px-6 py-3 text-sm space-x-2">
                      <button
                        onClick={() => openEditForm(cert)}
                        className="text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteCert(cert.codigo)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {notice && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {notice}
          </div>
        )}
      </div>
    </main>
  );
}

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

type ReportRow = {
  codigo: string;
  estado: 'OK' | 'ERROR';
  detalle: string;
};

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');
}

function findHeaderIndex(headers: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = headers.indexOf(candidate);
    if (idx >= 0) return idx;
  }
  return -1;
}

function normalizeCsvDate(value: string): string {
  const trimmed = value.trim();

  // Already ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Excel common format: DD/MM/YYYY or DD-MM-YYYY
  const match = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }

  // Keep original value if it doesn't match known patterns.
  return trimmed;
}

function parseCsvLine(line: string, separator: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = i + 1 < line.length ? line[i + 1] : '';

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === separator && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseBulkCsv(content: string): { rows: BulkCertificado[]; error?: string } {
  let lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Excel can export CSV with a delimiter hint in the first line, e.g. "sep=,".
  if (lines[0]?.toLowerCase().startsWith('sep=')) {
    lines = lines.slice(1);
  }

  if (lines.length < 2) {
    return { rows: [], error: 'El CSV debe incluir encabezado y al menos una fila.' };
  }

  const headerLine = lines[0];
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const separator = semicolonCount > commaCount ? ';' : ',';

  const headers = parseCsvLine(headerLine, separator).map((header) => normalizeHeader(header));
  const idxCodigo = findHeaderIndex(headers, ['codigo', 'codigocertificado', 'code']);
  const idxNombre = findHeaderIndex(headers, ['nombre', 'nombrecompleto', 'participante']);
  const idxCurso = findHeaderIndex(headers, ['curso', 'programa']);
  const idxFecha = findHeaderIndex(headers, ['fecha', 'fechaemision', 'fechaemisioncertificado']);
  const idxPdf = findHeaderIndex(headers, ['pdf', 'pdfurl', 'urlpdf']);

  if (idxCodigo < 0 || idxNombre < 0 || idxCurso < 0 || idxFecha < 0) {
    return {
      rows: [],
      error: 'Encabezados requeridos: codigo,nombre,curso,fecha (pdf es opcional).'
    };
  }

  const rows: BulkCertificado[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], separator);
    const codigo = (cols[idxCodigo] || '').trim();
    const nombre = (cols[idxNombre] || '').trim();
    const curso = (cols[idxCurso] || '').trim();
    const fecha = normalizeCsvDate((cols[idxFecha] || '').trim());
    const pdf = idxPdf >= 0 ? (cols[idxPdf] || '').trim() : '';

    if (!codigo || !nombre || !curso || !fecha) {
      return {
        rows: [],
        error: `Fila ${i + 1} incompleta. Verifica codigo, nombre, curso y fecha.`
      };
    }

    rows.push({ codigo, nombre, curso, fecha, pdf });
  }

  return { rows };
}

function BulkUploadForm({
  onClose,
  onSuccess
}: {
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [rows, setRows] = useState<BulkCertificado[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  function chunkRows<T>(input: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < input.length; i += size) {
      chunks.push(input.slice(i, i + size));
    }
    return chunks;
  }

  function normalizeCode(value: string): string {
    return value.trim().toLowerCase();
  }

  function escapeCsvValue(value: string): string {
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  function createReportFile(reportRows: ReportRow[]) {
    if (reportUrl) {
      URL.revokeObjectURL(reportUrl);
    }

    const lines = [
      'codigo,estado,detalle',
      ...reportRows.map((row) => [row.codigo, row.estado, row.detalle].map(escapeCsvValue).join(','))
    ];
    const csvContent = `sep=,\n${lines.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = URL.createObjectURL(blob);
    setReportUrl(objectUrl);
  }

  function fileNameWithoutExtension(fileName: string): string {
    return fileName.replace(/\.[^/.]+$/, '');
  }

  async function uploadSinglePdf(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload-pdf', {
      method: 'POST',
      body: formData
    });

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.error || `Error al subir ${file.name}`);
    }

    return payload.url as string;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = parseBulkCsv(text);

    if (parsed.error) {
      setError(parsed.error);
      setRows([]);
      setResult('');
      return;
    }

    setRows(parsed.rows);
    setError('');
    setResult(`${parsed.rows.length} registros listos para subir.`);
  }

  function handlePdfFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const invalid = files.find((file) => file.type !== 'application/pdf');

    if (invalid) {
      setError('Todos los archivos deben ser PDF.');
      return;
    }

    setPdfFiles(files);
    setError('');

    if (files.length > 0) {
      setResult(`${files.length} PDFs listos para asociar por codigo.`);
    }
  }

  async function handleBulkSubmit() {
    if (rows.length === 0) {
      setError('Primero selecciona un archivo CSV valido.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult('');
      setReportUrl('');

      const reportRows: ReportRow[] = [];

      let processedRows = [...rows];
      let linkedPdfs = 0;

      if (pdfFiles.length > 0) {
        const fileByCode = new Map<string, File>();
        for (const file of pdfFiles) {
          fileByCode.set(normalizeCode(fileNameWithoutExtension(file.name)), file);
        }

        const rowsWithUploadedPdf: BulkCertificado[] = [];

        for (const row of rows) {
          const matchedFile = fileByCode.get(normalizeCode(row.codigo));
          if (!matchedFile) {
            rowsWithUploadedPdf.push(row);
            continue;
          }

          try {
            const uploadedUrl = await uploadSinglePdf(matchedFile);
            linkedPdfs += 1;
            rowsWithUploadedPdf.push({ ...row, pdf: uploadedUrl });
          } catch (uploadErr) {
            reportRows.push({
              codigo: row.codigo,
              estado: 'ERROR',
              detalle: uploadErr instanceof Error ? uploadErr.message : 'Error al subir PDF'
            });
            rowsWithUploadedPdf.push(row);
          }
        }

        processedRows = rowsWithUploadedPdf;
      }

      const chunks = chunkRows(processedRows, 100);
      let totalProcessed = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunkRowsData = chunks[i];
        const res = await fetch('/api/admin/certificados/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: chunkRowsData })
        });

        const payload = await res.json();

        if (!res.ok) {
          for (const item of chunkRowsData) {
            reportRows.push({
              codigo: item.codigo,
              estado: 'ERROR',
              detalle: payload.error || `Error en carga masiva (lote ${i + 1})`
            });
          }
          continue;
        }

        totalProcessed += Number(payload.count || 0);

        const failedList: BulkFailure[] = Array.isArray(payload.failed) ? payload.failed : [];
        const failedByCode = new Map<string, string>();
        for (const failedItem of failedList) {
          failedByCode.set(normalizeCode(failedItem.codigo), failedItem.error);
        }

        for (const item of chunkRowsData) {
          const failure = failedByCode.get(normalizeCode(item.codigo));
          if (failure) {
            reportRows.push({ codigo: item.codigo, estado: 'ERROR', detalle: failure });
          } else {
            reportRows.push({ codigo: item.codigo, estado: 'OK', detalle: 'Procesado correctamente' });
          }
        }
      }

      createReportFile(reportRows);

      const okCount = reportRows.filter((row) => row.estado === 'OK').length;
      const errorCount = reportRows.filter((row) => row.estado === 'ERROR').length;

      setResult(
        `Carga masiva completada. Procesados: ${totalProcessed}. OK: ${okCount}. Errores: ${errorCount}. PDFs asociados: ${linkedPdfs}.`
      );
      onSuccess(
        `Carga masiva completada. Procesados: ${totalProcessed}. OK: ${okCount}. Errores: ${errorCount}. PDFs asociados: ${linkedPdfs}.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en carga masiva');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Carga Masiva de Certificados</h2>

        <p className="text-sm text-slate-600 mb-3">
          Formato CSV: <span className="font-semibold">codigo,nombre,curso,fecha,pdf</span>
        </p>
        <p className="text-xs text-slate-500 mb-4">
          El campo pdf es opcional. Si un codigo ya existe, se actualizara automaticamente. Tambien puedes
          subir varios PDFs y se asociaran por nombre de archivo igual al codigo.
        </p>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 mb-4">
          Ejemplo: CERT-100,Juan Perez,Excel Avanzado,2026-03-20,https://dominio.com/cert100.pdf
        </div>

        <input
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          disabled={loading}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
        />

        <div className="mt-4">
          <p className="text-sm text-slate-600 mb-2">PDFs opcionales (multiple)</p>
          <p className="text-xs text-slate-500 mb-2">
            Nombra los archivos como el codigo del certificado. Ejemplo: CERT-100.pdf
          </p>
          <input
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handlePdfFilesChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
          />
          {pdfFiles.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">{pdfFiles.length} PDFs seleccionados</p>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {result}
          </div>
        )}

        {reportUrl && (
          <a
            href={reportUrl}
            download="reporte-carga-masiva.csv"
            className="mt-3 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Descargar Reporte CSV
          </a>
        )}

        <div className="flex gap-3 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleBulkSubmit}
            disabled={loading || rows.length === 0}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:bg-slate-400 font-medium"
          >
            {loading ? 'Procesando...' : `Subir ${rows.length || 0} registros`}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormCertificado({
  onClose,
  editingCert
}: {
  onClose: () => void;
  editingCert: CertificadoConId | null;
}) {
  const [formData, setFormData] = useState({
    codigo: editingCert?.codigo || '',
    nombre: editingCert?.nombre || '',
    curso: editingCert?.curso || '',
    fecha: editingCert?.fecha || '',
    pdf: editingCert?.pdf || ''
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);

  async function uploadPdfToSupabase(file: File): Promise<string | null> {
    try {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Error al subir PDF');
      }

      return payload.url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir PDF');
      return null;
    } finally {
      setUploadingPdf(false);
    }
  }

  async function handlePdfFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    setPdfFile(file);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let pdfUrl = formData.pdf;

      // Si hay un archivo PDF nuevo, subirlo
      if (pdfFile) {
        const uploadedUrl = await uploadPdfToSupabase(pdfFile);
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        pdfUrl = uploadedUrl;
      }

      const dataToSave = {
        ...formData,
        pdf: pdfUrl
      };

      let res;
      if (editingCert?.id) {
        // Actualizar certificado existente
        res = await fetch('/api/admin/certificados', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCert.id, ...dataToSave })
        });
      } else {
        // Crear nuevo certificado
        res = await fetch('/api/admin/certificados', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error saving certificate');
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {editingCert ? 'Editar Certificado' : 'Nuevo Certificado'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="CERT-001"
              disabled={!!editingCert}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Juan Perez"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Curso</label>
            <input
              type="text"
              value={formData.curso}
              onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
              placeholder="Excel Avanzado"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Archivo PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfFileChange}
              disabled={uploadingPdf}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {pdfFile && (
              <p className="text-xs text-green-600 mt-1">✓ {pdfFile.name}</p>
            )}
            {formData.pdf && !pdfFile && (
              <p className="text-xs text-slate-500 mt-1">Actual: {formData.pdf.split('/').pop()}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploadingPdf}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploadingPdf}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-slate-400 font-medium"
            >
              {uploadingPdf ? 'Subiendo PDF...' : loading ? 'Guardando...' : editingCert ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
