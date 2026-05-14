SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

DROP TABLE IF EXISTS ai_chat_messages;
DROP TABLE IF EXISTS ai_chat_sessions;
DROP TABLE IF EXISTS site_visit_snapshots;
DROP TABLE IF EXISTS donation_submissions;
DROP TABLE IF EXISTS site_visit_daily_visitors;
DROP TABLE IF EXISTS site_visit_page_snapshots;
DROP TABLE IF EXISTS case_request_messages;
DROP TABLE IF EXISTS case_request_status_history;
DROP TABLE IF EXISTS case_request_attachments;
DROP TABLE IF EXISTS case_requests;
DROP TABLE IF EXISTS suggestions;
DROP TABLE IF EXISTS founders;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS news_posts;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS organization_profiles;

SET foreign_key_checks = 1;

CREATE TABLE organization_profiles (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  short_name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  vision TEXT NOT NULL,
  mission TEXT NOT NULL,
  slogan VARCHAR(255) NOT NULL,
  founded_date DATE NOT NULL,
  founded_city VARCHAR(120) NOT NULL,
  ahu_number VARCHAR(120) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(191) NOT NULL,
  instagram_url VARCHAR(255) NOT NULL,
  tiktok_url VARCHAR(255) NOT NULL,
  facebook_url VARCHAR(255) NOT NULL,
  whatsapp_url VARCHAR(255) DEFAULT NULL,
  website_url VARCHAR(255) DEFAULT NULL,
  logo_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','editor','viewer') NOT NULL DEFAULT 'super_admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE news_posts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(220) NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  author_name VARCHAR(191) NOT NULL,
  category VARCHAR(80) NOT NULL,
  status ENUM('published','draft','archived') NOT NULL DEFAULT 'draft',
  image_url VARCHAR(500) DEFAULT NULL,
  image_alt VARCHAR(255) DEFAULT NULL,
  views_count INT UNSIGNED NOT NULL DEFAULT 0,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  published_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_news_posts_slug (slug),
  KEY idx_news_posts_status_published_at (status, published_at),
  KEY idx_news_posts_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE announcements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority ENUM('urgent','penting','info') NOT NULL DEFAULT 'info',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  published_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_announcements_active_priority (is_active, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE founders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(191) NOT NULL,
  position_title VARCHAR(191) NOT NULL,
  decree_number VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  photo_url VARCHAR(500) DEFAULT NULL,
  photo_alt VARCHAR(255) DEFAULT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_founders_decree_number (decree_number),
  KEY idx_founders_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE suggestions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  source_page VARCHAR(120) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  KEY idx_suggestions_read_created_at (is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE case_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_code VARCHAR(64) NOT NULL,
  request_type ENUM('keluhan','mbg','bantuan_hukum','perlindungan','konsultasi') NOT NULL,
  status ENUM('draft','diterima','diproses','selesai','ditolak') NOT NULL DEFAULT 'diterima',
  reporter_name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  subject VARCHAR(255) DEFAULT NULL,
  location VARCHAR(255) DEFAULT NULL,
  description LONGTEXT NOT NULL,
  involved_parties TEXT DEFAULT NULL,
  estimated_loss VARCHAR(120) DEFAULT NULL,
  source_page VARCHAR(120) NOT NULL,
  assigned_admin_id BIGINT UNSIGNED DEFAULT NULL,
  extra_data JSON DEFAULT NULL,
  public_note TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at DATETIME DEFAULT NULL,
  UNIQUE KEY uq_case_requests_request_code (request_code),
  KEY idx_case_requests_type_status (request_type, status),
  KEY idx_case_requests_email_created_at (email, created_at),
  CONSTRAINT fk_case_requests_assigned_admin
    FOREIGN KEY (assigned_admin_id) REFERENCES admin_users (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE case_request_attachments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  case_request_id BIGINT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) DEFAULT NULL,
  file_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) DEFAULT NULL,
  file_size_bytes BIGINT UNSIGNED DEFAULT NULL,
  storage_driver VARCHAR(50) DEFAULT NULL,
  uploaded_by ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_case_request_attachments_case_request_id (case_request_id),
  CONSTRAINT fk_case_request_attachments_case_request
    FOREIGN KEY (case_request_id) REFERENCES case_requests (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE case_request_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  case_request_id BIGINT UNSIGNED NOT NULL,
  old_status ENUM('draft','diterima','diproses','selesai','ditolak') DEFAULT NULL,
  new_status ENUM('draft','diterima','diproses','selesai','ditolak') NOT NULL,
  note TEXT DEFAULT NULL,
  changed_by_admin_id BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_case_request_status_history_case_request_id (case_request_id),
  KEY idx_case_request_status_history_changed_by_admin_id (changed_by_admin_id),
  CONSTRAINT fk_case_request_status_history_case_request
    FOREIGN KEY (case_request_id) REFERENCES case_requests (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_case_request_status_history_changed_by_admin
    FOREIGN KEY (changed_by_admin_id) REFERENCES admin_users (id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE case_request_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  case_request_id BIGINT UNSIGNED NOT NULL,
  sender_role ENUM('user','admin','system','ai') NOT NULL,
  sender_name VARCHAR(191) NOT NULL,
  message LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_case_request_messages_case_request_id (case_request_id),
  CONSTRAINT fk_case_request_messages_case_request
    FOREIGN KEY (case_request_id) REFERENCES case_requests (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE donation_submissions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  donor_name VARCHAR(191) NOT NULL,
  donor_email VARCHAR(191) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  note TEXT DEFAULT NULL,
  bank_name VARCHAR(120) NOT NULL DEFAULT 'BCA',
  bank_account_number VARCHAR(50) NOT NULL,
  bank_account_name VARCHAR(191) NOT NULL,
  proof_file_name VARCHAR(255) DEFAULT NULL,
  proof_file_url VARCHAR(500) DEFAULT NULL,
  status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  verified_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_donation_submissions_status_created_at (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_visit_snapshots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  granularity ENUM('daily','monthly','yearly') NOT NULL,
  period_label VARCHAR(50) NOT NULL,
  period_date DATE DEFAULT NULL,
  visits INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_site_visit_snapshots_granularity_period_date (granularity, period_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_visit_page_snapshots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  period_date DATE NOT NULL,
  path VARCHAR(255) NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  visits INT UNSIGNED NOT NULL DEFAULT 0,
  unique_visitors INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_site_visit_page_period_path (period_date, path),
  KEY idx_site_visit_page_period_visits (period_date, visits)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE site_visit_daily_visitors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  period_date DATE NOT NULL,
  visitor_hash CHAR(64) NOT NULL,
  first_path VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_site_visit_daily_visitor (period_date, visitor_hash),
  KEY idx_site_visit_daily_period (period_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_chat_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_code VARCHAR(64) NOT NULL,
  visitor_label VARCHAR(191) DEFAULT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ai_chat_sessions_session_code (session_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_chat_messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ai_chat_session_id BIGINT UNSIGNED NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  content LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ai_chat_messages_ai_chat_session_id (ai_chat_session_id),
  CONSTRAINT fk_ai_chat_messages_ai_chat_session
    FOREIGN KEY (ai_chat_session_id) REFERENCES ai_chat_sessions (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO organization_profiles (
  id, full_name, short_name, description, vision, mission, slogan,
  founded_date, founded_city, ahu_number, address, phone, email,
  instagram_url, tiktok_url, facebook_url, whatsapp_url, website_url, logo_url
) VALUES (
  1,
  'Lembaga Nasional Anti Korupsi RI',
  'LNAKRI NGO',
  'LNAKRI NGO adalah lembaga independen yang bergerak dalam bidang pemantauan anti korupsi dan investigasi korupsi di seluruh Indonesia.',
  'Terwujudnya Indonesia yang bebas dari korupsi melalui pemantauan, investigasi, dan penegakan hukum yang adil dan transparan.',
  'Menerima dan menindaklanjuti laporan korupsi dari masyarakat; Melindungi saksi dan pelapor korupsi; Mengedukasi masyarakat tentang bahaya korupsi; Berkoordinasi dengan KPK, Kejaksaan, dan Kepolisian.',
  'SIAP MEMBANTU DAN BERANTAS KORUPSI, JANGAN TAKUT BERSUARA!!',
  '2017-01-17',
  'Jakarta',
  'AHU-0001643.AH.01.07.TAHUN 2017',
  'Jakarta, Indonesia',
  '082295592545',
  'dpplnakri@gmail.com',
  'https://www.instagram.com/lnakri_ngo',
  'https://www.tiktok.com/@lnakri_ngo',
  'https://www.facebook.com/lnakri.ngo',
  'https://wa.me/6282295592545',
  'https://lnakri.org',
  '/assets/images/a21354667_lnakrilogo-1776577431349.png'
);

INSERT INTO admin_users (id, full_name, email, password_hash, role, is_active, last_login_at) VALUES
(1, 'Admin LNAKRI', 'dpplnakri@gmail.com', '$2y$12$CHANGE_THIS_HASH_BEFORE_PRODUCTION', 'super_admin', 1, NULL);

INSERT INTO news_posts (
  id, slug, title, excerpt, content, author_name, category, status,
  image_url, image_alt, views_count, featured, published_at
) VALUES
(1, 'lnakri-ungkap-dugaan-korupsi-dana-desa-senilai-2-3-miliar-di-kalimantan-timur', 'LNAKRI Ungkap Dugaan Korupsi Dana Desa Senilai Rp 2,3 Miliar di Kalimantan Timur', 'Tim investigasi LNAKRI NGO berhasil mengumpulkan bukti-bukti dugaan penyalahgunaan dana desa di tiga kecamatan di Kabupaten Kutai Kartanegara. Temuan ini telah dilaporkan kepada KPK dan Kejaksaan Negeri setempat.', 'Tim investigasi LNAKRI NGO berhasil mengumpulkan bukti-bukti dugaan penyalahgunaan dana desa di tiga kecamatan di Kabupaten Kutai Kartanegara. Temuan ini telah dilaporkan kepada KPK dan Kejaksaan Negeri setempat. Proses penyelidikan masih berlangsung.', 'Redaksi LNAKRI', 'Investigasi', 'published', 'https://images.unsplash.com/photo-1719838687113-0afb71e6b961', 'Gedung pengadilan dengan latar belakang bendera merah putih Indonesia', 1247, 1, '2026-04-19 08:30:00'),
(2, 'penyimpangan-program-mbg-ditemukan-di-5-kabupaten-lnakri-desak-penindakan', 'Penyimpangan Program MBG Ditemukan di 5 Kabupaten - LNAKRI Desak Penindakan', 'LNAKRI NGO menerima lebih dari 120 laporan terkait penyimpangan program Makan Bergizi Gratis (MBG) di berbagai daerah. Ketidaksesuaian antara anggaran dan realisasi mencapai 40 persen.', 'LNAKRI NGO menerima lebih dari 120 laporan terkait penyimpangan program MBG. Investigasi lapangan dilakukan di 5 kabupaten.', 'Tim Investigasi LNAKRI', 'Pemantauan MBG', 'published', 'https://img.rocket.new/generatedImages/rocket_gen_img_1e951567d-1776578696347.png', 'Anak-anak sekolah dasar menerima program makan bergizi gratis di kantin sekolah', 892, 0, '2026-04-18 14:15:00'),
(3, 'seminar-nasional-anti-korupsi-2026-lnakri-hadirkan-narasumber-kpk-dan-kejagung', 'Seminar Nasional Anti Korupsi 2026: LNAKRI Hadirkan Narasumber KPK dan Kejagung', 'LNAKRI NGO menyelenggarakan Seminar Nasional Anti Korupsi 2026 di Jakarta dengan menghadirkan pejabat KPK, Kejaksaan Agung, dan akademisi hukum pidana dari berbagai universitas terkemuka.', 'Seminar nasional dihadiri lebih dari 500 peserta dari seluruh Indonesia. Topik utama: strategi pemberantasan korupsi sistemik.', 'Humas LNAKRI', 'Kegiatan', 'published', 'https://images.unsplash.com/photo-1655337690567-412b268eacc6', 'Aula seminar dengan peserta yang menghadiri presentasi anti korupsi nasional', 634, 0, '2026-04-15 09:00:00'),
(4, 'lnakri-berhasil-dampingi-47-saksi-korupsi-mendapatkan-perlindungan-hukum', 'LNAKRI Berhasil Dampingi 47 Saksi Korupsi Mendapatkan Perlindungan Hukum', 'Sepanjang kuartal pertama 2026, LNAKRI NGO berhasil mendampingi 47 saksi dan pelapor korupsi untuk mendapatkan perlindungan hukum resmi dari LPSK.', 'Program perlindungan hukum LNAKRI terus berkembang. 47 saksi berhasil mendapatkan perlindungan formal dari LPSK.', 'Divisi Hukum LNAKRI', 'Perlindungan Hukum', 'published', 'https://img.rocket.new/generatedImages/rocket_gen_img_11ae7943a-1773044032274.png', 'Dokumen hukum dan palu hakim di atas meja pengadilan Indonesia', 521, 0, '2026-04-12 11:45:00'),
(5, 'koordinasi-lnakri-dengan-ombudsman-ri-terkait-pengaduan-pelayanan-publik-korup', 'Koordinasi LNAKRI dengan Ombudsman RI Terkait Pengaduan Pelayanan Publik Korup', 'LNAKRI NGO melakukan koordinasi resmi dengan Ombudsman Republik Indonesia untuk mengintegrasikan sistem pengaduan pelayanan publik yang terindikasi korupsi.', 'MoU ditandatangani antara LNAKRI dan Ombudsman RI untuk penanganan terpadu pengaduan korupsi pelayanan publik.', 'Sekretariat LNAKRI', 'Kerjasama', 'published', 'https://img.rocket.new/generatedImages/rocket_gen_img_196a9e607-1769514072554.png', 'Penandatanganan nota kesepahaman di kantor pemerintahan Indonesia dengan pejabat resmi', 498, 0, '2026-04-10 16:00:00'),
(6, 'laporan-tahunan-lnakri-2025-2847-laporan-korupsi-berhasil-ditindaklanjuti', 'Laporan Tahunan LNAKRI 2025: 2.847 Laporan Korupsi Berhasil Ditindaklanjuti', 'LNAKRI NGO merilis laporan tahunan 2025 yang mencatat pencapaian signifikan: 2.847 laporan korupsi diterima, 1.203 kasus ditangani aktif, dan 389 permohonan perlindungan hukum berhasil diproses.', 'Laporan tahunan 2025 menunjukkan peningkatan 34% dari tahun sebelumnya dalam jumlah laporan yang diterima dan ditindaklanjuti.', 'Roddy Maruli Mazmur', 'Laporan', 'published', 'https://img.rocket.new/generatedImages/rocket_gen_img_1ae72f59b-1776578692669.png', 'Grafik laporan tahunan dengan data statistik anti korupsi Indonesia tahun 2025', 376, 0, '2026-04-05 10:30:00');

INSERT INTO announcements (
  id, title, content, priority, is_active, published_at
) VALUES
(1, 'Pembukaan Pendaftaran Relawan Anti Korupsi LNAKRI 2026', 'LNAKRI NGO membuka pendaftaran relawan anti korupsi untuk periode 2026. Relawan akan dilibatkan dalam kegiatan pemantauan, investigasi, dan edukasi masyarakat di seluruh Indonesia. Pendaftaran dibuka hingga 30 April 2026.', 'penting', 1, '2026-04-17 00:00:00'),
(2, 'Perubahan Prosedur Pengaduan: Wajib Sertakan KTP Digital', 'Mulai 1 Mei 2026, setiap pengaduan korupsi yang masuk ke LNAKRI wajib menyertakan salinan KTP digital pelapor untuk verifikasi identitas. Hal ini untuk memastikan keabsahan laporan dan memudahkan proses tindak lanjut.', 'urgent', 1, '2026-04-14 00:00:00'),
(3, 'LNAKRI Resmi Bergabung dengan Jaringan Anti Korupsi Asia Tenggara', 'LNAKRI NGO resmi bergabung sebagai anggota Southeast Asia Anti-Corruption Network (SAACN) yang beranggotakan 47 organisasi dari 11 negara. Keanggotaan ini memperluas jangkauan dan kapasitas investigasi LNAKRI.', 'info', 1, '2026-04-10 00:00:00'),
(4, 'Jadwal Pelayanan Konsultasi Hukum Gratis - April 2026', 'LNAKRI NGO menyelenggarakan konsultasi hukum gratis setiap Rabu dan Jumat pukul 09.00-12.00 WIB. Layanan ini terbuka untuk masyarakat yang membutuhkan panduan hukum terkait kasus korupsi.', 'info', 1, '2026-04-08 00:00:00');

INSERT INTO founders (
  id, full_name, position_title, decree_number, description, photo_url, photo_alt, sort_order, is_active
) VALUES
(1, 'Roddy Maruli Mazmur', 'Ketua Umum / Pendiri', 'SK No. 001/LNAKRI/I/2017', 'Pendiri dan Ketua Umum LNAKRI NGO sejak 17 Januari 2017. Berpengalaman lebih dari 15 tahun di bidang hukum dan advokasi anti korupsi di Indonesia.', 'https://img.rocket.new/generatedImages/rocket_gen_img_14081b9b5-1776578693341.png', 'Pria profesional berjas formal tersenyum sebagai pendiri organisasi anti korupsi', 1, 1),
(2, 'Siti Rahayu Wulandari', 'Sekretaris Jenderal', 'SK No. 002/LNAKRI/I/2017', 'Sekretaris Jenderal LNAKRI NGO. Ahli hukum tata negara dengan pengalaman di Lembaga Perlindungan Saksi dan Korban (LPSK).', 'https://img.rocket.new/generatedImages/rocket_gen_img_1925f5c93-1772982264890.png', 'Wanita profesional berpakaian resmi sebagai sekretaris jenderal lembaga NGO', 2, 1),
(3, 'Budi Santoso Harianto', 'Bendahara Umum', 'SK No. 003/LNAKRI/I/2017', 'Bendahara Umum LNAKRI NGO. Akuntan publik bersertifikat dengan spesialisasi audit keuangan lembaga publik dan NGO.', 'https://img.rocket.new/generatedImages/rocket_gen_img_14e653504-1776578693620.png', 'Pria profesional berbaju batik sebagai bendahara umum organisasi kemasyarakatan', 3, 1),
(4, 'Dr. Margaretha Simanungkalit', 'Ketua Divisi Hukum', 'SK No. 004/LNAKRI/I/2017', 'Ketua Divisi Hukum LNAKRI NGO. Doktor Ilmu Hukum dari Universitas Indonesia dengan fokus penelitian hukum pidana korupsi.', 'https://img.rocket.new/generatedImages/rocket_gen_img_1c92163fd-1763294586994.png', 'Wanita akademisi berpakaian profesional sebagai ketua divisi hukum anti korupsi', 4, 1);

INSERT INTO suggestions (id, full_name, email, message, is_read, source_page, created_at) VALUES
(1, 'Hendra Kusuma', 'hendra.k@gmail.com', 'Mohon LNAKRI dapat memperluas jangkauan ke daerah Kalimantan Barat. Banyak kasus korupsi yang belum tersentuh di sana.', 0, 'public-homepage', '2026-04-19 00:00:00'),
(2, 'Rina Susanti', 'rinasusanti@yahoo.com', 'Aplikasi ini sangat membantu. Saya sarankan untuk menambahkan fitur tracking status laporan melalui SMS agar lebih mudah diakses masyarakat pedesaan.', 0, 'public-homepage', '2026-04-18 00:00:00'),
(3, 'Denny Pratama', 'dennypratama@gmail.com', 'Tolong tambahkan panduan langkah demi langkah cara melaporkan korupsi dalam format video yang mudah dipahami masyarakat awam.', 1, 'public-homepage', '2026-04-17 00:00:00'),
(4, 'Wahyu Indrawati', 'wahyuindra@hotmail.com', 'Saya mengapresiasi kerja LNAKRI. Saran saya: buat forum diskusi publik tentang anti korupsi agar masyarakat lebih teredukasi.', 1, 'public-homepage', '2026-04-15 00:00:00'),
(5, 'Agus Salim', 'agussalim@gmail.com', 'Mohon LNAKRI dapat berkolaborasi dengan media lokal untuk menyebarluaskan informasi tentang hak-hak pelapor korupsi.', 0, 'public-homepage', '2026-04-14 00:00:00');

INSERT INTO case_requests (
  id, request_code, request_type, status, reporter_name, email, phone, subject, location,
  description, involved_parties, estimated_loss, source_page, assigned_admin_id, extra_data, public_note,
  created_at, updated_at, closed_at
) VALUES
(1, 'LNAKRI-123456', 'keluhan', 'diproses', 'Ahmad Fauzi Santoso', 'ahmad.fauzi@gmail.com', NULL, 'Dugaan korupsi proyek jalan desa Kab. Bogor senilai Rp 850 juta', 'Kab. Bogor, Jawa Barat', 'Pada bulan Februari 2026, proyek pembangunan jalan desa di Kecamatan Cibinong senilai Rp 850 juta diduga tidak sesuai spesifikasi. Jalan yang baru dibangun sudah rusak dalam waktu 2 bulan. Kontraktor diduga memiliki hubungan keluarga dengan kepala desa.', 'Kontraktor proyek dan kepala desa', 'Rp 850 juta', 'public-complaint-form', 1, JSON_OBJECT('hasDokumen', true), NULL, '2026-04-19 06:23:00', '2026-04-19 08:45:00', NULL),
(2, 'LNAKRI-223456', 'keluhan', 'diterima', 'Sari Dewi Pratiwi', 'saridewi@yahoo.com', NULL, 'Penyimpangan dana BOS SMPN 14 Surabaya', 'Kota Surabaya, Jawa Timur', 'Kepala sekolah SMPN 14 Surabaya diduga menggunakan dana BOS untuk keperluan pribadi. Sejumlah guru melaporkan bahwa pengadaan buku tidak sesuai dengan laporan pertanggungjawaban.', NULL, NULL, 'public-complaint-form', 1, JSON_OBJECT('hasDokumen', true), NULL, '2026-04-18 14:05:00', '2026-04-18 14:05:00', NULL),
(3, 'LNAKRI-323456', 'keluhan', 'diproses', 'Budi Hermawan Wijaya', 'budiherman@hotmail.com', NULL, 'Gratifikasi oknum DPRD Provinsi Jawa Tengah', 'Kota Semarang, Jawa Tengah', 'Seorang anggota DPRD Provinsi Jawa Tengah diduga menerima gratifikasi dari kontraktor proyek infrastruktur senilai Rp 200 juta.', 'Oknum DPRD dan kontraktor proyek', 'Rp 200 juta', 'public-complaint-form', 1, JSON_OBJECT('hasDokumen', false), NULL, '2026-04-18 09:45:00', '2026-04-18 09:45:00', NULL),
(4, 'LNAKRI-423456', 'keluhan', 'selesai', 'Nurul Hidayah Rahmawati', 'nurul.hidayah@gmail.com', NULL, 'Korupsi pengadaan alat kesehatan RSUD Kab. Bekasi', 'Kab. Bekasi, Jawa Barat', 'Pengadaan alat kesehatan di RSUD Kabupaten Bekasi diduga di-markup hingga 300% dari harga pasar. Direktur RSUD diduga menerima kickback dari vendor.', 'Direktur RSUD dan vendor alat kesehatan', '300% markup', 'public-complaint-form', 1, JSON_OBJECT('hasDokumen', true), NULL, '2026-04-17 16:30:00', '2026-04-17 16:30:00', '2026-04-18 10:00:00'),
(5, 'MBG-523456', 'mbg', 'diterima', 'Joko Purnomo Hadi', 'jokopurnomo@gmail.com', NULL, 'Laporan MBG: Penyimpangan di SDN 05 Medan', 'Kota Medan, Sumatera Utara', 'Program MBG di SDN 05 Medan tidak berjalan sesuai ketentuan. Makanan yang diberikan tidak memenuhi standar gizi dan porsi jauh lebih sedikit dari yang dilaporkan.', NULL, NULL, 'mbg-report-form', 1, JSON_OBJECT('schoolName', 'SDN 05 Medan', 'province', 'Sumatera Utara', 'district', 'Kota Medan', 'studentCount', '300 siswa', 'googleMapsLink', NULL, 'violationType', 'Makanan tidak memenuhi standar gizi', 'hasDokumen', true), NULL, '2026-04-16 11:20:00', '2026-04-16 11:20:00', NULL),
(6, 'BH-623456', 'bantuan_hukum', 'diproses', 'Ratna Sari Dewi', 'ratna.sari@gmail.com', '081234567890', 'Permohonan Bantuan Hukum - Kasus Korupsi APBD', 'Kota Bandung, Jawa Barat', 'Saya adalah mantan pegawai Dinas PU yang mengetahui adanya korupsi APBD dan diancam oleh atasan saya. Membutuhkan bantuan hukum dan perlindungan.', 'Atasan di Dinas PU', NULL, 'legal-aid-form', 1, JSON_OBJECT('jenisBantuan', 'Bantuan hukum terkait gratifikasi/suap', 'sudahLapor', 'Sudah lapor ke Polda, belum ada tindak lanjut', 'address', 'Kota Bandung, Jawa Barat', 'hasDokumen', true), NULL, '2026-04-15 13:00:00', '2026-04-15 13:00:00', NULL),
(7, 'LPSK-DRAFT-723456', 'perlindungan', 'draft', 'Andi Saputra', 'andi.saputra@example.com', '081298765432', 'Draft Permohonan Perlindungan Hukum Saksi', 'Jakarta', 'Pemohon mengajukan perlindungan sebagai saksi dan pelapor kasus korupsi karena menerima ancaman fisik dan intimidasi.', 'Pihak terlapor dan pihak yang mengancam', NULL, 'legal-protection-form', 1, JSON_OBJECT('nik', '3175090101010001', 'peranDalamKasus', 'pelapor', 'sudahLaporLPSK', 'belum', 'butuhPerlindunganFisik', true, 'butuhPerlindunganIdentitas', true, 'butuhPerlindunganHukum', true, 'hasDokumen', true), 'Identitas dijaga kerahasiaannya', '2026-04-15 09:30:00', '2026-04-15 09:30:00', NULL),
(8, 'KONS-823456', 'konsultasi', 'diproses', 'Maya Prameswari', 'maya.prameswari@example.com', '081299991111', 'Konsultasi tentang dugaan korupsi di instansi', 'Bandung', 'Pengguna mengajukan konsultasi awal mengenai langkah hukum yang harus ditempuh setelah menemukan dugaan korupsi di tempat kerja.', 'Tidak ada', NULL, 'consultation-form', 1, JSON_OBJECT('topik', 'Cara melaporkan korupsi', 'pertanyaan', 'Saya ingin tahu langkah yang harus saya ambil ketika menemukan dugaan korupsi di instansi tempat saya bekerja.'), NULL, '2026-04-19 10:00:00', '2026-04-19 10:15:00', NULL);

INSERT INTO case_request_attachments (case_request_id, file_name, original_file_name, file_url, mime_type, file_size_bytes, storage_driver, uploaded_by) VALUES
(1, 'bukti-jalan-desa-1.pdf', 'bukti-jalan-desa-1.pdf', '/uploads/cases/LNAKRI-123456/bukti-jalan-desa-1.pdf', 'application/pdf', 245760, 'local', 'user'),
(2, 'bukti-bos-1.jpg', 'bukti-bos-1.jpg', '/uploads/cases/LNAKRI-223456/bukti-bos-1.jpg', 'image/jpeg', 512000, 'local', 'user'),
(5, 'bukti-mbg-1.png', 'bukti-mbg-1.png', '/uploads/cases/MBG-523456/bukti-mbg-1.png', 'image/png', 389120, 'local', 'user'),
(6, 'bukti-bantuan-hukum-1.pdf', 'bukti-bantuan-hukum-1.pdf', '/uploads/cases/BH-623456/bukti-bantuan-hukum-1.pdf', 'application/pdf', 198400, 'local', 'user'),
(7, 'bukti-perlindungan-1.pdf', 'bukti-perlindungan-1.pdf', '/uploads/cases/LPSK-DRAFT-723456/bukti-perlindungan-1.pdf', 'application/pdf', 154624, 'local', 'user');

INSERT INTO case_request_status_history (case_request_id, old_status, new_status, note, changed_by_admin_id, created_at) VALUES
(1, NULL, 'diterima', 'Laporan diterima oleh sistem LNAKRI NGO.', 1, '2026-04-19 06:23:00'),
(1, 'diterima', 'diproses', 'Laporan sedang dikaji oleh Tim Investigasi LNAKRI.', 1, '2026-04-19 08:45:00'),
(2, NULL, 'diterima', 'Laporan diterima.', 1, '2026-04-18 14:05:00'),
(3, NULL, 'diterima', 'Laporan diterima.', 1, '2026-04-18 09:45:00'),
(4, NULL, 'diterima', 'Laporan diterima.', 1, '2026-04-17 16:30:00'),
(4, 'diterima', 'diproses', 'Tim investigasi sudah melakukan verifikasi awal.', 1, '2026-04-18 08:15:00'),
(4, 'diproses', 'selesai', 'Kasus diteruskan ke pihak berwenang dan tindak lanjut sudah dilakukan.', 1, '2026-04-18 10:00:00'),
(5, NULL, 'diterima', 'Laporan MBG diterima.', 1, '2026-04-16 11:20:00'),
(6, NULL, 'diterima', 'Permohonan bantuan hukum diterima.', 1, '2026-04-15 13:00:00'),
(6, 'diterima', 'diproses', 'Tim hukum mulai menyiapkan pendampingan.', 1, '2026-04-15 15:30:00'),
(7, NULL, 'draft', 'Draft perlindungan hukum berhasil disimpan.', 1, '2026-04-15 09:30:00'),
(8, NULL, 'diterima', 'Sesi konsultasi dibuka.', 1, '2026-04-19 10:00:00'),
(8, 'diterima', 'diproses', 'Tim konsultan hukum sedang menyiapkan jawaban.', 1, '2026-04-19 10:15:00');

INSERT INTO case_request_messages (case_request_id, sender_role, sender_name, message, created_at) VALUES
(8, 'admin', 'Tim LNAKRI NGO', 'Selamat datang Maya Prameswari! Saya dari tim konsultan hukum LNAKRI NGO. Anda mengajukan konsultasi tentang cara melaporkan korupsi. Silakan sampaikan pertanyaan atau kronologis Anda, dan kami akan segera membantu.', '2026-04-19 10:00:00'),
(8, 'user', 'Maya Prameswari', 'Saya ingin tahu langkah yang harus saya ambil ketika menemukan dugaan korupsi di instansi tempat saya bekerja.', '2026-04-19 10:10:00'),
(8, 'admin', 'Tim LNAKRI NGO', 'Terima kasih atas pertanyaan Anda. Tim konsultan hukum LNAKRI NGO sedang mempersiapkan jawaban. Mohon tunggu sebentar.', '2026-04-19 10:15:00');

INSERT INTO donation_submissions (
  id, donor_name, donor_email, amount, note, bank_name, bank_account_number,
  bank_account_name, proof_file_name, proof_file_url, status, verified_at, created_at
) VALUES
(1, 'Donatur A', 'donatur.a@example.com', 500000.00, 'Semoga LNAKRI terus maju.', 'BCA', '5790248335', 'Roddy Maruli Mazmur', 'bukti-donasi-a.pdf', '/uploads/donations/bukti-donasi-a.pdf', 'verified', '2026-04-18 12:00:00', '2026-04-18 11:50:00'),
(2, 'Donatur B', 'donatur.b@example.com', 1000000.00, NULL, 'BCA', '5790248335', 'Roddy Maruli Mazmur', 'bukti-donasi-b.jpg', '/uploads/donations/bukti-donasi-b.jpg', 'pending', NULL, '2026-04-19 09:20:00'),
(3, 'Donatur C', 'donatur.c@example.com', 250000.00, 'Terus berjuang.', 'BCA', '5790248335', 'Roddy Maruli Mazmur', 'bukti-donasi-c.pdf', '/uploads/donations/bukti-donasi-c.pdf', 'verified', '2026-04-17 08:30:00', '2026-04-17 08:10:00');

INSERT INTO site_visit_snapshots (granularity, period_label, period_date, visits) VALUES
('daily', 'Sen 13', '2026-04-13', 342),
('daily', 'Sel 14', '2026-04-14', 289),
('daily', 'Rab 15', '2026-04-15', 412),
('daily', 'Kam 16', '2026-04-16', 378),
('daily', 'Jum 17', '2026-04-17', 521),
('daily', 'Sab 18', '2026-04-18', 198),
('daily', 'Min 19', '2026-04-19', 267),
('monthly', 'Jan', '2026-01-01', 4821),
('monthly', 'Feb', '2026-02-01', 5234),
('monthly', 'Mar', '2026-03-01', 4987),
('monthly', 'Apr', '2026-04-01', 6341),
('monthly', 'Mei', '2026-05-01', 5876),
('yearly', '2020', '2020-01-01', 18420),
('yearly', '2021', '2021-01-01', 24560),
('yearly', '2022', '2022-01-01', 38900),
('yearly', '2023', '2023-01-01', 52340),
('yearly', '2024', '2024-01-01', 67890),
('yearly', '2025', '2025-01-01', 84210),
('yearly', '2026', '2026-01-01', 34560);

SET foreign_key_checks = 1;
