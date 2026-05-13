'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: 'urgent' | 'penting' | 'info';
  date: string;
  active: boolean;
};

type AnnForm = { title: string; content: string; priority: 'urgent' | 'penting' | 'info' };

const initialAnn: Announcement[] = [
  { id: 'ann-admin-001', title: 'Pembukaan Pendaftaran Relawan Anti Korupsi LNAKRI 2026', content: 'LNAKRI NGO membuka pendaftaran relawan anti korupsi untuk periode 2026. Pendaftaran dibuka hingga 30 April 2026.', priority: 'penting', date: '17 April 2026', active: true },
  { id: 'ann-admin-002', title: 'Perubahan Prosedur Pengaduan: Wajib Sertakan KTP Digital', content: 'Mulai 1 Mei 2026, setiap pengaduan korupsi yang masuk ke LNAKRI wajib menyertakan salinan KTP digital pelapor.', priority: 'urgent', date: '14 April 2026', active: true },
  { id: 'ann-admin-003', title: 'Jadwal Pelayanan Konsultasi Hukum Gratis — April 2026', content: 'LNAKRI NGO menyelenggarakan konsultasi hukum gratis setiap Rabu dan Jumat pukul 09.00–12.00 WIB.', priority: 'info', date: '8 April 2026', active: true },
];

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Mendesak', color: 'bg-red-100 text-red-700' },
  penting: { label: 'Penting', color: 'bg-amber-100 text-amber-700' },
  info: { label: 'Informasi', color: 'bg-blue-100 text-blue-700' },
};

export default function AnnouncementManagement() {
  const [annList, setAnnList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AnnForm>();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (res.ok) {
        setAnnList(data.announcements);
      } else {
        toast.error(data.message || 'Gagal memuat pengumuman');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', content: '', priority: 'info' });
    setShowForm(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditing(ann);
    setValue('title', ann.title);
    setValue('content', ann.content);
    setValue('priority', ann.priority);
    setShowForm(true);
  };

  const onSubmit = async (data: AnnForm) => {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/announcements/${editing.id}` : '/api/announcements', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (res.ok) {
        if (editing) {
          setAnnList((prev) => prev.map((a) => a.id === editing.id ? { ...a, ...data } : a));
          toast.success('Pengumuman berhasil diperbarui.');
        } else {
          setAnnList((prev) => [resData.announcement, ...prev]);
          toast.success('Pengumuman baru berhasil dibuat.');
        }
        setShowForm(false);
        reset();
      } else {
        toast.error(resData.message || 'Gagal menyimpan pengumuman');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAnnList((prev) => prev.filter((a) => a.id !== id));
        toast.success('Pengumuman berhasil dihapus.');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal menghapus pengumuman');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleActive = async (id: string) => {
    const ann = annList.find((a) => a.id === id);
    if (!ann) return;

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !ann.active }),
      });
      if (res.ok) {
        setAnnList((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
        toast.success(`Pengumuman berhasil ${!ann.active ? 'diaktifkan' : 'dinonaktifkan'}.`);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal mengubah status');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-800 text-[#1a3a5c]">Manajemen Pengumuman</h2>
          <p className="text-gray-500 text-sm">Kelola pengumuman resmi yang ditampilkan ke publik</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm"><Plus size={16} /> Buat Pengumuman</button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data pengumuman...</div>
        ) : annList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Belum ada pengumuman.</div>
        ) : (
          annList.map(ann => {
            const prio = priorityConfig[ann.priority];
            return (
              <div key={ann.id} className={`bg-white rounded-xl border shadow-sm p-5 transition-all duration-200 ${ann.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`text-xs font-700 px-2.5 py-0.5 rounded-full ${prio.color}`}>{prio.label}</span>
                      <span className="text-xs text-gray-500">{ann.date}</span>
                      <span className={`text-xs font-600 px-2 py-0.5 rounded-full ${ann.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {ann.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <h3 className="font-700 text-[#1a3a5c] text-base mb-2">{ann.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{ann.content}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(ann.id)}
                      className={`text-xs font-600 px-3 py-1.5 rounded-lg border transition-colors ${ann.active ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-green-300 text-green-600 hover:bg-green-50'}`}>
                      {ann.active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button onClick={() => openEdit(ann)} className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteConfirm(ann.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-800 text-[#1a3a5c]">{editing ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">Judul Pengumuman <span className="text-red-500">*</span></label>
                <input {...register('title', { required: 'Judul wajib diisi' })} className="input-field" placeholder="Judul pengumuman..." />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="label">Prioritas</label>
                <select {...register('priority')} className="input-field bg-white">
                  <option value="info">Informasi</option>
                  <option value="penting">Penting</option>
                  <option value="urgent">Mendesak</option>
                </select>
              </div>
              <div>
                <label className="label">Isi Pengumuman <span className="text-red-500">*</span></label>
                <textarea {...register('content', { required: 'Isi pengumuman wajib diisi' })} className="input-field resize-none" rows={5} placeholder="Tulis isi pengumuman..." />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm py-2">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary text-sm py-2 min-w-[130px] justify-center disabled:opacity-60">
                  {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Menyimpan...</> : <><Save size={14} />{editing ? 'Simpan' : 'Publikasikan'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-600" /></div>
            <h3 className="font-800 text-center text-[#1a3a5c] text-lg mb-2">Hapus Pengumuman?</h3>
            <p className="text-gray-600 text-sm text-center mb-5">Pengumuman ini akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline text-sm py-2 justify-center">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-700 hover:bg-red-800 text-white font-700 text-sm py-2 rounded-lg transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}