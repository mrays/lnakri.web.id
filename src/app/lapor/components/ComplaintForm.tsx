'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { Shield, Upload, X, CheckCircle, Send } from 'lucide-react';

type ComplaintFormData = {
  reporterName: string;
  email: string;
  phone: string;
  subject: string;
  location: string;
  kronologis: string;
  involvedParties: string;
  estimatedLoss: string;
  agreeTerms: boolean;
};

export default function ComplaintForm() {
  const [buktiFiles, setBuktiFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ComplaintFormData>();

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBuktiFiles(prev => [...prev, ...files].slice(0, 5));
  };

  const removeFile = (idx: number) => {
    setBuktiFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setSubmitting(true);
    try {
      const id = 'LNAKRI-' + Date.now().toString().slice(-6);
      
      const formData = new FormData();
      formData.append('requestCode', id);
      formData.append('type', 'keluhan');
      formData.append('sourcePage', 'public-complaint-form');
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append files
      buktiFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/complaints', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setTicketId(result.requestCode);
        setSubmitted(true);
        toast.success(`Laporan berhasil dikirim! Nomor tiket: ${result.requestCode}`);

        // Kirim notifikasi email
        try {
          await fetch('/api/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reportId: result.requestCode }),
          });
        } catch (emailError) {
          console.error('Gagal mengirim notifikasi email:', emailError);
        }
        
      } else {
        toast.error('Gagal mengirim laporan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      toast.error('Terjadi kesalahan saat mengirim laporan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-green-200 shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="font-800 text-[#1a3a5c] text-xl mb-2">Laporan Berhasil Dikirim!</h2>
          <p className="text-gray-600 mb-4">Terima kasih telah berani bersuara. Laporan Anda akan segera ditindaklanjuti oleh tim LNAKRI NGO.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Nomor Tiket Laporan</div>
            <div className="text-2xl font-800 text-[#1a3a5c] tracking-widest">{ticketId}</div>
            <p className="text-xs text-gray-500 mt-2">Simpan nomor ini untuk memantau status laporan Anda</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2 justify-center"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Status: <strong className="text-blue-700">Diterima</strong></div>
            <p>Anda akan menerima notifikasi melalui email saat status laporan berubah.</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSubmitted(false); reset(); setBuktiFiles([]); }} className="btn-outline text-sm py-2">Buat Laporan Baru</button>
            <button onClick={() => {}} className="btn-primary text-sm py-2">Cek Status Laporan</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Logo kecil kiri atas form */}
      <div className="flex items-center gap-3 mb-6">
        <AppImage
          src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
          alt="Logo kecil LNAKRI di pojok kiri atas form keluhan"
          width={36}
          height={36}
          className="opacity-80"
        />
        <div>
          <h2 className="font-800 text-[#1a3a5c] text-xl flex items-center gap-2"><Shield size={20} className="text-red-700" /> Form Keluhan Korupsi</h2>
          <p className="text-gray-500 text-sm">Semua laporan bersifat rahasia dan ditangani secara profesional</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-amber-800 text-sm font-600">⚠️ Penting: Pastikan informasi yang Anda berikan adalah fakta yang dapat dipertanggungjawabkan. Laporan palsu dapat dikenai sanksi hukum.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Data Pelapor */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Data Pelapor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nama Pelapor <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-1.5">Identitas pelapor dijaga kerahasiaannya sesuai UU Perlindungan Saksi</p>
              <input {...register('reporterName', { required: 'Nama pelapor wajib diisi' })} className="input-field" placeholder="Nama lengkap Anda" />
              {errors.reporterName && <p className="text-red-500 text-xs mt-1">{errors.reporterName.message}</p>}
            </div>
            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-1.5">Untuk notifikasi status laporan</p>
              <input {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' } })} type="email" className="input-field" placeholder="email@contoh.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Nomor WhatsApp</label>
              <input {...register('phone')} className="input-field" placeholder="08xxx (opsional)" />
            </div>
          </div>
        </div>

        {/* Detail Laporan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Detail Laporan</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Subjek / Judul Laporan <span className="text-red-500">*</span></label>
              <input {...register('subject', { required: 'Subjek laporan wajib diisi' })} className="input-field" placeholder="Contoh: Dugaan korupsi proyek jalan desa Kab. X senilai Rp Y" />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <label className="label">Lokasi Kejadian <span className="text-red-500">*</span></label>
              <input {...register('location', { required: 'Lokasi kejadian wajib diisi' })} className="input-field" placeholder="Contoh: Kecamatan X, Kabupaten Y, Provinsi Z" />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <label className="label">Pihak yang Terlibat</label>
              <input {...register('involvedParties')} className="input-field" placeholder="Nama jabatan/instansi pihak yang diduga terlibat (tanpa nama pribadi jika belum pasti)" />
            </div>
            <div>
              <label className="label">Estimasi Kerugian Negara</label>
              <input {...register('estimatedLoss')} className="input-field" placeholder="Contoh: Rp 500.000.000 (opsional)" />
            </div>
            <div>
              <label className="label">Kronologis Kejadian <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-1.5">Jelaskan secara rinci: kapan, di mana, siapa, apa yang terjadi, dan bagaimana Anda mengetahuinya</p>
              <textarea {...register('kronologis', { required: 'Kronologis wajib diisi', minLength: { value: 100, message: 'Kronologis minimal 100 karakter' } })}
                className="input-field resize-none" rows={8}
                placeholder="Tuliskan kronologis lengkap kejadian di sini. Sertakan tanggal, waktu, tempat, dan fakta-fakta yang Anda ketahui..." />
              {errors.kronologis && <p className="text-red-500 text-xs mt-1">{errors.kronologis.message}</p>}
            </div>
          </div>
        </div>

        {/* Upload Bukti */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-2 pb-2 border-b border-gray-100">Upload Dokumen Bukti</h3>
          <p className="text-xs text-gray-500 mb-4">Upload foto, dokumen, atau file pendukung (maks. 5 file, JPG/PNG/PDF, maks. 10MB per file)</p>
          <div className="space-y-3">
            {buktiFiles.map((file, idx) => (
              <div key={`bukti-file-${idx}`} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={15} />
                </button>
              </div>
            ))}
            {buktiFiles.length < 5 && (
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-red-400 transition-colors">
                <Upload size={24} className="text-gray-400" />
                <span className="text-sm text-gray-600 font-600">Klik untuk upload dokumen bukti</span>
                <span className="text-xs text-gray-400">JPG, PNG, PDF (maks. 10MB per file, maks. 5 file)</span>
                <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileAdd} />
              </label>
            )}
          </div>
        </div>

        {/* Persetujuan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input {...register('agreeTerms', { required: 'Anda harus menyetujui pernyataan ini' })}
              type="checkbox" className="mt-1 w-4 h-4 accent-red-700" />
            <span className="text-sm text-gray-700 leading-relaxed">
              Saya menyatakan bahwa informasi yang saya berikan adalah <strong>benar dan dapat dipertanggungjawabkan</strong>. Saya memahami bahwa laporan palsu dapat dikenai sanksi hukum. Saya menyetujui bahwa identitas saya akan dijaga kerahasiaannya sesuai UU No. 13 Tahun 2006 tentang Perlindungan Saksi dan Korban.
            </span>
          </label>
          {errors.agreeTerms && <p className="text-red-500 text-xs mt-2">{errors.agreeTerms.message}</p>}
        </div>

        <button type="submit" disabled={submitting}
          className="w-full btn-primary justify-center py-4 text-base disabled:opacity-60">
          {submitting ? (
            <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Mengirim Laporan...</>
          ) : (
            <><Send size={18} /> Kirim Laporan Korupsi</>
          )}
        </button>
      </form>
    </div>
  );
}