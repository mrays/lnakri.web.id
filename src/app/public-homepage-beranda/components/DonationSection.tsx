'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CheckCircle, Heart, Loader2, QrCode, ShieldCheck, Wallet } from 'lucide-react';

declare global {
  interface Window {
    SnapPayment?: {
      pay: (signature: string) => void;
    };
  }
}

type DonationForm = {
  donorName: string;
  donorEmail: string;
  amount: string;
  keterangan: string;
};

type DonationResponse = {
  orderId?: string;
  signature?: string;
  redirectUrl?: string;
  qrisUrl?: string | null;
  qrisImage?: string | null;
  totalAmount?: string;
  status?: string;
  expiredAt?: string;
  merchantName?: string;
};

const quickAmounts = [50000, 100000, 250000, 500000];

function formatRupiah(value: number | string | undefined) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DonationSection() {
  const [submitting, setSubmitting] = useState(false);
  const [donation, setDonation] = useState<DonationResponse | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DonationForm>();
  const selectedAmount = watch('amount');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://klikqris.com/js/payment-snap.js?t=${Date.now()}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openPayment = (paymentSignature?: string, fallbackUrl?: string) => {
    if (paymentSignature && window.SnapPayment) {
      window.SnapPayment.pay(paymentSignature);
      return;
    }

    if (fallbackUrl) {
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    toast.error('Halaman pembayaran belum siap. Silakan coba beberapa detik lagi.');
  };

  const onSubmit = async (data: DonationForm) => {
    setSubmitting(true);

    try {
      const res = await fetch('/api/donations/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: data.donorName,
          donorEmail: data.donorEmail,
          amount: Number(data.amount),
          keterangan: data.keterangan,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Gagal membuat transaksi donasi.');
      }

      setDonation(result.donation);
      openPayment(
        result.donation.signature,
        result.donation.redirectUrl || result.donation.qrisUrl
      );
      toast.success('Transaksi donasi dibuat. Silakan lanjutkan pembayaran.');
      reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal membuat transaksi donasi.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="donasi" className="py-16 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-700 uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
            Donasi
          </span>
          <h2 className="text-2xl lg:text-3xl font-800 text-[#1a3a5c] mt-3">
            Dukung Perjuangan Anti Korupsi
          </h2>
          <p className="text-gray-600 mt-2 text-sm max-w-xl mx-auto">
            Donasi Anda diproses melalui QRIS agar pembayaran bisa dilakukan langsung dengan dompet
            digital atau aplikasi bank favorit Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 max-w-5xl mx-auto">
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-[#1a3a5c] to-[#2a5080] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
                  <Wallet size={26} />
                </div>
                <div>
                  <div className="font-700 text-lg">Dompet Digital QRIS</div>
                  <div className="text-white/70 text-sm">Pembayaran digital aman</div>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <div className="text-white/70 text-xs font-600 uppercase tracking-wide mb-2">
                  Metode pembayaran
                </div>
                <div className="flex flex-wrap gap-2">
                  {['QRIS', 'DANA', 'OVO', 'GoPay', 'ShopeePay', 'Mobile Banking'].map((method) => (
                    <span
                      key={method}
                      className="bg-white/15 text-white text-xs font-600 px-3 py-1.5 rounded-full"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-green-300 mt-0.5 flex-shrink-0" />
                  <p className="text-white/80 text-sm leading-relaxed">
                    Anda akan diarahkan ke halaman pembayaran setelah nominal donasi dikirim.
                    Nominal akhir mengikuti total tagihan yang ditampilkan.
                  </p>
                </div>
              </div>
            </div>

            {donation && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-700 text-green-800 text-sm mb-1">
                      Transaksi Donasi Dibuat
                    </div>
                    <p className="text-green-700 text-sm leading-relaxed">
                      Order {donation.orderId} menunggu pembayaran
                      {donation.totalAmount ? ` sebesar ${formatRupiah(donation.totalAmount)}` : ''}
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        openPayment(
                          donation.signature,
                          donation.redirectUrl || donation.qrisUrl || undefined
                        )
                      }
                      className="mt-3 btn-secondary text-xs px-4 py-2"
                    >
                      <QrCode size={14} /> Buka Pembayaran Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="font-700 text-[#1a3a5c] text-lg mb-4">Form Donasi Digital</h3>
            <div>
              <label className="label">
                Nama Donatur <span className="text-red-500">*</span>
              </label>
              <input
                {...register('donorName', { required: 'Nama wajib diisi' })}
                className="input-field"
                placeholder="Nama lengkap Anda"
              />
              {errors.donorName && (
                <p className="text-red-500 text-xs mt-1">{errors.donorName.message}</p>
              )}
            </div>
            <div>
              <label className="label">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('donorEmail', {
                  required: 'Email wajib diisi',
                  pattern: { value: /^\S+@\S+$/i, message: 'Format email tidak valid' },
                })}
                type="email"
                className="input-field"
                placeholder="email@contoh.com"
              />
              {errors.donorEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.donorEmail.message}</p>
              )}
            </div>
            <div>
              <label className="label">
                Jumlah Donasi (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setValue('amount', String(amount), { shouldValidate: true })}
                    className={`rounded-lg border px-3 py-2 text-xs font-700 transition-colors ${
                      Number(selectedAmount) === amount
                        ? 'border-red-700 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-red-300'
                    }`}
                  >
                    {formatRupiah(amount)}
                  </button>
                ))}
              </div>
              <input
                {...register('amount', {
                  required: 'Jumlah donasi wajib diisi',
                  min: { value: 1000, message: 'Minimal donasi Rp 1.000' },
                  pattern: { value: /^[0-9]+$/, message: 'Nominal hanya boleh angka' },
                })}
                inputMode="numeric"
                className="input-field"
                placeholder="Contoh: 500000"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
              )}
            </div>
            <div>
              <label className="label">Keterangan Donasi</label>
              <textarea
                {...register('keterangan')}
                className="input-field resize-none"
                rows={3}
                placeholder="Pesan atau keterangan donasi Anda..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Membuat Pembayaran...
                </>
              ) : (
                <>
                  <Heart size={16} /> Donasi Sekarang
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 leading-relaxed">
              Setelah tombol ditekan, sistem membuat tagihan QRIS baru dan membuka halaman
              pembayaran secara otomatis.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
