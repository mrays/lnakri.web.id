'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { AlertTriangle, Upload, X, CheckCircle, Send, MapPin } from 'lucide-react';

type MbgForm = {
  reporterName: string;
  email: string;
  phone: string;
  sekolahNama: string;
  sekolahAlamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  googleMapsLink: string;
  tanggalKejadian: string;
  jenisPenyimpangan: string;
  kronologis: string;
  jumlahSiswa: string;
  agreeTerms: boolean;
};

const jenisPenyimpangan = [
  'Makanan tidak memenuhi standar gizi',
  'Porsi tidak sesuai ketentuan',
  'Makanan tidak layak konsumsi / basi',
  'Vendor tidak memenuhi standar kebersihan',
  'Anggaran tidak sesuai realisasi',
  'Program MBG tidak berjalan sama sekali',
  'Penyimpangan distribusi / tidak merata',
  'Korupsi dana MBG',
  'Lainnya',
];

export default function MbgReportForm() {
  const [buktiFiles, setBuktiFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MbgForm>();

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBuktiFiles(prev => [...prev, ...files].slice(0, 5));
  };

  const onSubmit = async (data: MbgForm) => {
    setSubmitting(true);
    try {
      const id = 'MBG-' + Date.now().toString().slice(-6);
      
      const formData = new FormData();
      formData.append('requestCode', id);
      formData.append('type', 'mbg');
      formData.append('sourcePage', 'mbg-report-form');
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append extraData as JSON string
      formData.append('extraData', JSON.stringify({
        schoolName: data.sekolahNama,
        province: data.provinsi,
        district: data.kabupaten,
        subDistrict: data.kecamatan,
        studentCount: data.jumlahSiswa,
        googleMapsLink: data.googleMapsLink,
        violationType: data.jenisPenyimpangan,
        incidentDate: data.tanggalKejadian
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
        toast.success(`Laporan MBG berhasil dikirim! Nomor tiket: ${result.requestCode}. Langsung ditindak!!`);
      } else {
        toast.error('Gagal mengirim laporan. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Failed to submit MBG report:', error);
      toast.error('Terjadi kesalahan saat mengirim laporan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-amber-200 shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-amber-600" />
          </div>
          <h2 className="font-800 text-[#1a3a5c] text-xl mb-2">Laporan MBG Diterima!</h2>
          <p className="text-gray-600 mb-4">Laporan penyimpangan MBG Anda akan <strong className="text-amber-700">langsung ditindak!!</strong> oleh tim LNAKRI NGO.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Nomor Tiket</div>
            <div className="text-2xl font-800 text-[#1a3a5c] tracking-widest">{ticketId}</div>
          </div>
          <button onClick={() => { setSubmitted(false); reset(); setBuktiFiles([]); }} className="btn-primary text-sm py-2">Buat Laporan Baru</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AppImage
          src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
          alt="Logo kecil LNAKRI di form laporan MBG SPPG"
          width={36}
          height={36}
          className="opacity-80"
        />
        <div>
          <h2 className="font-800 text-[#1a3a5c] text-xl flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber-600" /> Pantau MBG SPPG — Form Laporan
          </h2>
          <p className="text-gray-500 text-sm">Silahkan Laporkan — Langsung Ditindak!!</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <p className="text-red-800 text-sm font-700">🚨 PANTAU MBG SPPG SELURUH INDONESIA — SILAHKAN LAPORKAN — LANGSUNG DITINDAK!!</p>
        <p className="text-red-700 text-xs mt-1">Setiap laporan penyimpangan program MBG akan segera ditindaklanjuti oleh tim LNAKRI NGO dan dilaporkan kepada pihak berwenang.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Data Pelapor */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Data Pelapor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nama Pelapor <span className="text-red-500">*</span></label>
              <input {...register('reporterName', { required: 'Nama pelapor wajib diisi' })} className="input-field" placeholder="Nama lengkap Anda" />
              {errors.reporterName && <p className="text-red-500 text-xs mt-1">{errors.reporterName.message}</p>}
            </div>
            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <input {...register('email', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' } })} type="email" className="input-field" placeholder="email@contoh.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Nomor WhatsApp</label>
              <input {...register('phone')} className="input-field" placeholder="08xxx (opsional)" />
            </div>
          </div>
        </div>

        {/* Lokasi Kejadian */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <MapPin size={16} className="text-amber-600" /> Lokasi Tempat Kejadian
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nama Sekolah / Instansi <span className="text-red-500">*</span></label>
              <input {...register('sekolahNama', { required: 'Nama sekolah/instansi wajib diisi' })} className="input-field" placeholder="Contoh: SDN 05 Medan / SMPN 12 Surabaya" />
              {errors.sekolahNama && <p className="text-red-500 text-xs mt-1">{errors.sekolahNama.message}</p>}
            </div>
            <div>
              <label className="label">Provinsi <span className="text-red-500">*</span></label>
              <input {...register('provinsi', { required: 'Provinsi wajib diisi' })} className="input-field" placeholder="Contoh: Sumatera Utara" />
              {errors.provinsi && <p className="text-red-500 text-xs mt-1">{errors.provinsi.message}</p>}
            </div>
            <div>
              <label className="label">Kabupaten / Kota <span className="text-red-500">*</span></label>
              <input {...register('kabupaten', { required: 'Kabupaten/kota wajib diisi' })} className="input-field" placeholder="Contoh: Kota Medan" />
              {errors.kabupaten && <p className="text-red-500 text-xs mt-1">{errors.kabupaten.message}</p>}
            </div>
            <div>
              <label className="label">Kecamatan</label>
              <input {...register('kecamatan')} className="input-field" placeholder="Kecamatan (opsional)" />
            </div>
            <div>
              <label className="label">Jumlah Siswa Terdampak</label>
              <input {...register('jumlahSiswa')} className="input-field" placeholder="Contoh: 300 siswa" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Alamat Lengkap</label>
              <input {...register('sekolahAlamat')} className="input-field" placeholder="Alamat lengkap lokasi kejadian" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Link Google Maps Lokasi</label>
              <p className="text-xs text-gray-500 mb-1.5">Salin link Google Maps lokasi kejadian untuk memudahkan verifikasi</p>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('googleMapsLink')} className="input-field pl-9" placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </div>
        </div>

        {/* Detail Penyimpangan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-4 pb-2 border-b border-gray-100">Detail Penyimpangan MBG</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Tanggal Kejadian <span className="text-red-500">*</span></label>
              <input {...register('tanggalKejadian', { required: 'Tanggal kejadian wajib diisi' })} type="date" className="input-field" />
              {errors.tanggalKejadian && <p className="text-red-500 text-xs mt-1">{errors.tanggalKejadian.message}</p>}
            </div>
            <div>
              <label className="label">Jenis Penyimpangan <span className="text-red-500">*</span></label>
              <select {...register('jenisPenyimpangan', { required: 'Jenis penyimpangan wajib dipilih' })} className="input-field bg-white">
                <option value="">— Pilih jenis penyimpangan —</option>
                {jenisPenyimpangan.map(j => (
                  <option key={`jenis-${j}`} value={j}>{j}</option>
                ))}
              </select>
              {errors.jenisPenyimpangan && <p className="text-red-500 text-xs mt-1">{errors.jenisPenyimpangan.message}</p>}
            </div>
            <div>
              <label className="label">Kronologis Penyimpangan <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-1.5">Jelaskan secara rinci apa yang terjadi, kapan, dan bagaimana Anda mengetahuinya</p>
              <textarea {...register('kronologis', { required: 'Kronologis wajib diisi', minLength: { value: 80, message: 'Kronologis minimal 80 karakter' } })}
                className="input-field resize-none" rows={7}
                placeholder="Contoh: Pada tanggal X, program MBG di sekolah kami tidak berjalan sesuai ketentuan. Makanan yang diberikan berupa... Sementara anggaran yang tercatat adalah..." />
              {errors.kronologis && <p className="text-red-500 text-xs mt-1">{errors.kronologis.message}</p>}
            </div>
          </div>
        </div>

        {/* Upload Bukti */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-700 text-[#1a3a5c] mb-2 pb-2 border-b border-gray-100">Upload Bukti</h3>
          <p className="text-xs text-gray-500 mb-4">Foto makanan, dokumen, screenshot, atau video pendek (maks. 5 file)</p>
          <div className="space-y-3">
            {buktiFiles.map((file, idx) => (
              <div key={`mbg-file-${idx}`} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                <button type="button" onClick={() => setBuktiFiles(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                  <X size={15} />
                </button>
              </div>
            ))}
            {buktiFiles.length < 5 && (
              <label className="border-2 border-dashed border-amber-300 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-amber-500 transition-colors">
                <Upload size={24} className="text-amber-400" />
                <span className="text-sm text-gray-600 font-600">Upload Bukti Penyimpangan MBG</span>
                <span className="text-xs text-gray-400">JPG, PNG, PDF, MP4 (maks. 10MB)</span>
                <input type="file" className="hidden" multiple accept=".jpg,.jpeg,.png,.pdf,.mp4" onChange={handleFileAdd} />
              </label>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input {...register('agreeTerms', { required: 'Persetujuan wajib dicentang' })} type="checkbox" className="mt-1 w-4 h-4 accent-amber-600" />
            <span className="text-sm text-gray-700 leading-relaxed">
              Saya menyatakan bahwa laporan ini berdasarkan fakta yang saya saksikan/ketahui secara langsung dan saya bertanggung jawab atas kebenaran informasi yang diberikan.
            </span>
          </label>
          {errors.agreeTerms && <p className="text-red-500 text-xs mt-2">{errors.agreeTerms.message}</p>}
        </div>

        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-700 py-4 rounded-xl transition-all duration-150 text-base disabled:opacity-60">
          {submitting ? (
            <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Mengirim Laporan MBG...</>
          ) : (
            <><Send size={18} /> Kirim Laporan MBG — Langsung Ditindak!!</>
          )}
        </button>
      </form>
    </div>
  );
}