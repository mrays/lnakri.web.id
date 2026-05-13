'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Heart, Copy, CheckCircle, Upload, X } from 'lucide-react';


type DonationForm = {
  donorName: string;
  donorEmail: string;
  amount: string;
  keterangan: string;
  bukti: FileList;
};

export default function DonationSection() {
  const [copied, setCopied] = useState(false);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DonationForm>();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/organization-profile');
      const data = await res.json();
      if (res.ok) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const copyRek = () => {
    const rek = profile?.bankAccountNumber || '5790248335';
    navigator.clipboard.writeText(rek);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = (data: DonationForm) => {
    setSubmitting(true);

    if (!buktiFile) {
      toast.error('Mohon upload bukti transfer Anda.');
      setSubmitting(false);
      return;
    }

    const whatsAppNumber = profile?.phone?.replace(/\D/g, '');

    if (!whatsAppNumber) {
      toast.error('Nomor WhatsApp organisasi tidak ditemukan. Silakan hubungi admin.');
      setSubmitting(false);
      return;
    }

    const formattedAmount = `Rp ${Number(data.amount).toLocaleString('id-ID')}`;

    const messageLines = [
      'Halo LNAKRI NGO,',
      '',
      'Saya ingin mengonfirmasi donasi saya:',
      `- Nama Donatur: ${data.donorName}`,
      `- Email: ${data.donorEmail}`,
      `- Jumlah Donasi: ${formattedAmount}`,
      `- Keterangan: ${data.keterangan || '-'}`,
      '',
      'Berikut saya lampirkan bukti transfer. Terima kasih.',
    ];
    const message = messageLines.join('\n');

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    setSubmitting(false);
    setSubmitted(true);
    toast.success('Anda dialihkan ke WhatsApp. Silakan kirim pesan & bukti transfer.');
    reset();
    setBuktiFile(null);
  };

  const bankName = profile?.bankName || 'Bank BCA';
  const bankAccountName = profile?.bankAccountName || 'Roddy Maruli Mazmur';
  const bankAccountNumber = profile?.bankAccountNumber || '5790248335';

  return (
    <section id="donasi" className="py-16 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-700 uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full">Donasi</span>
          <h2 className="text-2xl lg:text-3xl font-800 text-[#1a3a5c] mt-3">Dukung Perjuangan Anti Korupsi</h2>
          <p className="text-gray-600 mt-2 text-sm max-w-xl mx-auto">
            Donasi Anda membantu LNAKRI NGO untuk terus beroperasi dalam menerima laporan, mendampingi korban, dan menginvestigasi korupsi di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Rekening Info */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-[#1a3a5c] to-[#2a5080] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center font-800 text-white text-lg">
                  {bankName.includes('BCA') ? 'BCA' : bankName.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <div className="font-700 text-lg">{bankName}</div>
                  <div className="text-white/70 text-sm">Rekening Donasi LNAKRI NGO</div>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="text-white/70 text-xs font-600 uppercase tracking-wide mb-1">Nomor Rekening</div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-800 tracking-widest">{bankAccountNumber}</span>
                  <button onClick={copyRek} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-600 transition-colors">
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? 'Tersalin!' : 'Salin'}
                  </button>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-white/70 text-xs font-600 uppercase tracking-wide mb-1">Atas Nama</div>
                <div className="text-lg font-700">{bankAccountName}</div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Heart size={18} className="text-pink-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-700 text-gray-800 text-sm mb-1">Catatan Donasi</div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Setelah melakukan transfer, harap isi form konfirmasi di samping dan upload bukti transfer. Donasi Anda akan digunakan untuk operasional investigasi, bantuan hukum, dan edukasi anti korupsi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Konfirmasi */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 bg-green-50 rounded-2xl border border-green-200">
              <CheckCircle size={56} className="text-green-600 mb-4" />
              <h3 className="font-700 text-green-800 text-xl mb-2">Terima Kasih!</h3>
              <p className="text-green-700 text-sm text-center max-w-xs">Anda telah dialihkan ke WhatsApp. Mohon kirim pesan yang telah disiapkan dan lampirkan bukti transfer Anda untuk menyelesaikan konfirmasi.</p>
              <button onClick={() => setSubmitted(false)} className="mt-5 btn-primary text-sm">Kirim Lagi</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="font-700 text-[#1a3a5c] text-lg mb-4">Form Konfirmasi Donasi</h3>
              <div>
                <label className="label">Nama Donatur <span className="text-red-500">*</span></label>
                <input {...register('donorName', { required: 'Nama wajib diisi' })}
                  className="input-field" placeholder="Nama lengkap Anda" />
                {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName.message}</p>}
              </div>
              <div>
                <label className="label">Email <span className="text-red-500">*</span></label>
                <input {...register('donorEmail', { required: 'Email wajib diisi', pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' } })}
                  type="email" className="input-field" placeholder="email@contoh.com" />
                {errors.donorEmail && <p className="text-red-500 text-xs mt-1">{errors.donorEmail.message}</p>}
              </div>
              <div>
                <label className="label">Jumlah Donasi (Rp) <span className="text-red-500">*</span></label>
                <input {...register('amount', { required: 'Jumlah donasi wajib diisi' })}
                  className="input-field" placeholder="Contoh: 500000" />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="label">Keterangan Donasi</label>
                <textarea {...register('keterangan')}
                  className="input-field resize-none" rows={2} placeholder="Pesan atau keterangan donasi Anda..." />
              </div>
              <div>
                <label className="label">Upload Bukti Transfer <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-red-400 transition-colors">
                  {buktiFile ? (
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-600" />
                      <span className="text-sm text-gray-700 flex-1">{buktiFile.name}</span>
                      <button type="button" onClick={() => setBuktiFile(null)} className="text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-500">Klik untuk upload bukti transfer</span>
                      <span className="text-xs text-gray-400">JPG, PNG, PDF (maks. 5MB)</span>
                      <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf"
                        onChange={e => setBuktiFile(e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full btn-primary justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Mengirim...</>
                ) : (
                  <><Heart size={16} /> Kirim Konfirmasi Donasi</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}