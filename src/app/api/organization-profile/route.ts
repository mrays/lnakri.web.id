import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

const DEFAULT_PROFILE = {
  name: 'Lembaga Nasional Anti Korupsi RI',
  shortName: 'LNAKRI NGO',
  description: 'LNAKRI NGO adalah lembaga independen yang bergerak dalam bidang pemantauan anti korupsi dan investigasi korupsi di seluruh Indonesia.',
  vision: 'Terwujudnya Indonesia yang bebas dari korupsi melalui pemantauan, investigasi, dan penegakan hukum yang adil and transparan.',
  mission: 'Menerima dan menindaklanjuti laporan korupsi dari masyarakat; Melindungi saksi dan pelapor korupsi; Mengedukasi masyarakat tentang bahaya korupsi; Berkoordinasi dengan KPK, Kejaksaan, dan Kepolisian.',
  foundedDate: '2017-01-17', // Saved as YYYY-MM-DD
  foundedCity: 'Jakarta',
  ahuNumber: 'AHU-0001643.AH.01.07.TAHUN 2017',
  address: 'Jakarta, Indonesia',
  phone: '082295592545',
  email: 'dpplnakri@gmail.com',
  instagram: 'https://www.instagram.com/lnakri_ngo',
  tiktok: 'https://www.tiktok.com/@lnakri_ngo',
  facebook: 'https://www.facebook.com/lnakri.ngo',
  greeting: 'SIAP MEMBANTU DAN BERANTAS KORUPSI, JANGAN TAKUT BERSUARA!!',
  bankName: 'Bank BCA',
  bankAccountNumber: '5790248335',
  bankAccountName: 'Roddy Maruli Mazmur',
  complaintPageTagline: 'JANGAN TAKUT BERSUARA!!',
  complaintPageTitle: 'Keluhan & Pelaporan Masyarakat',
  complaintPageSubtitle: 'Laporkan dugaan korupsi, penyimpangan MBG, atau ajukan bantuan hukum. Semua laporan ditangani secara profesional dan rahasia.',
};

export async function GET() {
  try {
    const pool = await getMysqlPool();
    const [rows]: any = await pool.query('SELECT * FROM organization_profiles WHERE id = 1');

    if (rows.length === 0) {
      return NextResponse.json({ profile: DEFAULT_PROFILE });
    }

    const row = rows[0];
    
    // Format DATE to YYYY-MM-DD
    const foundedDate = row.founded_date ? new Date(row.founded_date).toISOString().split('T')[0] : '';

    const profile = {
      name: row.full_name,
      shortName: row.short_name,
      description: row.description,
      vision: row.vision,
      mission: row.mission,
      foundedDate: foundedDate,
      foundedCity: row.founded_city,
      ahuNumber: row.ahu_number,
      address: row.address,
      phone: row.phone,
      email: row.email,
      instagram: row.instagram_url,
      tiktok: row.tiktok_url,
      facebook: row.facebook_url,
      greeting: row.slogan,
      bankName: row.bank_name || DEFAULT_PROFILE.bankName,
      bankAccountNumber: row.bank_account_number || DEFAULT_PROFILE.bankAccountNumber,
      bankAccountName: row.bank_account_name || DEFAULT_PROFILE.bankAccountName,
      complaintPageTagline: row.complaint_page_tagline || DEFAULT_PROFILE.complaintPageTagline,
      complaintPageTitle: row.complaint_page_title || DEFAULT_PROFILE.complaintPageTitle,
      complaintPageSubtitle: row.complaint_page_subtitle || DEFAULT_PROFILE.complaintPageSubtitle,
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to fetch organization profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const pool = await getMysqlPool();

    const sql = `
      INSERT INTO organization_profiles (
        id, full_name, short_name, description, vision, mission, slogan, 
        founded_date, founded_city, ahu_number, address, phone, email, 
        instagram_url, tiktok_url, facebook_url,
        bank_name, bank_account_number, bank_account_name,
        complaint_page_tagline, complaint_page_title, complaint_page_subtitle
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        short_name = VALUES(short_name),
        description = VALUES(description),
        vision = VALUES(vision),
        mission = VALUES(mission),
        slogan = VALUES(slogan),
        founded_date = VALUES(founded_date),
        founded_city = VALUES(founded_city),
        ahu_number = VALUES(ahu_number),
        address = VALUES(address),
        phone = VALUES(phone),
        email = VALUES(email),
        instagram_url = VALUES(instagram_url),
        tiktok_url = VALUES(tiktok_url),
        facebook_url = VALUES(facebook_url),
        bank_name = VALUES(bank_name),
        bank_account_number = VALUES(bank_account_number),
        bank_account_name = VALUES(bank_account_name),
        complaint_page_tagline = VALUES(complaint_page_tagline),
        complaint_page_title = VALUES(complaint_page_title),
        complaint_page_subtitle = VALUES(complaint_page_subtitle)
    `;

    const values = [
      body.name,
      body.shortName,
      body.description,
      body.vision,
      body.mission,
      body.greeting,
      body.foundedDate, // Assumed to be YYYY-MM-DD
      body.foundedCity,
      body.ahuNumber,
      body.address,
      body.phone,
      body.email,
      body.instagram,
      body.tiktok,
      body.facebook,
      body.bankName,
      body.bankAccountNumber,
      body.bankAccountName,
      body.complaintPageTagline,
      body.complaintPageTitle,
      body.complaintPageSubtitle,
    ];

    await pool.query(sql, values);

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Failed to update organization profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
