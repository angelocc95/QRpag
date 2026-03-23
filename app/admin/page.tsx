'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Certificado } from '@/lib/certificados';

interface CertificadoConId extends Certificado {
  id?: number;
}

export default function AdminDashboard() {
  const [certificates, setCertificates] = useState<CertificadoConId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      const { data } = await supabase.from('certificados').select('*');
      setCertificates(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCert(codigo: string) {
    if (!confirm(`¿Eliminar ${codigo}?`)) return;
    
    await supabase.from('certificados').delete().eq('codigo', codigo);
    loadCertificates();
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
        </div>

        {/* Formulario */}
        {showForm && (
          <FormCertificado
            onClose={closeForm}
            editingCert={editingCert}
          />
        )}

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando certificados...</p>
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
      </div>
    </main>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingCert?.id) {
        // Actualizar certificado existente
        const { error: updateError } = await supabase
          .from('certificados')
          .update(formData)
          .eq('id', editingCert.id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo certificado
        const { error: insertError } = await supabase
          .from('certificados')
          .insert([formData]);

        if (insertError) throw insertError;
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
            <label className="block text-sm font-medium text-slate-700 mb-1">URL del PDF</label>
            <input
              type="url"
              value={formData.pdf}
              onChange={(e) => setFormData({ ...formData, pdf: e.target.value })}
              placeholder="https://..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="text-xs text-slate-500 mt-1">
              Sube el PDF a Supabase Storage y pega la URL pública aquí
            </p>
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
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-slate-400 font-medium"
            >
              {loading ? 'Guardando...' : editingCert ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
