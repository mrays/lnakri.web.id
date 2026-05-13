'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { Plus, Edit2, Trash2, X, Save, Upload, Loader2 } from 'lucide-react';

type Founder = {
  id: string;
  name: string;
  jabatan: string;
  sk: string;
  desc: string;
  photo: string;
  photoAlt: string;
};

type FounderForm = {name: string;jabatan: string;sk: string;desc: string;};

const initialFounders: Founder[] = [
{ id: 'founder-admin-001', name: 'Roddy Maruli Mazmur', jabatan: 'Ketua Umum / Pendiri', sk: 'SK No. 001/LNAKRI/I/2017', desc: 'Pendiri dan Ketua Umum LNAKRI NGO sejak 17 Januari 2017.', photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1ad307cff-1776578694599.png", photoAlt: 'Pria profesional berjas sebagai pendiri dan ketua umum LNAKRI NGO' },
{ id: 'founder-admin-002', name: 'Siti Rahayu Wulandari', jabatan: 'Sekretaris Jenderal', sk: 'SK No. 002/LNAKRI/I/2017', desc: 'Sekretaris Jenderal LNAKRI NGO dengan keahlian hukum tata negara.', photo: "https://img.rocket.new/generatedImages/rocket_gen_img_18a539b82-1776578694313.png", photoAlt: 'Wanita profesional sebagai sekretaris jenderal NGO anti korupsi' },
{ id: 'founder-admin-003', name: 'Budi Santoso Harianto', jabatan: 'Bendahara Umum', sk: 'SK No. 003/LNAKRI/I/2017', desc: 'Bendahara Umum LNAKRI NGO, akuntan publik bersertifikat.', photo: "https://img.rocket.new/generatedImages/rocket_gen_img_16d4c4207-1776578693317.png", photoAlt: 'Pria profesional berbaju batik sebagai bendahara umum organisasi' }];


export default function FounderManagement() {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [isLoadingFounders, setIsLoadingFounders] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Founder | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FounderForm>();

  const loadFounders = useCallback(async () => {
    setIsLoadingFounders(true);
    try {
      const response = await fetch('/api/founders', { cache: 'no-store' });
      if (!response.ok) throw new Error('failed');
      const json = await response.json();
      if (Array.isArray(json.founders)) {
        setFounders(json.founders);
      }
    } catch {
      setFounders(initialFounders);
      toast.error('Data pendiri belum tersambung ke server, menampilkan data lokal.');
    } finally {
      setIsLoadingFounders(false);
    }
  }, []);

  useEffect(() => {
    loadFounders();
  }, [loadFounders]);

  const openCreate = () => {
    setEditing(null);
    setPhotoPreview('');
    setIsPhotoUploading(false);
    reset();
    setShowForm(true);
  };

  const openEdit = (f: Founder) => {
    setEditing(f);
    setPhotoPreview(f.photo);
    setIsPhotoUploading(false);
    setValue('name', f.name);
    setValue('jabatan', f.jabatan);
    setValue('sk', f.sk);
    setValue('desc', f.desc);
    setShowForm(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads/founder-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('failed');
      const json = await response.json();
      if (!json.url) throw new Error('failed');

      await new Promise((r) => setTimeout(r, 500));
      setPhotoPreview(json.url);
      toast.success('Foto berhasil diupload.');
    } catch {
      toast.error('Upload foto gagal. Coba file lain.');
    } finally {
      setIsPhotoUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (data: FounderForm) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        photo: photoPreview || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop',
        photoAlt: `Foto ${data.jabatan} ${data.name} LNAKRI NGO`,
      };

      if (editing) {
        const response = await fetch(`/api/founders/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('failed');
        toast.success('Data pendiri berhasil diperbarui.');
      } else {
        const response = await fetch('/api/founders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('failed');
        toast.success('Data pendiri baru berhasil ditambahkan.');
      }

      await loadFounders();
      setShowForm(false);
      reset();
    } catch {
      toast.error('Simpan gagal. Periksa koneksi database Anda.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/founders/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('failed');
      setFounders((prev) => prev.filter((f) => f.id !== id));
      setDeleteConfirm(null);
      toast.success('Data pendiri berhasil dihapus.');
    } catch {
      toast.error('Hapus gagal. Coba lagi.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-800 text-[#1a3a5c]">Manajemen Data Pendiri</h2>
          <p className="text-gray-500 text-sm">Kelola profil pendiri dan pengurus LNAKRI NGO</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm"><Plus size={16} /> Tambah Pendiri</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoadingFounders &&
        <div className="col-span-full bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 text-sm">
            Memuat data pendiri dari database...
          </div>
        }
        {founders.map((f) =>
        <div key={f.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-200">
            <div className="relative h-52 overflow-hidden">
              <AppImage src={f.photo} alt={f.photoAlt} fill className="object-cover object-top" sizes="25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                  <div className="text-xs font-700 text-[#1a3a5c]">{f.jabatan}</div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-700 text-[#1a3a5c] text-sm mb-1">{f.name}</h3>
              <div className="text-xs text-gray-500 mb-2">{f.sk}</div>
              <p className="text-xs text-gray-600 line-clamp-2 mb-3">{f.desc}</p>
              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button onClick={() => openEdit(f)} className="flex-1 flex items-center justify-center gap-1 text-xs font-600 text-amber-600 hover:bg-amber-50 py-1.5 rounded-lg transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(f.id)} className="flex-1 flex items-center justify-center gap-1 text-xs font-600 text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slide-up max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-800 text-[#1a3a5c]">{editing ? 'Edit Data Pendiri' : 'Tambah Pendiri Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="label">Foto Jabatan</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {isPhotoUploading ?
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-1">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-[10px] font-600">Mengupload...</span>
                      </div> :
                  photoPreview ?
                  <AppImage src={photoPreview} alt="Preview foto pendiri yang akan diupload" width={80} height={80} className="w-full h-full object-cover" unoptimized={photoPreview.startsWith('blob:') || photoPreview.startsWith('data:')} /> :

                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center">Belum ada foto</div>
                  }
                  </div>
                  <label className={`flex-1 border-2 border-dashed rounded-xl p-4 text-center transition-colors ${isPhotoUploading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 cursor-pointer hover:border-red-400'}`}>
                    <Upload size={18} className="text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-500">{isPhotoUploading ? 'Sedang mengupload...' : 'Upload Foto'}</span>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png"
                  disabled={isPhotoUploading}
                  onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>
              <div>
                <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
                <input {...register('name', { required: 'Nama wajib diisi' })} className="input-field" placeholder="Nama lengkap pendiri" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Jabatan <span className="text-red-500">*</span></label>
                <input {...register('jabatan', { required: 'Jabatan wajib diisi' })} className="input-field" placeholder="Contoh: Ketua Umum / Pendiri" />
                {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan.message}</p>}
              </div>
              <div>
                <label className="label">Nomor SK <span className="text-red-500">*</span></label>
                <input {...register('sk', { required: 'Nomor SK wajib diisi' })} className="input-field" placeholder="Contoh: SK No. 001/LNAKRI/I/2017" />
                {errors.sk && <p className="text-red-500 text-xs mt-1">{errors.sk.message}</p>}
              </div>
              <div>
                <label className="label">Deskripsi Singkat</label>
                <textarea {...register('desc')} className="input-field resize-none" rows={3} placeholder="Deskripsi singkat tentang pendiri..." />
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm py-2">Batal</button>
                <button type="submit" disabled={saving || isPhotoUploading} className="btn-primary text-sm py-2 min-w-[130px] justify-center disabled:opacity-60">
                  {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></> : <><Save size={14} />{editing ? 'Simpan' : 'Tambahkan'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      {deleteConfirm &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-600" /></div>
            <h3 className="font-800 text-center text-[#1a3a5c] mb-2">Hapus Data Pendiri?</h3>
            <p className="text-gray-600 text-sm text-center mb-5">Data ini akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline text-sm py-2 justify-center">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-700 text-white font-700 text-sm py-2 rounded-lg hover:bg-red-800 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      }
    </div>);

}