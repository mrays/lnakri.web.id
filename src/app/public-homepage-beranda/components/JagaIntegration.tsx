import React from 'react';
import { ExternalLink, Globe, Building2, MapPin } from 'lucide-react';

export default function JagaIntegration() {
  return (
    <section id="jaga" className="py-16 bg-teal-50">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-700 uppercase tracking-widest text-teal-700 bg-teal-100 px-3 py-1 rounded-full">Integrasi</span>
          <h2 className="text-2xl lg:text-3xl font-800 text-[#1a3a5c] mt-3">Terintegrasi dengan JAGA.id</h2>
          <p className="text-gray-600 mt-2 text-sm max-w-xl mx-auto">
            LNAKRI NGO terintegrasi dengan platform JAGA (Jaringan Advokasi Governance dan Akuntabilitas) untuk akses layanan publik desa di seluruh Indonesia.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <Globe size={24} className="text-teal-700" />
                </div>
                <div>
                  <div className="text-white font-800 text-xl">JAGA.id</div>
                  <div className="text-teal-200 text-sm">Pelayanan Publik Desa Seluruh Indonesia</div>
                </div>
              </div>
              <a href="https://jaga.id/pelayanan-publik/desa" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-white text-teal-700 font-700 text-sm px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors">
                <ExternalLink size={14} />
                Buka JAGA.id
              </a>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                {[
                  { icon: <Building2 size={24} className="text-teal-700" />, title: 'Layanan Publik Desa', desc: 'Pantau dan akses informasi pelayanan publik desa di seluruh Indonesia melalui JAGA.id', key: 'jaga-layanan' },
                  { icon: <MapPin size={24} className="text-teal-700" />, title: 'Pemetaan Wilayah', desc: 'Data desa dan kelurahan yang terintegrasi untuk pemantauan korupsi di tingkat lokal', key: 'jaga-peta' },
                  { icon: <Globe size={24} className="text-teal-700" />, title: 'Transparansi Anggaran', desc: 'Akses informasi anggaran dan realisasi belanja desa untuk deteksi penyimpangan', key: 'jaga-anggaran' },
                ]?.map(item => (
                  <div key={item?.key} className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">{item?.icon}</div>
                    <h4 className="font-700 text-[#1a3a5c] text-sm mb-1.5">{item?.title}</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{item?.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#1a3a5c]/5 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Temukan dugaan korupsi di layanan publik desa? Gunakan JAGA.id untuk melihat data resmi, lalu laporkan kepada LNAKRI NGO untuk tindak lanjut investigasi.
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <a href="https://jaga.id/pelayanan-publik/desa" target="_blank" rel="noreferrer"
                    className="btn-secondary text-sm py-2 px-4">
                    <ExternalLink size={14} /> Akses JAGA
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}