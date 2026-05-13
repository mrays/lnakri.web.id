'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { FileText, Upload, X, CheckCircle, Send } from 'lucide-react';

type LegalAidFormData = {
  reporterName: string;
  email: string;
  phone: string;
  address: string;
  jenisBantuan: string;
  kasusRingkas: string;
  kronologis: string;
  sudahLapor: string;
  agreeTerms: boolean;
};

const jenisBantuan = [
  'Pendampingan hukum sebagai saksi korupsi',
  'Konsultasi hukum terkait kasus korupsi',
  'Bantuan penyusunan laporan ke KPK/Kejaksaan',
  'Pendampingan sidang pengadilan tindak pidana korupsi',
  'Bantuan pengajuan perlindungan ke LPSK',
  'Bantuan hukum untuk korban korupsi',
  'Bantuan hukum terkait gratifikasi/suap',
  'Lainnya',
];

export default function LegalAidForm() {
  const [buktiFiles, setBuktiFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LegalAidFormData>();

  const onSubmit = async (data: LegalAidFormData) => {
    setSubmitting(true);
    try {
      const id = 'BH-' + Date.now().toString().slice(-6);
      
      const formData = new FormData();
      formData.append('requestCode', id);
      formData.append('type', 'bantuan_hukum');
      formData.append('sourcePage', 'legal-aid-form');
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append extraData as JSON string
      formData.append('extraData', JSON.stringify({
        address: data.address,
        jenisBantuan: data.jenisBantuan,
        kasusRingkas: data.kasusRingkas,
        sudahLapor: data.sudahLapor
      }));

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
        toast.success(`Permohonan bantuan hukum berhasil dikirim! Nomor: ${result.requestCode}`);
      } else {
        toast.error('Gagal mengirim permohonan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Failed to submit legal aid request:', error);
      toast.error('Terjadi kesalahan saat mengirim permohonan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-blue-600" />
          </div>
          <h2 className="font-800 text-[#1a3a5c] text-xl mb-2">Permohonan Bantuan Hukum Diterima!</h2>
          <p className="text-gray-600 mb-4">Tim hukum LNAKRI NGO akan segera menghubungi Anda untuk tindak lanjut.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Nomor Permohonan</div>
            <div className="text-2xl font-800 text-[#1a3a5c] tracking-widest">{ticketId}</div>
          </div>
          <button onClick={() => { setSubmitted(false); reset(); setBuktiFiles([]); }} className="btn-secondary text-sm py-2">Buat Permohonan Baru</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AppImage
          src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
          alt="Logo kecil LNAKRI di form bantuan hukum"
          width={36}
          height={36}
          className="opacity-80"
        />
        <div>
          <h2 className="font-800 text-[#1a3a5c] text-xl flex items-center gap-2">
            <FileText size={20} className="text-blue-700" /> Form Permohonan Bantuan Hukum
          </h2>
          <p className="text-gray-500 text-sm">Terdaftar di Kemenkumham No. AHU-0001643.AH.01.07.TAHUN 2017</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-blue-800 text-sm leading-relaxed">
          <strong>LNAKRI NGO</strong> menyediakan layanan bantuan hukum gratis bagi masyarakat yang terlibat dalam kasus korupsi sebagai saksi, pelapor, atau korban. Isi form berikut untuk mengajukan permohonan bantuan hukum.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Data Pemohon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
              <input {...register('reporterName', { required: 'Nama wajib diisi' })} className="input-field" placeholder="Nama lengkap Anda sesuai KTP" />
              {errors.reporterName && <p className="text-red-500 text-xs mt-1">{errors.reporterName.message}</p>}
            </div>
            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <input {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' } })} type="email" className="input-field" placeholder="email@contoh.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Nomor Telepon / WhatsApp <span className="text-red-500">*</span></label>
              <input {...register('phone', { required: 'Nomor telepon wajib diisi' })} className="input-field" placeholder="08xxx" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Alamat Lengkap <span className="text-red-500">*</span></label>
              <input {...register('address', { required: 'Alamat wajib diisi' })} className="input-field" placeholder="Alamat lengkap sesuai KTP" />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Detail Permohonan Bantuan Hukum</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Jenis Bantuan Hukum yang Dibutuhkan <span className="text-red-500">*</span></label>
              <select {...register('jenisBantuan', { required: 'Jenis bantuan wajib dipilih' })} className="input-field bg-white">
                <option value="">— Pilih jenis bantuan —</option>
                {jenisBantuan.map(j => (
                  <option key={`jenis-bh-${j}`} value={j}>{j}</option>
                ))}
              </select>
              {errors.jenisBantuan && <p className="text-red-500 text-xs mt-1">{errors.jenisBantuan.message}</p>}
            </div>
            <div>
              <label className="label">Ringkasan Kasus <span className="text-red-500">*</span></label>
              <input {...register('kasusRingkas', { required: 'Ringkasan kasus wajib diisi' })} className="input-field" placeholder="Ringkasan singkat kasus yang Anda hadapi" />
              {errors.kasusRingkas && <p className="text-red-500 text-xs mt-1">{errors.kasusRingkas.message}</p>}
            </div>
            <div>
              <label className="label">Sudah Melapor ke Instansi Mana?</label>
              <input {...register('sudahLapor')} className="input-field" placeholder="Contoh: Sudah lapor ke Polda, belum ada tindak lanjut (opsional)" />
            </div>
            <div>
              <label className="label">Kronologis Kasus <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-1.5">Jelaskan secara rinci kronologis kasus yang Anda hadapi dan bantuan hukum apa yang Anda butuhkan</p>
              <textarea {...register('kronologis', { required: 'Kronologis wajib diisi', minLength: { value: 100, message: 'Kronologis minimal 100 karakter' } })}
                className="input-field resize-none" rows={8}
                placeholder="Ceritakan kronologis kasus secara lengkap: kapan dimulai, siapa saja yang terlibat, apa yang sudah dilakukan, dan bantuan apa yang Anda butuhkan..." />
              {errors.kronologis && <p className="text-red-500 text-xs mt-1">{errors.kronologis.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-2 pb-2 border-b border-gray-100">Upload Dokumen Bukti-Bukti</h3>
          <p className="text-xs text-gray-500 mb-4">Sertakan dokumen pendukung seperti surat, foto, screenshot, atau dokumen hukum (maks. 5 file)</p>
          <div className="space-y-3">
            {buktiFiles.map((file, idx) => (
              <div key={`bh-file-${idx}`} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                <button type="button" onClick={() => setBuktiFiles(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><X size={15} /></button>
              </div>
            ))}
            {buktiFiles.length < 5 && (
              <label className="border-2 border-dashed border-blue-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-500 transition-colors">
                <Upload size={24} className="text-blue-400" />
                <span className="text-sm text-gray-600 font-600">Upload Dokumen Pendukung</span>
                <span className="text-xs text-gray-400">JPG, PNG, PDF (maks. 10MB per file)</span>
                <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => { const files = Array.from(e.target.files || []); setBuktiFiles(prev => [...prev, ...files].slice(0, 5)); }} />
              </label>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input {...register('agreeTerms', { required: 'Persetujuan wajib dicentang' })} type="checkbox" className="mt-1 w-4 h-4 accent-blue-700" />
            <span className="text-sm text-gray-700 leading-relaxed">
              Saya menyatakan bahwa informasi yang saya berikan adalah benar dan saya mengajukan permohonan bantuan hukum ini dengan itikad baik. Saya memahami bahwa LNAKRI NGO akan menghubungi saya untuk tindak lanjut.
            </span>
          </label>
          {errors.agreeTerms && <p className="text-red-500 text-xs mt-2">{errors.agreeTerms.message}</p>}
        </div>

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-700 py-4 rounded-xl transition-all duration-150 text-base disabled:opacity-60">
          {submitting ? (
            <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Mengirim Permohonan...</>
          ) : (
            <><Send size={18} /> Kirim Permohonan Bantuan Hukum</>
          )}
        </button>
      </form>
    </div>
  );
}