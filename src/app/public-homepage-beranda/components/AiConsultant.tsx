'use client';
import React, { useState, useRef, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
};

const getTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const quickQuestions = [
  'Apa itu korupsi menurut UU No. 31 Tahun 1999?',
  'Bagaimana cara melaporkan korupsi ke KPK?',
  'Apa hukuman bagi pelaku korupsi di Indonesia?',
  'Apa itu gratifikasi dan apakah termasuk korupsi?',
  'Bagaimana perlindungan hukum bagi pelapor korupsi?',
];

const mockResponses: Record<string, string> = {
  default: 'Terima kasih atas pertanyaan Anda. Berdasarkan hukum anti korupsi Indonesia, saya dapat memberikan informasi umum. Untuk konsultasi lebih mendalam dan tindakan hukum, silakan hubungi tim LNAKRI NGO di dpplnakri@gmail.com atau WA 082295592545.',
  'korupsi': 'Menurut UU No. 31 Tahun 1999 jo. UU No. 20 Tahun 2001, korupsi adalah tindakan memperkaya diri sendiri, orang lain, atau korporasi yang dapat merugikan keuangan atau perekonomian negara. Korupsi mencakup: suap, gratifikasi, penggelapan, pemerasan, perbuatan curang, benturan kepentingan, dan tindak pidana korupsi lainnya.',
  'melaporkan': 'Untuk melaporkan korupsi, Anda dapat: (1) Melapor ke KPK melalui kpk.go.id atau hotline 198, (2) Melapor ke Kejaksaan setempat, (3) Melapor melalui LNAKRI NGO dengan mengisi form keluhan di aplikasi ini. Pastikan Anda menyertakan kronologis lengkap, bukti-bukti, dan identitas pelapor.',
  'hukuman': 'Hukuman korupsi di Indonesia: Penjara minimal 4 tahun hingga 20 tahun atau seumur hidup, denda minimal Rp 200 juta hingga Rp 1 miliar. Untuk korupsi yang merugikan negara dalam keadaan tertentu (seperti bencana), hukuman bisa mencapai hukuman mati.',
  'gratifikasi': 'Gratifikasi adalah pemberian dalam arti luas yang diterima oleh pegawai negeri atau penyelenggara negara. Gratifikasi dianggap suap jika berhubungan dengan jabatan dan berlawanan dengan kewajiban atau tugasnya. Pegawai negeri WAJIB melaporkan gratifikasi ke KPK dalam 30 hari kerja.',
  'perlindungan': 'Pelapor korupsi (whistleblower) dilindungi oleh UU No. 13 Tahun 2006 tentang Perlindungan Saksi dan Korban. Perlindungan meliputi: perlindungan fisik, perlindungan hukum, perlindungan identitas, dan penanganan khusus. LNAKRI NGO siap mendampingi Anda dalam proses pengajuan perlindungan ke LPSK.',
};

function getAiResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(mockResponses)) {
    if (key !== 'default' && lower.includes(key)) return mockResponses[key];
  }
  return mockResponses.default;
}

export default function AiConsultant() {
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
        console.error('Failed to fetch profile in AiConsultant:', error);
      }
    };
    fetchProfile();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: 'Selamat datang di AI Konsultan Hukum Anti Korupsi LNAKRI NGO! 🏛️\n\nSaya siap membantu Anda dengan informasi seputar hukum anti korupsi di Indonesia. Silakan tanyakan apa saja terkait:\n• Undang-undang anti korupsi\n• Cara melaporkan korupsi\n• Hak dan perlindungan pelapor\n• Gratifikasi dan suap\n• Proses hukum korupsi',
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: userText,
      time: getTime(),
    };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // TODO: Connect to AI backend API POST /api/ai-konsultan with { message: userText }
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const aiReply = getAiResponse(userText)
      .replace('082295592545', phone)
      .replace('dpplnakri@gmail.com', email);
    setTyping(false);

    const aiMsg: Message = {
      id: `msg-ai-${Date.now()}`,
      role: 'assistant',
      content: aiReply,
      time: getTime(),
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const reset = () => {
    setMessages([{
      id: 'msg-init-reset',
      role: 'assistant',
      content: 'Sesi baru dimulai. Silakan tanyakan seputar hukum anti korupsi kepada saya.',
      time: getTime(),
    }]);
  };

  return (
    <section id="ai-konsultan" className="py-16 bg-gradient-to-br from-[#1a3a5c] to-[#0f2540]">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-700 uppercase tracking-widest text-yellow-300 bg-yellow-300/20 px-3 py-1 rounded-full">AI Konsultan</span>
          <h2 className="text-2xl lg:text-3xl font-800 text-white mt-3">AI Konsultan Hukum Anti Korupsi</h2>
          <p className="text-white/70 mt-2 text-sm max-w-xl mx-auto">
            Dapatkan informasi hukum anti korupsi secara instan dari AI kami yang terlatih dengan regulasi Indonesia.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Chat Header */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-t-2xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-[#1a3a5c]" />
              </div>
              <div>
                <div className="font-700 text-white text-sm">LNAKRI AI Legal Advisor</div>
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse-soft" />
                  Online — Siap Membantu
                </div>
              </div>
            </div>
            <button onClick={reset} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors" title="Reset percakapan">
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="bg-white/5 backdrop-blur-sm border-x border-white/20 h-96 overflow-y-auto p-5 space-y-4 scrollbar-hide">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-red-700' : 'bg-yellow-400'}`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-[#1a3a5c]" />}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-red-700 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/10'}`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-white/40">{msg.time}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                  <Bot size={16} className="text-[#1a3a5c]" />
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Questions */}
          <div className="bg-white/5 backdrop-blur-sm border-x border-white/20 px-5 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {quickQuestions.map((q, i) => (
              <button key={`quick-${i}`} onClick={() => sendMessage(q)}
                className="flex-shrink-0 text-xs bg-white/10 hover:bg-white/20 text-white/80 px-3 py-1.5 rounded-full border border-white/20 transition-colors">
                {q.length > 35 ? q.slice(0, 35) + '...' : q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-b-2xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 mt-1">
                <AppImage
                  src="/assets/images/a21354667_lnakrilogo-1776577431349.png"
                  alt="Logo kecil LNAKRI di form konsultasi AI"
                  width={32}
                  height={32}
                  className="opacity-70"
                />
              </div>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Tanyakan seputar hukum anti korupsi..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
              />
              <button onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                className="w-10 h-10 bg-red-700 hover:bg-red-800 disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-all active:scale-95">
                <Send size={16} />
              </button>
            </div>
            <p className="text-white/30 text-xs mt-2 text-center">
              AI ini memberikan informasi umum. Untuk konsultasi resmi hubungi tim LNAKRI.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}