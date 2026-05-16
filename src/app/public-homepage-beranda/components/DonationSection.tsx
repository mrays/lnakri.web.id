'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, Copy, CreditCard, Heart, Loader2, Send, ShieldCheck } from 'lucide-react';

import { buildWhatsAppUrl } from '@/lib/whatsapp';

type DonationForm = {
  donorName: string;
  donorEmail: string;
  keterangan: string;
};

type OrganizationProfile = {
  shortName?: string;
  phone?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
};

const DEFAULT_PROFILE: Required<OrganizationProfile> = {
  shortName: 'LNAKRI NGO',
  phone: '082295592545',
  bankName: 'Bank BCA',
  bankAccountNumber: '5790248335',
  bankAccountName: 'Roddy Maruli Mazmur',
};

async function copyTextToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

function buildDonationConfirmationMessage(data: DonationForm, profile: Required<OrganizationProfile>) {
  return [
    'Halo Admin LNAKRI, saya ingin konfirmasi donasi.',
    '',
    `Nama Donatur: ${data.donorName}`,
    `Email: ${data.donorEmail}`,
    `Rekening Tujuan: ${profile.bankName} ${profile.bankAccountNumber}`,
    `Atas Nama: ${profile.bankAccountName}`,
    '',
    `Keterangan: ${data.keterangan || '-'}`,
    '',
    'Saya sudah melakukan transfer donasi. Mohon dibantu konfirmasinya.',
  ].join('\n');
}

export default function DonationSection() {
  const [profile, setProfile] = useState<Required<OrganizationProfile>>(DEFAULT_PROFILE);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonationForm>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/organization-profile');
        const data = await res.json();
        const nextProfile = data.profile || {};

        setProfile({
          shortName: nextProfile.shortName || DEFAULT_PROFILE.shortName,
          phone: nextProfile.phone || DEFAULT_PROFILE.phone,
          bankName: nextProfile.bankName || DEFAULT_PROFILE.bankName,
          bankAccountNumber: nextProfile.bankAccountNumber || DEFAULT_PROFILE.bankAccountNumber,
          bankAccountName: nextProfile.bankAccountName || DEFAULT_PROFILE.bankAccountName,
        });
      } catch (error) {
        console.error('Failed to fetch donation profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleCopyAccountNumber = async () => {
    await copyTextToClipboard(profile.bankAccountNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = (data: DonationForm) => {
    setSubmitting(true);
    const message = buildDonationConfirmationMessage(data, profile);
    window.open(buildWhatsAppUrl(profile.phone, message), '_blank', 'noopener,noreferrer');
    window.setTimeout(() => setSubmitting(false), 400);
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
            Transfer donasi ke rekening resmi organisasi, lalu kirim konfirmasi langsung melalui
            WhatsApp admin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 max-w-5xl mx-auto">
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-[#1a3a5c] to-[#244d7a] rounded-2xl p-6 text-white overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 h-44 w-44 rounded-full border border-white/10" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-sm font-800">
                    {profile.bankName.replace(/^Bank\s+/i, '').slice(0, 4).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-700 text-lg">{profile.bankName}</div>
                    <div className="text-white/75 text-sm">Rekening Donasi {profile.shortName}</div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <div className="text-white/70 text-xs font-700 uppercase tracking-wide mb-2">
                    Nomor Rekening
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-800 text-2xl tracking-widest break-all">
                      {profile.bankAccountNumber}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAccountNumber}
                      className="inline-flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg bg-white/20 px-3 text-xs font-700 text-white transition-colors hover:bg-white/30"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-white/70 text-xs font-700 uppercase tracking-wide mb-2">
                    Atas Nama
                  </div>
                  <div className="font-700 text-lg">{profile.bankAccountName}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
              <div className="flex items-start gap-3">
                <Heart size={18} className="text-pink-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-700 text-[#1a3a5c] text-sm mb-1">Catatan Donasi</div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Setelah melakukan transfer, isi form konfirmasi di samping. Tombol konfirmasi
                    akan membuka WhatsApp admin agar bukti transfer dapat dikirim langsung di chat.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-blue-700 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900 text-sm leading-relaxed">
                  Data rekening mengikuti informasi yang tersimpan di profil organisasi pada
                  dashboard backend.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="font-700 text-[#1a3a5c] text-lg mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-red-700" />
              Form Konfirmasi Donasi
            </h3>
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
              <label className="label">Keterangan Donasi</label>
              <textarea
                {...register('keterangan')}
                className="input-field resize-none"
                rows={4}
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
                  <Loader2 className="animate-spin" size={16} /> Membuka WhatsApp...
                </>
              ) : (
                <>
                  <Send size={16} /> Kirim Konfirmasi Donasi
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tidak perlu mengisi nominal di halaman ini. Cantumkan bukti transfer dan nominal
              langsung pada chat WhatsApp konfirmasi.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
