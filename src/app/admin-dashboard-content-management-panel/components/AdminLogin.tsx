'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Shield, Lock, Mail } from 'lucide-react';

type LoginForm = { email: string; password: string };

const ADMIN_EMAIL = 'dpplnakri@gmail.com';
const ADMIN_PASSWORD = 'LNAKRI@2017';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    // TODO: Connect to backend POST /api/auth/admin-login
    await new Promise(r => setTimeout(r, 1000));
    if (data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
      toast.success('Login berhasil! Selamat datang, Admin LNAKRI.');
      onLogin();
    } else {
      toast.error('Kredensial tidak valid — gunakan akun demo di bawah untuk masuk.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2540] via-[#1a3a5c] to-[#0f2540] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AppImage
          src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
          alt="LNAKRI logo watermark latar belakang halaman login admin"
          width={600}
          height={600}
          className="opacity-5"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo top-left mini */}
        <div className="absolute -top-16 left-0">
          <AppImage
            src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
            alt="Logo kecil LNAKRI di pojok kiri atas halaman login"
            width={40}
            height={40}
            className="opacity-60"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a3a5c] to-[#2a5080] px-8 py-6 text-center">
            <div className="flex justify-center mb-3">
              <AppLogo src="/assets/images/a21354667_lnakrilogo-1776577431349.png" size={56} />
            </div>
            <h1 className="text-white font-800 text-xl">LNAKRI NGO</h1>
            <p className="text-white/70 text-sm mt-1">Panel Admin — Manajemen Konten</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={18} className="text-red-700" />
              <h2 className="font-700 text-[#1a3a5c] text-base">Masuk ke Dashboard Admin</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email Admin <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email', { required: 'Email wajib diisi' })}
                    type="email"
                    className="input-field pl-9"
                    placeholder="admin@lnakri.org"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password', { required: 'Password wajib diisi' })}
                    type={showPass ? 'text' : 'password'}
                    className="input-field pl-9 pr-10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary justify-center py-3 mt-2 disabled:opacity-60">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Memverifikasi...</>
                ) : (
                  <><Shield size={16} /> Masuk ke Dashboard</>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-4">
          © 2026 LNAKRI NGO — Panel Admin Terbatas
        </p>
      </div>
    </div>
  );
}