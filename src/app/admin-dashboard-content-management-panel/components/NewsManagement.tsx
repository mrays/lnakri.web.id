'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import { Plus, Edit2, Trash2, Eye, X, Upload, Save, Search, Calendar, User } from 'lucide-react';

type NewsItem = {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  status: 'published' | 'draft';
  date: string;
  time: string;
  image: string;
  imageAlt: string;
  views: number;
};

type NewsForm = {
  title: string;
  content: string;
  author: string;
  category: string;
  status: 'published' | 'draft';
};

const initialNews: NewsItem[] = [
{ id: 'news-admin-001', title: 'LNAKRI Ungkap Dugaan Korupsi Dana Desa Senilai Rp 2,3 Miliar di Kalimantan Timur', content: 'Tim investigasi LNAKRI NGO berhasil mengumpulkan bukti-bukti dugaan penyalahgunaan dana desa di tiga kecamatan di Kabupaten Kutai Kartanegara. Temuan ini telah dilaporkan kepada KPK dan Kejaksaan Negeri setempat. Proses penyelidikan masih berlangsung dan LNAKRI terus memantau perkembangan kasus ini.', excerpt: 'Tim investigasi LNAKRI NGO berhasil mengumpulkan bukti dugaan penyalahgunaan dana desa.', author: 'Redaksi LNAKRI', category: 'Investigasi', status: 'published', date: '19 April 2026', time: '08:30 WIB', image: "https://images.unsplash.com/photo-1719838687113-0afb71e6b961", imageAlt: 'Gedung pengadilan Indonesia dengan latar belakang merah putih', views: 1247 },
{ id: 'news-admin-002', title: 'Penyimpangan Program MBG Ditemukan di 5 Kabupaten', content: 'LNAKRI NGO menerima lebih dari 120 laporan terkait penyimpangan program Makan Bergizi Gratis (MBG) di berbagai daerah. Ketidaksesuaian antara anggaran dan realisasi mencapai 40 persen.', excerpt: 'Lebih dari 120 laporan diterima terkait penyimpangan MBG di berbagai daerah.', author: 'Tim Investigasi LNAKRI', category: 'Pemantauan MBG', status: 'published', date: '18 April 2026', time: '14:15 WIB', image: "https://img.rocket.new/generatedImages/rocket_gen_img_15a32aa64-1764666626124.png", imageAlt: 'Program makan bergizi gratis untuk anak sekolah Indonesia', views: 892 },
{ id: 'news-admin-003', title: 'Seminar Nasional Anti Korupsi 2026', content: 'LNAKRI NGO menyelenggarakan Seminar Nasional Anti Korupsi 2026 di Jakarta dengan menghadirkan pejabat KPK dan Kejaksaan Agung.', excerpt: 'Seminar nasional dihadiri lebih dari 500 peserta dari seluruh Indonesia.', author: 'Humas LNAKRI', category: 'Kegiatan', status: 'published', date: '15 April 2026', time: '09:00 WIB', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1acdcafba-1776578694696.png", imageAlt: 'Aula seminar anti korupsi nasional dengan peserta', views: 634 },
{ id: 'news-admin-004', title: 'Draft: Laporan Investigasi Korupsi Pengadaan Barang 2026', content: 'Draft investigasi terkait dugaan korupsi pengadaan barang dan jasa di beberapa kementerian.', excerpt: 'Draft laporan investigasi belum dipublikasikan.', author: 'Tim Investigasi', category: 'Investigasi', status: 'draft', date: '19 April 2026', time: '05:00 WIB', image: "https://img.rocket.new/generatedImages/rocket_gen_img_11ae7943a-1773044032274.png", imageAlt: 'Dokumen hukum dan palu hakim di meja pengadilan', views: 0 }];


const categories = ['Investigasi', 'Pemantauan MBG', 'Kegiatan', 'Perlindungan Hukum', 'Kerjasama', 'Laporan', 'Pengumuman'];

export default function NewsManagement() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [previewNews, setPreviewNews] = useState<NewsItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<NewsForm>();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (res.ok) {
        setNewsList(data.news);
      } else {
        toast.error(data.message || 'Gagal memuat berita');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingNews(null);
    setImageFile(null);
    setImagePreviewUrl('');
    reset({ title: '', content: '', author: 'Redaksi LNAKRI', category: 'Investigasi', status: 'published' });
    setShowForm(true);
  };

  const openEdit = (news: NewsItem) => {
    setEditingNews(news);
    setImagePreviewUrl(news.image);
    setImageFile(null);
    setValue('title', news.title);
    setValue('content', news.content);
    setValue('author', news.author);
    setValue('category', news.category);
    setValue('status', news.status);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const onSubmit = async (data: NewsForm) => {
    setSaving(true);
    
    let imageUrl = imagePreviewUrl;

    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      try {
        const uploadRes = await fetch('/api/uploads/news-image', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          imageUrl = uploadData.url;
        } else {
          toast.error(uploadData.message || 'Gagal upload gambar');
          setSaving(false);
          return;
        }
      } catch (error) {
        toast.error('Gagal upload gambar');
        setSaving(false);
        return;
      }
    }

    const payload = {
      ...data,
      image: imageUrl,
      imageAlt: `Gambar berita ${data.title}`,
    };

    try {
      const res = await fetch(editingNews ? `/api/news/${editingNews.id}` : '/api/news', {
        method: editingNews ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        if (editingNews) {
          setNewsList((prev) => prev.map((n) => n.id === editingNews.id ? { ...n, ...payload, id: editingNews.id } as NewsItem : n));
          toast.success('Berita berhasil diperbarui.');
        } else {
          setNewsList((prev) => [resData.news, ...prev]);
          toast.success('Berita baru berhasil dibuat.');
        }
        setShowForm(false);
        reset();
      } else {
        toast.error(resData.message || 'Gagal menyimpan berita');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNewsList((prev) => prev.filter((n) => n.id !== id));
        toast.success('Berita berhasil dihapus.');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal menghapus berita');
      }
    } catch (error) {
      toast.error('Gagal menyambung ke server');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = newsList.filter((n) =>
  n.title.toLowerCase().includes(search.toLowerCase()) ||
  n.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-800 text-[#1a3a5c]">Manajemen Berita</h2>
          <p className="text-gray-500 text-sm">Buat, edit, dan kelola berita yang ditayangkan ke publik</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">
          <Plus size={16} /> Buat Berita Baru
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari judul berita atau penulis..."
        className="input-field pl-9 max-w-md" />
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500">Memuat data berita...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">Belum ada berita.</div>
        ) : (
          filtered.map((news) => (
            <div key={news.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group">
              <div className="relative h-40 overflow-hidden">
                <AppImage
                src={news.image}
                alt={news.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-400"
                sizes="(max-width: 640px) 100vw, 33vw" />
              
                <div className="absolute top-2 right-2">
                  <span className={`text-xs font-700 px-2 py-0.5 rounded-full ${news.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {news.status === 'published' ? 'Publik' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-600 text-red-600 mb-1">{news.category}</div>
                <h4 className="font-700 text-[#1a3a5c] text-sm line-clamp-2 mb-2">{news.title}</h4>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><User size={10} />{news.author}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} />{news.date}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Eye size={10} /> {news.views} kunjungan
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <button onClick={() => setPreviewNews(news)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-600 text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors">
                    <Eye size={13} /> Preview
                  </button>
                  <button onClick={() => openEdit(news)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-600 text-amber-600 hover:bg-amber-50 py-1.5 rounded-lg transition-colors">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => setDeleteConfirm(news.id)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-600 text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors">
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm &&
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mt-6 mb-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-800 text-[#1a3a5c] text-lg">{editingNews ? 'Edit Berita' : 'Buat Berita Baru'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="label">Gambar Berita <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-500 mb-2">Upload gambar untuk ditampilkan bersama berita (JPG, PNG, maks 5MB)</p>
                <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-red-400 transition-colors">
                  {imagePreviewUrl ?
                <div className="relative">
                      <AppImage
                    src={imagePreviewUrl}
                    alt="Preview gambar berita yang akan diupload"
                    width={700}
                    height={250}
                    className="w-full h-48 object-cover"
                    unoptimized={imagePreviewUrl.startsWith('blob:')} />
                  
                      <button type="button" onClick={() => {setImageFile(null);setImagePreviewUrl('');}}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                        <X size={14} />
                      </button>
                    </div> :

                <label className="flex flex-col items-center gap-2 py-8 cursor-pointer">
                      <Upload size={28} className="text-gray-400" />
                      <span className="text-sm text-gray-500 font-600">Klik untuk upload gambar berita</span>
                      <span className="text-xs text-gray-400">JPG, PNG (maks. 5MB)</span>
                      <input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={handleImageChange} />
                    </label>
                }
                </div>
              </div>

              <div>
                <label className="label">Judul Berita <span className="text-red-500">*</span></label>
                <input {...register('title', { required: 'Judul berita wajib diisi' })}
              className="input-field" placeholder="Masukkan judul berita yang menarik..." />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Penulis <span className="text-red-500">*</span></label>
                  <input {...register('author', { required: 'Nama penulis wajib diisi' })}
                className="input-field" placeholder="Nama penulis" />
                  {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
                </div>
                <div>
                  <label className="label">Kategori</label>
                  <select {...register('category')} className="input-field bg-white">
                    {categories.map((cat) =>
                  <option key={`cat-${cat}`} value={cat}>{cat}</option>
                  )}
                  </select>
                </div>
                <div>
                  <label className="label">Status Publikasi</label>
                  <select {...register('status')} className="input-field bg-white">
                    <option value="published">Publik — Ditayangkan</option>
                    <option value="draft">Draft — Belum Tayang</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Isi Berita <span className="text-red-500">*</span></label>
                <p className="text-xs text-gray-500 mb-1.5">Tuliskan isi berita lengkap di sini. Akan ditampilkan saat pembaca mengklik judul berita.</p>
                <textarea {...register('content', { required: 'Isi berita wajib diisi', minLength: { value: 50, message: 'Isi berita minimal 50 karakter' } })}
              className="input-field resize-none" rows={10}
              placeholder="Tuliskan isi berita di sini. Sertakan fakta, kronologis, dan informasi yang relevan..." />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)}
              className="btn-outline text-sm py-2">Batal</button>
                <button type="submit" disabled={saving}
              className="btn-primary text-sm py-2 disabled:opacity-60 min-w-[140px] justify-center">
                  {saving ?
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Menyimpan...</> :

                <><Save size={15} />{editingNews ? 'Simpan Perubahan' : 'Publikasikan Berita'}</>
                }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      {/* Preview Modal */}
      {previewNews &&
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 overflow-y-auto animate-fade-in" onClick={() => setPreviewNews(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mt-6 mb-6 overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56">
              <AppImage src={previewNews.image} alt={previewNews.imageAlt} fill className="object-cover" sizes="100vw" />
              <button onClick={() => setPreviewNews(null)} className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>
            <div className="p-6">
              <span className="text-xs font-700 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{previewNews.category}</span>
              <h2 className="text-xl font-800 text-[#1a3a5c] mt-3 mb-3">{previewNews.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 border-b border-gray-100 mb-4">
                <span className="flex items-center gap-1"><User size={13} />{previewNews.author}</span>
                <span className="flex items-center gap-1"><Calendar size={13} />{previewNews.date}</span>
                <span>{previewNews.time}</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{previewNews.content}</p>
            </div>
          </div>
        </div>
      }

      {/* Delete Confirm Modal */}
      {deleteConfirm &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="font-800 text-[#1a3a5c] text-center text-lg mb-2">Hapus Berita?</h3>
            <p className="text-gray-600 text-sm text-center mb-5">Berita ini akan dihapus permanen dan tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline text-sm py-2 justify-center">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-700 hover:bg-red-800 text-white font-700 text-sm py-2 rounded-lg transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      }
    </div>);

}