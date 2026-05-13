'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Mail, Trash2, CheckCircle, X } from 'lucide-react';

type Suggestion = {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
  read: boolean;
};

export default function SuggestionInbox() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('dpplnakri@gmail.com');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/organization-profile');
        const data = await res.json();
        if (res.ok && data.profile?.email) {
          setAdminEmail(data.profile.email);
        }
      } catch (error) {
        console.error('Failed to fetch profile in SuggestionInbox:', error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/suggestions');
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      toast.error('Gagal mengambil data saran.');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/suggestions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, read: true } : s));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteSugg = async (id: string) => {
    try {
      const res = await fetch(`/api/suggestions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
        if (selected?.id === id) setSelected(null);
        toast.success('Saran dihapus.');
      } else {
        toast.error('Gagal menghapus saran.');
      }
    } catch (error) {
      console.error('Failed to delete suggestion:', error);
      toast.error('Terjadi kesalahan saat menghapus.');
    }
  };

  const openSugg = (s: Suggestion) => {
    setSelected(s);
    if (!s.read) {
      markRead(s.id);
    }
  };

  const unread = suggestions.filter(s => !s.read).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-800 text-[#1a3a5c] flex items-center gap-2">
          Kotak Saran
          {unread > 0 && <span className="bg-red-600 text-white text-xs font-800 px-2 py-0.5 rounded-full">{unread} baru</span>}
        </h2>
        <p className="text-gray-500 text-sm">Saran dari masyarakat dikirimkan ke {adminEmail}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Mail size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          Semua saran yang masuk juga dikirimkan ke <strong>{adminEmail}</strong> dan dapat dibaca oleh Pendiri Organisasi.
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Memuat saran...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Belum ada saran yang masuk.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {suggestions.map(s => (
            <div key={s.id}
              onClick={() => openSugg(s)}
              className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer hover:shadow-md transition-all duration-200 ${!s.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1a3a5c]/10 rounded-full flex items-center justify-center font-700 text-[#1a3a5c] text-xs">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-700 text-[#1a3a5c] text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!s.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                  <span className="text-xs text-gray-400">{s.date}</span>
                  <button onClick={e => { e.stopPropagation(); deleteSugg(s.id); }}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{s.message}</p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-800 text-[#1a3a5c]">Detail Saran</h3>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Nama</div>
                  <div className="font-700 text-[#1a3a5c]">{selected.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Email</div>
                  <div className="font-600 text-gray-700 text-sm">{selected.email}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-2">Pesan Saran</div>
                <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm leading-relaxed">{selected.message}</div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">{selected.date}</span>
                <div className="flex gap-2">
                  <button onClick={() => deleteSugg(selected.id)}
                    className="flex items-center gap-1.5 text-sm font-600 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Trash2 size={14} /> Hapus
                  </button>
                  <button onClick={() => setSelected(null)}
                    className="flex items-center gap-1.5 text-sm font-600 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                    <CheckCircle size={14} /> Selesai
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}