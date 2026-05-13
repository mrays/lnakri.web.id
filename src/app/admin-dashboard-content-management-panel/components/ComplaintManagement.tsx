'use client';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, Filter, Eye, CheckCircle, AlertCircle, Download, X } from 'lucide-react';

type Complaint = {
  id: string;
  requestCode?: string;
  reporterName: string;
  email: string;
  subject: string;
  kronologis: string;
  status: 'diterima' | 'diproses' | 'selesai';
  date: string;
  time: string;
  type: 'keluhan' | 'mbg' | 'bantuan_hukum';
  hasDokumen: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentCount?: number;
  location?: string;
};

const mockComplaints: Complaint[] = [
  { id: 'cmp-001', reporterName: 'Ahmad Fauzi Santoso', email: 'ahmad.fauzi@gmail.com', subject: 'Dugaan korupsi proyek jalan desa Kab. Bogor senilai Rp 850 juta', kronologis: 'Pada bulan Februari 2026, proyek pembangunan jalan desa di Kecamatan Cibinong senilai Rp 850 juta diduga tidak sesuai spesifikasi. Jalan yang baru dibangun sudah rusak dalam waktu 2 bulan. Kontraktor diduga memiliki hubungan keluarga dengan kepala desa.', status: 'diterima', date: '19 Apr 2026', time: '06:23 WIB', type: 'keluhan', hasDokumen: true, location: 'Kab. Bogor, Jawa Barat' },
  { id: 'cmp-002', reporterName: 'Sari Dewi Pratiwi', email: 'saridewi@yahoo.com', subject: 'Penyimpangan dana BOS SMPN 14 Surabaya', kronologis: 'Kepala sekolah SMPN 14 Surabaya diduga menggunakan dana BOS untuk keperluan pribadi. Sejumlah guru melaporkan bahwa pengadaan buku tidak sesuai dengan laporan pertanggungjawaban.', status: 'diproses', date: '18 Apr 2026', time: '14:05 WIB', type: 'keluhan', hasDokumen: true, location: 'Kota Surabaya, Jawa Timur' },
  { id: 'cmp-003', reporterName: 'Budi Hermawan Wijaya', email: 'budiherman@hotmail.com', subject: 'Gratifikasi oknum DPRD Provinsi Jawa Tengah', kronologis: 'Seorang anggota DPRD Provinsi Jawa Tengah diduga menerima gratifikasi dari kontraktor proyek infrastruktur senilai Rp 200 juta.', status: 'diproses', date: '18 Apr 2026', time: '09:45 WIB', type: 'keluhan', hasDokumen: false, location: 'Kota Semarang, Jawa Tengah' },
  { id: 'cmp-004', reporterName: 'Nurul Hidayah Rahmawati', email: 'nurul.hidayah@gmail.com', subject: 'Korupsi pengadaan alat kesehatan RSUD Kab. Bekasi', kronologis: 'Pengadaan alat kesehatan di RSUD Kabupaten Bekasi diduga di-markup hingga 300% dari harga pasar. Direktur RSUD diduga menerima kickback dari vendor.', status: 'selesai', date: '17 Apr 2026', time: '16:30 WIB', type: 'keluhan', hasDokumen: true, location: 'Kab. Bekasi, Jawa Barat' },
  { id: 'cmp-005', reporterName: 'Joko Purnomo Hadi', email: 'jokopurnomo@gmail.com', subject: 'Laporan MBG: Penyimpangan di SDN 05 Medan', kronologis: 'Program MBG di SDN 05 Medan tidak berjalan sesuai ketentuan. Makanan yang diberikan tidak memenuhi standar gizi dan porsi jauh lebih sedikit dari yang dilaporkan.', status: 'diterima', date: '16 Apr 2026', time: '11:20 WIB', type: 'mbg', hasDokumen: true, location: 'Kota Medan, Sumatera Utara' },
  { id: 'cmp-006', reporterName: 'Ratna Sari Dewi', email: 'ratna.sari@gmail.com', subject: 'Permohonan Bantuan Hukum — Kasus Korupsi APBD', kronologis: 'Saya adalah mantan pegawai Dinas PU yang mengetahui adanya korupsi APBD dan diancam oleh atasan saya. Membutuhkan bantuan hukum and perlindungan.', status: 'diproses', date: '15 Apr 2026', time: '13:00 WIB', type: 'bantuan_hukum', hasDokumen: true, location: 'Kota Bandung, Jawa Barat' },
  { id: 'cmp-007', reporterName: 'Eko Susanto Wibowo', email: 'ekosusanto@gmail.com', subject: 'Korupsi dana desa Kec. Mlati, Sleman', kronologis: 'Kepala desa di Kecamatan Mlati, Kabupaten Sleman diduga menggunakan dana desa untuk kepentingan pribadi senilai Rp 400 juta.', status: 'selesai', date: '14 Apr 2026', time: '08:45 WIB', type: 'keluhan', hasDokumen: true, location: 'Kab. Sleman, DI Yogyakarta' },
  { id: 'cmp-008', reporterName: 'Dewi Anggraini', email: 'dewianggraini@gmail.com', subject: 'Laporan MBG: Makanan busuk di SMA Negeri 2 Makassar', kronologis: 'Makanan yang disajikan dalam program MBG di SMA Negeri 2 Makassar sudah tidak layak konsumsi. Diduga vendor MBG tidak memenuhi standar kebersihan.', status: 'diterima', date: '13 Apr 2026', time: '15:10 WIB', type: 'mbg', hasDokumen: true, location: 'Kota Makassar, Sulawesi Selatan' },
];

const typeLabel: Record<string, string> = {
  keluhan: 'Keluhan Umum',
  mbg: 'Laporan MBG',
  bantuan_hukum: 'Bantuan Hukum',
};

const typeColor: Record<string, string> = {
  keluhan: 'bg-blue-100 text-blue-700',
  mbg: 'bg-amber-100 text-amber-700',
  bantuan_hukum: 'bg-purple-100 text-purple-700',
};

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewComplaint, setViewComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints);
      } else {
        toast.error(data.message || 'Gagal memuat keluhan');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: Complaint['status']) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        const labels = { diterima: 'Diterima', diproses: 'Sedang Diproses', selesai: 'Selesai' };
        toast.success(`Status keluhan diperbarui menjadi: ${labels[newStatus]}`);
        if (viewComplaint?.id === id) setViewComplaint(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal memperbarui status');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    }
  };

  const filtered = complaints.filter(c => {
    const matchSearch = c.reporterName.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const downloadAttachment = (complaint: Complaint) => {
    if (!complaint.attachmentUrl) return;
    window.open(complaint.attachmentUrl, '_blank', 'noopener,noreferrer');
  };

  const statusCounts = {
    all: complaints.length,
    diterima: complaints.filter(c => c.status === 'diterima').length,
    diproses: complaints.filter(c => c.status === 'diproses').length,
    selesai: complaints.filter(c => c.status === 'selesai').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-800 text-[#1a3a5c]">Manajemen Keluhan Masyarakat</h2>
        <p className="text-gray-500 text-sm">Kelola dan tindak lanjuti laporan yang masuk dari masyarakat</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: `Semua (${statusCounts.all})` },
          { key: 'diterima', label: `Diterima (${statusCounts.diterima})` },
          { key: 'diproses', label: `Diproses (${statusCounts.diproses})` },
          { key: 'selesai', label: `Selesai (${statusCounts.selesai})` },
        ].map(tab => (
          <button key={`tab-${tab.key}`} onClick={() => setFilterStatus(tab.key)}
            className={`text-sm font-700 px-4 py-2 rounded-xl transition-all duration-150 ${filterStatus === tab.key ? 'bg-[#1a3a5c] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1a3a5c]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama pelapor, email, atau subjek..."
            className="input-field pl-9" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field w-auto bg-white">
          <option value="all">Semua Jenis</option>
          <option value="keluhan">Keluhan Umum</option>
          <option value="mbg">Laporan MBG</option>
          <option value="bantuan_hukum">Bantuan Hukum</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">Pelapor</th>
                <th className="text-left px-4 py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">Subjek</th>
                <th className="text-left px-4 py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">Jenis</th>
                <th className="text-left px-4 py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">Dokumen</th>
                <th className="text-left px-4 py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">Memuat data keluhan...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">Tidak ada keluhan ditemukan</td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3">
                      <div className="font-600 text-sm text-[#1a3a5c]">{c.reporterName}</div>
                      <div className="text-xs text-gray-500">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-gray-700 line-clamp-2">{c.subject}</p>
                      {c.location && <p className="text-xs text-gray-400 mt-0.5">{c.location}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-700 px-2.5 py-1 rounded-full ${typeColor[c.type]}`}>
                        {typeLabel[c.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{c.date}</div>
                      <div className="text-xs text-gray-400">{c.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={e => updateStatus(c.id, e.target.value as Complaint['status'])}
                        className={`text-xs font-700 px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] ${
                          c.status === 'diterima' ? 'bg-blue-100 text-blue-700' :
                          c.status === 'diproses'? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        <option value="diterima">Diterima</option>
                        <option value="diproses">Diproses</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {c.hasDokumen ? (
                        <span className="text-green-600 text-xs font-600 flex items-center gap-1"><CheckCircle size={12} /> Ada</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewComplaint(c)}
                        className="flex items-center gap-1.5 text-xs font-600 text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Eye size={13} /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-600">Tidak ada keluhan ditemukan</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewComplaint && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mt-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-800 text-[#1a3a5c]">Detail Keluhan #{viewComplaint.requestCode || viewComplaint.id}</h3>
              <button onClick={() => setViewComplaint(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Nomor Laporan</div>
                  <div className="font-700 text-red-700">{viewComplaint.requestCode || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Nama Pelapor</div>
                  <div className="font-700 text-[#1a3a5c]">{viewComplaint.reporterName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Email</div>
                  <div className="font-600 text-gray-700">{viewComplaint.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Tanggal</div>
                  <div className="font-600 text-gray-700">{viewComplaint.date} — {viewComplaint.time}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Lokasi</div>
                  <div className="font-600 text-gray-700">{viewComplaint.location || 'Tidak disebutkan'}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Subjek</div>
                <div className="font-600 text-[#1a3a5c] bg-gray-50 rounded-lg px-4 py-2">{viewComplaint.subject}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Kronologis</div>
                <div className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg px-4 py-3">{viewComplaint.kronologis}</div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div>
                  <div className="text-xs text-gray-500 font-600 uppercase tracking-wide mb-1">Status Saat Ini</div>
                  <select value={viewComplaint.status} onChange={e => updateStatus(viewComplaint.id, e.target.value as Complaint['status'])}
                    className={`text-sm font-700 px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] ${
                      viewComplaint.status === 'diterima' ? 'bg-blue-100 text-blue-700' :
                      viewComplaint.status === 'diproses'? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                    <option value="diterima">Diterima</option>
                    <option value="diproses">Sedang Diproses</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
                {viewComplaint.attachmentUrl ? (
                  <a
                    href={viewComplaint.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={viewComplaint.attachmentName || `lampiran-${viewComplaint.requestCode || viewComplaint.id}`}
                    className="flex items-center gap-2 text-sm font-600 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Download size={14} /> Unduh Dokumen Bukti
                  </a>
                ) : viewComplaint.hasDokumen ? (
                  <button
                    type="button"
                    onClick={() => downloadAttachment(viewComplaint)}
                    disabled={!viewComplaint.attachmentUrl}
                    className="flex items-center gap-2 text-sm font-600 text-gray-400 px-3 py-1.5 rounded-lg cursor-not-allowed"
                    title="Lampiran belum tersedia untuk diunduh"
                  >
                    <Download size={14} /> Dokumen tersedia
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}