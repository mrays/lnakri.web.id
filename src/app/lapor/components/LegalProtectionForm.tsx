'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { Shield, Upload, X, CheckCircle, Send, Lock } from 'lucide-react';

type ProtectionFormData = {
  fullName: string;
  email: string;
  phone: string;
  nik: string;
  address: string;
  peranDalamKasus: string;
  namaKasus: string;
  instansiTerkait: string;
  ancamanYangDiterima: string;
  kronologis: string;
  sudahLaporLPSK: string;
  butuhPerlindunganFisik: boolean;
  butuhPerlindunganIdentitas: boolean;
  butuhPerlindunganHukum: boolean;
  agreeTerms: boolean;
};

export default function LegalProtectionForm() {
  const [buktiFiles, setBuktiFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [draftId, setDraftId] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProtectionFormData>();

  const onSubmit = async (data: ProtectionFormData) => {
    setSubmitting(true);
    // TODO: Connect to backend POST /api/legal-protection with FormData
    await new Promise(r => setTimeout(r, 1500));
    const id = 'LPSK-DRAFT-' + Date.now().toString().slice(-6);
    setDraftId(id);
    setSubmitting(false);
    setSubmitted(true);
    toast.success(`Draft permohonan perlindungan hukum berhasil disimpan! ID: ${id}`);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-green-200 shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-green-600" />
          </div>
          <h2 className="font-800 text-[#1a3a5c] text-xl mb-2">Draft Perlindungan Hukum Diterima!</h2>
          <p className="text-gray-600 mb-2">Tim LNAKRI NGO akan memproses dan mendampingi Anda dalam pengajuan perlindungan resmi ke LPSK.</p>
          <p className="text-sm text-green-700 font-600 mb-4">🔒 Identitas Anda sepenuhnya terjaga kerahasiaannya</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">ID Draft Permohonan</div>
            <div className="text-xl font-800 text-[#1a3a5c] tracking-widest">{draftId}</div>
          </div>
          <button onClick={() => { setSubmitted(false); reset(); setBuktiFiles([]); }} className="btn-primary text-sm py-2">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AppImage
          src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
          alt="Logo kecil LNAKRI di form perlindungan hukum saksi"
          width={36}
          height={36}
          className="opacity-80"
        />
        <div>
          <h2 className="font-800 text-[#1a3a5c] text-xl flex items-center gap-2">
            <Shield size={20} className="text-green-700" /> Draft Permohonan Perlindungan Hukum Saksi
          </h2>
          <p className="text-gray-500 text-sm">Untuk saksi atau pemberi informasi korupsi — identitas sepenuhnya terjaga</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Lock size={18} className="text-green-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-green-800 text-sm font-700 mb-1">Perlindungan Hukum Dijamin UU No. 13 Tahun 2006</p>
          <p className="text-green-700 text-sm">Sebagai saksi atau pelapor korupsi, Anda berhak mendapatkan perlindungan dari Lembaga Perlindungan Saksi dan Korban (LPSK). LNAKRI NGO akan mendampingi proses pengajuan Anda.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Data Pemohon Perlindungan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nama Lengkap (sesuai KTP) <span className="text-red-500">*</span></label>
              <input {...register('fullName', { required: 'Nama lengkap wajib diisi' })} className="input-field" placeholder="Nama lengkap sesuai KTP" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="label">NIK <span className="text-red-500">*</span></label>
              <input {...register('nik', { required: 'NIK wajib diisi', minLength: { value: 16, message: 'NIK harus 16 digit' }, maxLength: { value: 16, message: 'NIK harus 16 digit' } })} className="input-field" placeholder="16 digit NIK KTP" maxLength={16} />
              {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik.message}</p>}
            </div>
            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <input {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' } })} type="email" className="input-field" placeholder="email@contoh.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Nomor Telepon / WA <span className="text-red-500">*</span></label>
              <input {...register('phone', { required: 'Nomor telepon wajib diisi' })} className="input-field" placeholder="08xxx" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="label">Peran dalam Kasus <span className="text-red-500">*</span></label>
              <select {...register('peranDalamKasus', { required: 'Peran wajib dipilih' })} className="input-field bg-white">
                <option value="">— Pilih peran —</option>
                <option value="saksi">Saksi Korupsi</option>
                <option value="pelapor">Pelapor / Whistleblower</option>
                <option value="pemberi-informasi">Pemberi Informasi</option>
                <option value="korban">Korban Korupsi</option>
              </select>
              {errors.peranDalamKasus && <p className="text-red-500 text-xs mt-1">{errors.peranDalamKasus.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Alamat Lengkap</label>
              <input {...register('address')} className="input-field" placeholder="Alamat sesuai KTP (akan dijaga kerahasiaannya)" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Detail Kasus & Ancaman</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Nama / Deskripsi Kasus <span className="text-red-500">*</span></label>
              <input {...register('namaKasus', { required: 'Nama kasus wajib diisi' })} className="input-field" placeholder="Contoh: Kasus korupsi APBD Kab. X Tahun 2025" />
              {errors.namaKasus && <p className="text-red-500 text-xs mt-1">{errors.namaKasus.message}</p>}
            </div>
            <div>
              <label className="label">Instansi / Pihak Terkait</label>
              <input {...register('instansiTerkait')} className="input-field" placeholder="Instansi atau pihak yang terlibat dalam kasus" />
            </div>
            <div>
              <label className="label">Ancaman yang Diterima <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-1.5">Jelaskan bentuk ancaman atau intimidasi yang Anda terima sebagai saksi/pelapor</p>
              <textarea {...register('ancamanYangDiterima', { required: 'Deskripsi ancaman wajib diisi' })}
                className="input-field resize-none" rows={4}
                placeholder="Contoh: Saya menerima ancaman melalui pesan singkat, ancaman fisik, pemecatan dari pekerjaan, dll..." />
              {errors.ancamanYangDiterima && <p className="text-red-500 text-xs mt-1">{errors.ancamanYangDiterima.message}</p>}
            </div>
            <div>
              <label className="label">Kronologis Lengkap <span className="text-red-500">*</span></label>
              <textarea {...register('kronologis', { required: 'Kronologis wajib diisi', minLength: { value: 100, message: 'Minimal 100 karakter' } })}
                className="input-field resize-none" rows={8}
                placeholder="Jelaskan secara lengkap: bagaimana Anda mengetahui kasus ini, apa yang Anda saksikan, ancaman yang diterima, dan perlindungan apa yang Anda butuhkan..." />
              {errors.kronologis && <p className="text-red-500 text-xs mt-1">{errors.kronologis.message}</p>}
            </div>
            <div>
              <label className="label">Sudah Pernah Lapor ke LPSK?</label>
              <select {...register('sudahLaporLPSK')} className="input-field bg-white">
                <option value="belum">Belum pernah</option>
                <option value="sudah-proses">Sudah, masih dalam proses</option>
                <option value="sudah-ditolak">Sudah, tetapi ditolak</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Jenis Perlindungan yang Dibutuhkan</h3>
          <div className="space-y-3">
            {[
              { key: 'butuhPerlindunganFisik', label: 'Perlindungan Fisik', desc: 'Pengawalan dan perlindungan keamanan fisik dari ancaman' },
              { key: 'butuhPerlindunganIdentitas', label: 'Perlindungan Identitas', desc: 'Merahasiakan identitas dari publik dan pihak yang mengancam' },
              { key: 'butuhPerlindunganHukum', label: 'Perlindungan Hukum', desc: 'Pendampingan dan bantuan hukum selama proses persidangan' },
            ].map(item => (
              <label key={`prot-${item.key}`} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-green-50 transition-colors">
                <input {...register(item.key as keyof ProtectionFormData)} type="checkbox" className="mt-1 w-4 h-4 accent-green-700" />
                <div>
                  <div className="font-600 text-[#1a3a5c] text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-2 pb-2 border-b border-gray-100">Upload Dokumen Pendukung</h3>
          <p className="text-xs text-gray-500 mb-4">Upload bukti ancaman, surat, foto, atau dokumen pendukung lainnya</p>
          <div className="space-y-3">
            {buktiFiles.map((file, idx) => (
              <div key={`prot-file-${idx}`} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                <button type="button" onClick={() => setBuktiFiles(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500"><X size={15} /></button>
              </div>
            ))}
            {buktiFiles.length < 5 && (
              <label className="border-2 border-dashed border-green-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-green-500 transition-colors">
                <Upload size={24} className="text-green-400" />
                <span className="text-sm text-gray-600 font-600">Upload Bukti Pendukung</span>
                <span className="text-xs text-gray-400">JPG, PNG, PDF (maks. 10MB per file)</span>
                <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => { const f = Array.from(e.target.files || []); setBuktiFiles(prev => [...prev, ...f].slice(0, 5)); }} />
              </label>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input {...register('agreeTerms', { required: 'Persetujuan wajib dicentang' })} type="checkbox" className="mt-1 w-4 h-4 accent-green-700" />
            <span className="text-sm text-gray-700 leading-relaxed">
              Saya menyatakan bahwa semua informasi yang saya berikan adalah benar. Saya memahami bahwa LNAKRI NGO akan membantu proses pengajuan perlindungan hukum ke LPSK dan identitas saya akan dijaga sepenuhnya.
            </span>
          </label>
          {errors.agreeTerms && <p className="text-red-500 text-xs mt-2">{errors.agreeTerms.message}</p>}
        </div>

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 active:scale-95 text-white font-700 py-4 rounded-xl transition-all duration-150 text-base disabled:opacity-60">
          {submitting ? (
            <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Mengirim Draft...</>
          ) : (
            <><Send size={18} /> Kirim Draft Permohonan Perlindungan Hukum</>
          )}
        </button>
      </form>
    </div>
  );
}