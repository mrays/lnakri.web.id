import React from 'react';
import AppImage from '@/components/ui/AppImage';
import { FileText } from 'lucide-react';
import { getMysqlPool } from '@/lib/mysql';
import { unstable_noStore as noStore } from 'next/cache';

type FounderRow = {
  id: number;
  full_name: string;
  position_title: string;
  decree_number: string;
  description: string;
  photo_url: string;
  photo_alt?: string;
};

export default async function FoundersSection() {
  noStore();
  const pool = getMysqlPool();
  const [rows] = await pool.query(
    `SELECT id, full_name, position_title, decree_number, description, photo_url, photo_alt
     FROM founders
     WHERE is_active = 1
     ORDER BY sort_order ASC, id ASC`
  );

  const founders = (rows as FounderRow[]).map((row) => ({
    id: String(row.id),
    name: row.full_name,
    jabatan: row.position_title,
    sk: row.decree_number,
    desc: row.description,
    photo: row.photo_url,
    photoAlt: row.photo_alt || `Foto ${row.position_title} ${row.full_name} LNAKRI NGO`,
  }));

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