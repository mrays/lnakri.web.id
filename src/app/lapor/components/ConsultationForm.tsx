'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { MessageSquare, Send, User, Phone, Mail, Clock } from 'lucide-react';

type ConsultForm = {
  name: string;
  email: string;
  phone: string;
  topik: string;
  pertanyaan: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'admin';
  content: string;
  time: string;
  senderName: string;
};

const getTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const autoReplies = [
  'Terima kasih atas pertanyaan Anda. Tim konsultan hukum LNAKRI NGO sedang mempersiapkan jawaban. Mohon tunggu sebentar.',
  'Pertanyaan Anda sudah kami terima. Untuk konsultasi lebih lanjut, tim kami akan menghubungi Anda melalui email yang terdaftar.',
  'Kami memahami kekhawatiran Anda. Tim hukum LNAKRI NGO akan segera merespons. Jika mendesak, hubungi WA hotline 082295592545.',
];

export default function ConsultationForm() {
  const [phone, setPhone] = useState('082295592545');
  const [email, setEmail] = useState('dpplnakri@gmail.com');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/organization-profile');
        const data = await res.json();
        if (res.ok) {
          if (data.profile?.phone) setPhone(data.profile.phone);
          if (data.profile?.email) setEmail(data.profile.email);
        }
      } catch (error) {
        console.error('Failed to fetch profile in ConsultationForm:', error);
      }
    };
    fetchProfile();
  }, []);

  const [phase, setPhase] = useState<'form' | 'chat'>('form');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ConsultForm>();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onStart = async (data: ConsultForm) => {
    setSubmitting(true);
    // TODO: Connect to backend POST /api/consultations to create session
    await new Promise(r => setTimeout(r, 1000));
    setUserName(data.name);
    setMessages([
      {
        id: 'msg-welcome',
        role: 'admin',
        content: `Selamat datang ${data.name}! Saya dari tim konsultan hukum LNAKRI NGO. Anda mengajukan konsultasi tentang: "${data.topik}". Silakan sampaikan pertanyaan atau kronologis Anda, dan kami akan segera membantu.\n\nPertanyaan awal Anda: "${data.pertanyaan}"`,
        time: getTime(),
        senderName: 'Tim LNAKRI NGO',
      },
    ]);
    setSubmitting(false);
    setPhase('chat');
    toast.success('Sesi konsultasi dimulai! Tim LNAKRI akan segera merespons.');
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: chatInput,
      time: getTime(),
      senderName: userName,
    };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setSending(true);

    // TODO: Connect to real-time backend WebSocket or POST /api/consultations/:id/messages
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)].replace('082295592545', phone);
    const adminMsg: ChatMessage = {
      id: `msg-admin-${Date.now()}`,
      role: 'admin',
      content: reply,
      time: getTime(),
      senderName: 'Tim LNAKRI NGO',
    };
    setMessages(prev => [...prev, adminMsg]);
    setSending(false);
  };

  const topikOptions = [
    'Cara melaporkan korupsi',
    'Perlindungan hukum sebagai saksi',
    'Gratifikasi dan suap',
    'Bantuan hukum kasus korupsi',
    'Prosedur pengaduan ke KPK',
    'Hak pelapor korupsi',
    'Dana desa dan korupsi',
    'Program MBG dan penyimpangan',
    'Lainnya',
  ];

  if (phase === 'chat') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <AppImage
            src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
            alt="Logo kecil LNAKRI di form konsultasi real time"
            width={32}
            height={32}
            className="opacity-80"
          />
          <div>
            <h2 className="font-800 text-[#1a3a5c] text-lg">Konsultasi Real Time — LNAKRI NGO</h2>
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-soft" />
              Tim LNAKRI Online
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
          <div className="bg-[#1a3a5c] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center font-800 text-[#1a3a5c] text-sm">L</div>
              <div>
                <div className="text-white font-700 text-sm">Konsultan Hukum LNAKRI</div>
                <div className="text-white/60 text-xs">Sesi aktif — pesan terkirim</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white/60 text-xs">
              <Clock size={12} />
              <span>{getTime()}</span>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-5 space-y-4 bg-gray-50 scrollbar-hide">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-700 ${msg.role === 'user' ? 'bg-red-700 text-white' : 'bg-[#1a3a5c] text-white'}`}>
                  {msg.role === 'user' ? <User size={14} /> : 'L'}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className="text-xs text-gray-500">{msg.senderName}</div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-red-700 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white text-xs font-700">L</div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder="Tulis pertanyaan atau kronologis Anda..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              />
              <button onClick={sendChat} disabled={!chatInput.trim() || sending}
                className="w-10 h-10 bg-red-700 hover:bg-red-800 disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-all active:scale-95">
                <Send size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">Tim LNAKRI akan merespons secepatnya</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <a href={`https://wa.me/${phone.startsWith('0') ? '62' + phone.slice(1) : phone}`} className="flex items-center gap-1 hover:text-green-600 transition-colors"><Phone size={11} />{phone}</a>
                 <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-red-600 transition-colors"><Mail size={11} />Email</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AppImage
          src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
          alt="Logo kecil LNAKRI di halaman konsultasi"
          width={36}
          height={36}
          className="opacity-80"
        />
        <div>
          <h2 className="font-800 text-[#1a3a5c] text-xl flex items-center gap-2">
            <MessageSquare size={20} className="text-indigo-700" /> Konsultasi Real Time
          </h2>
          <p className="text-gray-500 text-sm">Konsultasikan permasalahan hukum anti korupsi Anda dengan tim LNAKRI</p>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <MessageSquare size={18} className="text-indigo-700 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-indigo-800 text-sm font-700 mb-1">Layanan Konsultasi Real Time LNAKRI NGO</p>
          <p className="text-indigo-700 text-sm">Tim konsultan hukum kami siap membantu Anda setiap hari Senin–Jumat pukul 08.00–17.00 WIB. Di luar jam tersebut, gunakan fitur AI Konsultan di halaman utama.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onStart)} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-700 text-[#1a3a5c] pb-2 border-b border-gray-100">Data Konsultan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
            <input {...register('name', { required: 'Nama wajib diisi' })} className="input-field" placeholder="Nama lengkap Anda" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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
          <div className="sm:col-span-2">
            <label className="label">Topik Konsultasi <span className="text-red-500">*</span></label>
            <select {...register('topik', { required: 'Topik konsultasi wajib dipilih' })} className="input-field bg-white">
              <option value="">— Pilih topik —</option>
              {topikOptions.map(t => <option key={`topik-${t}`} value={t}>{t}</option>)}
            </select>
            {errors.topik && <p className="text-red-500 text-xs mt-1">{errors.topik.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="label">Pertanyaan / Kronologis Singkat <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-500 mb-1.5">Jelaskan secara singkat apa yang ingin Anda konsultasikan</p>
            <textarea {...register('pertanyaan', { required: 'Pertanyaan wajib diisi', minLength: { value: 30, message: 'Minimal 30 karakter' } })}
              className="input-field resize-none" rows={4}
              placeholder="Contoh: Saya mengetahui adanya dugaan korupsi di instansi tempat saya bekerja dan ingin tahu langkah yang harus saya ambil..." />
            {errors.pertanyaan && <p className="text-red-500 text-xs mt-1">{errors.pertanyaan.message}</p>}
          </div>
        </div>
        <button type="submit" disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-700 py-3.5 rounded-xl transition-all duration-150 text-base disabled:opacity-60">
          {submitting ? (
            <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Memulai Sesi...</>
          ) : (
            <><MessageSquare size={18} /> Mulai Konsultasi Real Time</>
          )}
        </button>
      </form>
    </div>
  );
}