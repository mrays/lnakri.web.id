'use client';
import React, { useState } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

const mockStatuses: Record<string, { status: string; subject: string; date: string; updates: { time: string; status: string; note: string }[] }> = {
  'LNAKRI-123456': {
    status: 'diproses',
    subject: 'Dugaan korupsi proyek jalan desa Kab. Bogor',
    date: '19 Apr 2026',
    updates: [
      { time: '19 Apr 2026 06:23', status: 'diterima', note: 'Laporan diterima oleh sistem LNAKRI NGO.' },
      { time: '19 Apr 2026 08:45', status: 'diproses', note: 'Laporan sedang dikaji oleh Tim Investigasi LNAKRI.' },
    ],
  },
  'MBG-234567': {
    status: 'selesai',
    subject: 'Penyimpangan MBG di SDN 05 Medan',
    date: '16 Apr 2026',
    updates: [
      { time: '16 Apr 2026 11:20', status: 'diterima', note: 'Laporan MBG diterima.' },
      { time: '16 Apr 2026 14:00', status: 'diproses', note: 'Tim lapangan dikirim untuk verifikasi.' },
      { time: '17 Apr 2026 09:00', status: 'selesai', note: 'Laporan telah diteruskan ke Dinas Pendidikan Kota Medan dan BPOM. Tindakan perbaikan sudah dilakukan.' },
    ],
  },
};

const statusConfig = {
  diterima: { label: 'Diterima', color: 'text-blue-700 bg-blue-100', icon: <FileText size={16} className="text-blue-600" /> },
  diproses: { label: 'Sedang Diproses', color: 'text-amber-700 bg-amber-100', icon: <Clock size={16} className="text-amber-600" /> },
  selesai: { label: 'Selesai', color: 'text-green-700 bg-green-100', icon: <CheckCircle size={16} className="text-green-600" /> },
};

export default function StatusTracker() {
  const [phone, setPhone] = useState('082295592545');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/organization-profile');
        const data = await res.json();
        if (res.ok && data.profile?.phone) {
          setPhone(data.profile.phone);
        }
      } catch (error) {
        console.error('Failed to fetch profile in StatusTracker:', error);
      }
    };
    fetchProfile();
  }, []);

  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState<typeof mockStatuses[string] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!ticketId.trim()) return;
    setSearching(true);
    setNotFound(false);
    setResult(null);
    
    try {
      const res = await fetch(`/api/complaints/status/${ticketId.trim().toUpperCase()}`);
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else if (res.status === 404) {
        setNotFound(true);
      } else {
        toast.error(data.message || 'Gagal mengambil status laporan.');
      }
    } catch (error) {
      console.error('Failed to search status:', error);
      toast.error('Terjadi kesalahan saat mencari status.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div>
          <h2 className="font-800 text-[#1a3a5c] text-xl flex items-center gap-2">
            <Search size={20} className="text-purple-700" /> Cek Status Laporan
          </h2>
          <p className="text-gray-500 text-sm">Masukkan nomor tiket laporan Anda untuk melihat status terkini</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-5">
        <label className="label">Nomor Tiket Laporan</label>
        <p className="text-xs text-gray-500 mb-3">Nomor tiket dikirimkan ke email Anda saat laporan berhasil dikirim</p>
        <div className="flex gap-3">
          <input
            value={ticketId}
            onChange={e => setTicketId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="input-field flex-1 uppercase"
            placeholder="Contoh: LNAKRI-123456 atau MBG-234567"
          />
          <button onClick={handleSearch} disabled={!ticketId.trim() || searching}
            className="btn-primary text-sm py-2.5 min-w-[100px] justify-center disabled:opacity-60">
            {searching ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <><Search size={15} /> Cari</>}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Coba: LNAKRI-123456 atau MBG-234567 untuk demo</p>
      </div>

      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-700 text-red-700">Nomor Tiket Tidak Ditemukan</div>
            <p className="text-red-600 text-sm mt-1">Pastikan nomor tiket yang Anda masukkan benar. Jika masalah berlanjut, hubungi LNAKRI di dpplnakri@gmail.com atau WA {phone}.</p>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">
          <div className="bg-[#1a3a5c] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/60 text-xs font-600 uppercase tracking-wide">Nomor Tiket</div>
                <div className="text-white font-800 text-lg tracking-widest">{ticketId.toUpperCase()}</div>
              </div>
              <span className={`text-sm font-700 px-3 py-1.5 rounded-full ${statusConfig[result.status as keyof typeof statusConfig]?.color}`}>
                {statusConfig[result.status as keyof typeof statusConfig]?.label}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-5">
              <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Subjek Laporan</div>
              <div className="font-600 text-[#1a3a5c]">{result.subject}</div>
              <div className="text-xs text-gray-400 mt-1">Dilaporkan: {result.date}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-3">Riwayat Status</div>
              <div className="space-y-3">
                {result.updates.map((update, i) => {
                  const cfg = statusConfig[update.status as keyof typeof statusConfig];
                  return (
                    <div key={`update-${i}`} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg?.color}`}>
                          {cfg?.icon}
                        </div>
                        {i < result.updates.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 mt-1" />}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${cfg?.color}`}>{cfg?.label}</span>
                          <span className="text-xs text-gray-400">{update.time}</span>
                        </div>
                        <p className="text-sm text-gray-700">{update.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}