import Link from 'next/link';
import { CheckCircle, HeartHandshake } from 'lucide-react';

export default function DonationCompletePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-lg bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-5">
          <CheckCircle size={34} />
        </div>
        <span className="inline-flex items-center gap-2 text-xs font-700 uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
          <HeartHandshake size={14} />
          Donasi
        </span>
        <h1 className="text-2xl font-800 text-[#1a3a5c] mt-4">Terima Kasih Atas Donasi Anda</h1>
        <p className="text-gray-600 text-sm leading-relaxed mt-3">
          Pembayaran Anda sedang diproses. Jika transaksi sudah berhasil, sistem akan menerima
          konfirmasi otomatis dari penyedia pembayaran.
        </p>
        <Link href="/public-homepage-beranda#donasi" className="btn-primary justify-center mt-6">
          Kembali ke Halaman Donasi
        </Link>
      </section>
    </main>
  );
}
