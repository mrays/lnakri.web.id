import React from 'react';
import AppImage from '@/components/ui/AppImage';
import { FileText } from 'lucide-react';

const founders = [
{
  id: 'founder-001',
  name: 'Roddy Maruli Mazmur',
  jabatan: 'Ketua Umum / Pendiri',
  sk: 'SK No. 001/LNAKRI/I/2017',
  desc: 'Pendiri dan Ketua Umum LNAKRI NGO sejak 17 Januari 2017. Berpengalaman lebih dari 15 tahun di bidang hukum dan advokasi anti korupsi di Indonesia.',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_14081b9b5-1776578693341.png",
  photoAlt: 'Pria profesional berjas formal tersenyum sebagai pendiri organisasi anti korupsi'
},
{
  id: 'founder-002',
  name: 'Siti Rahayu Wulandari',
  jabatan: 'Sekretaris Jenderal',
  sk: 'SK No. 002/LNAKRI/I/2017',
  desc: 'Sekretaris Jenderal LNAKRI NGO. Ahli hukum tata negara dengan pengalaman di Lembaga Perlindungan Saksi dan Korban (LPSK).',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1925f5c93-1772982264890.png",
  photoAlt: 'Wanita profesional berpakaian resmi sebagai sekretaris jenderal lembaga NGO'
},
{
  id: 'founder-003',
  name: 'Budi Santoso Harianto',
  jabatan: 'Bendahara Umum',
  sk: 'SK No. 003/LNAKRI/I/2017',
  desc: 'Bendahara Umum LNAKRI NGO. Akuntan publik bersertifikat dengan spesialisasi audit keuangan lembaga publik dan NGO.',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_14e653504-1776578693620.png",
  photoAlt: 'Pria profesional berbaju batik sebagai bendahara umum organisasi kemasyarakatan'
},
{
  id: 'founder-004',
  name: 'Dr. Margaretha Simanungkalit',
  jabatan: 'Ketua Divisi Hukum',
  sk: 'SK No. 004/LNAKRI/I/2017',
  desc: 'Ketua Divisi Hukum LNAKRI NGO. Doktor Ilmu Hukum dari Universitas Indonesia dengan fokus penelitian hukum pidana korupsi.',
  photo: "https://img.rocket.new/generatedImages/rocket_gen_img_1c92163fd-1763294586994.png",
  photoAlt: 'Wanita akademisi berpakaian profesional sebagai ketua divisi hukum anti korupsi'
}];


export default function FoundersSection() {
  return (
    <section id="pendiri" className="py-16 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-700 uppercase tracking-widest text-[#1a3a5c] bg-[#1a3a5c]/10 px-3 py-1 rounded-full">Pengurus</span>
          <h2 className="text-2xl lg:text-3xl font-800 text-[#1a3a5c] mt-3">Pendiri & Pengurus LNAKRI</h2>
          <p className="text-gray-600 mt-2 text-sm max-w-xl mx-auto">Para pendiri dan pengurus yang berdedikasi mewujudkan Indonesia bebas korupsi.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {founders?.map((founder) =>
          <div key={founder?.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#1a3a5c]/10 to-red-50">
                <AppImage
                src={founder?.photo}
                alt={founder?.photoAlt}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 25vw" />
              
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <div className="text-xs font-700 text-[#1a3a5c]">{founder?.jabatan}</div>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-700 text-[#1a3a5c] text-base mb-1">{founder?.name}</h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <FileText size={12} className="text-red-600" />
                  <span className="text-xs text-gray-500 font-600">{founder?.sk}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{founder?.desc}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}