'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Save, Building2, CreditCard, FileText } from 'lucide-react';

type OrgForm = {
  name: string;
  shortName: string;
  description: string;
  vision: string;
  mission: string;
  foundedDate: string;
  foundedCity: string;
  ahuNumber: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  greeting: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  complaintPageTagline: string;
  complaintPageTitle: string;
  complaintPageSubtitle: string;
};

export default function OrgProfileEditor() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrgForm>();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/organization-profile');
      const data = await res.json();
      if (res.ok) {
        reset(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Gagal mengambil data profil.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: OrgForm) => {
    setSaving(true);
    try {
      const res = await fetch('/api/organization-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSaved(true);
        toast.success('Profil organisasi berhasil disimpan.');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error('Gagal menyimpan profil.');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Memuat data profil...</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-800 text-[#1a3a5c]">Profil Organisasi</h2>
        <p className="text-gray-500 text-sm">Perbarui informasi resmi LNAKRI NGO yang ditampilkan ke publik</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Identitas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 flex items-center gap-2"><Building2 size={16} /> Identitas Organisasi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nama Lengkap Organisasi</label>
              <input {...register('name', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="label">Nama Singkat</label>
              <input {...register('shortName')} className="input-field" />
            </div>
            <div>
              <label className="label">No. AHU Kemenkumham</label>
              <input {...register('ahuNumber')} className="input-field" />
            </div>
            <div>
              <label className="label">Tanggal Berdiri</label>
              <p className="text-xs text-gray-500 mb-1.5">Format: YYYY-MM-DD</p>
              <input {...register('foundedDate')} type="date" className="input-field" />
            </div>
            <div>
              <label className="label">Kota Pendirian</label>
              <input {...register('foundedCity')} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Deskripsi Organisasi</label>
              <textarea {...register('description')} className="input-field resize-none" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Visi</label>
              <textarea {...register('vision')} className="input-field resize-none" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Misi</label>
              <textarea {...register('mission')} className="input-field resize-none" rows={3} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Salam / Tagline Organisasi</label>
              <p className="text-xs text-gray-500 mb-1.5">Kalimat salam yang ditampilkan di halaman utama</p>
              <input {...register('greeting')} className="input-field" />
            </div>
          </div>
        </div>

        {/* Kontak */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4">Kontak & Media Sosial</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nomor WhatsApp Hotline</label>
              <input {...register('phone')} className="input-field" placeholder="08xxx" />
            </div>
            <div>
              <label className="label">Email Resmi</label>
              <input {...register('email')} type="email" className="input-field" />
            </div>
            <div>
              <label className="label">Instagram</label>
              <input {...register('instagram')} className="input-field" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="label">TikTok</label>
              <input {...register('tiktok')} className="input-field" placeholder="https://tiktok.com/@..." />
            </div>
            <div>
              <label className="label">Facebook</label>
              <input {...register('facebook')} className="input-field" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="label">Alamat</label>
              <input {...register('address')} className="input-field" />
            </div>
          </div>
        </div>

        {/* Rekening Bank */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 flex items-center gap-2"><CreditCard size={16} /> Informasi Rekening Donasi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Nama Bank</label>
              <input {...register('bankName')} className="input-field" placeholder="Contoh: Bank BCA" />
            </div>
            <div>
              <label className="label">Nomor Rekening</label>
              <input {...register('bankAccountNumber')} className="input-field" placeholder="Contoh: 5790248335" />
            </div>
            <div>
              <label className="label">Atas Nama</label>
              <input {...register('bankAccountName')} className="input-field" placeholder="Contoh: Roddy Maruli Mazmur" />
            </div>
          </div>
        </div>

        {/* Konten Halaman Keluhan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 flex items-center gap-2"><FileText size={16} /> Konten Halaman Keluhan</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label">Tagline / Badge (Kuning)</label>
              <input {...register('complaintPageTagline')} className="input-field" />
            </div>
            <div>
              <label className="label">Judul Utama</label>
              <input {...register('complaintPageTitle')} className="input-field" />
            </div>
            <div>
              <label className="label">Sub Judul / Deskripsi</label>
              <textarea {...register('complaintPageSubtitle')} className="input-field resize-none" rows={2} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-green-600 text-sm font-600 flex items-center gap-1.5">
              ✓ Tersimpan
            </span>
          )}
          <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 min-w-[150px] justify-center disabled:opacity-60">
            {saving ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Menyimpan...</> : <><Save size={15} /> Simpan Profil</>}
          </button>
        </div>
      </form>
    </div>
  );
}