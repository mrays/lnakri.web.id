import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

const monthMap: Record<string, string> = {
  januari: '01',
  februari: '02',
  maret: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  agustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  desember: '12',
};

function toIsoDate(input: string): string {
  if (!input) return '2017-01-17';
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const cleaned = input.trim().toLowerCase().replace(/\s+/g, ' ');
  const parts = cleaned.split(' ');
  if (parts.length === 3 && monthMap[parts[1]]) {
    const day = parts[0].padStart(2, '0');
    const month = monthMap[parts[1]];
    const year = parts[2];
    if (/^\d{4}$/.test(year)) return `${year}-${month}-${day}`;
  }
  return '2017-01-17';
}

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT full_name, short_name, description, vision, mission, slogan, founded_date, founded_city,
              ahu_number, address, phone, email, instagram_url, tiktok_url, facebook_url
       FROM organization_profiles
       WHERE id = 1
       LIMIT 1`
    );

    const row = (rows as any[])[0];
    if (!row) {
      return NextResponse.json({ message: 'Profil organisasi tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        name: row.full_name,
        shortName: row.short_name,
        description: row.description,
        vision: row.vision,
        mission: row.mission,
        greeting: row.slogan,
        foundedDate: String(row.founded_date).slice(0, 10),
        foundedCity: row.founded_city,
        ahuNumber: row.ahu_number,
        address: row.address,
        phone: row.phone,
        email: row.email,
        instagram: row.instagram_url,
        tiktok: row.tiktok_url,
        facebook: row.facebook_url,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memuat profil organisasi.', error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const pool = getMysqlPool();

    await pool.query(
      `UPDATE organization_profiles
       SET full_name = ?, short_name = ?, description = ?, vision = ?, mission = ?, slogan = ?,
           founded_date = ?, founded_city = ?, ahu_number = ?, address = ?, phone = ?, email = ?,
           instagram_url = ?, tiktok_url = ?, facebook_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        payload.name,
        payload.shortName,
        payload.description,
        payload.vision,
        payload.mission,
        payload.greeting,
        toIsoDate(payload.foundedDate),
        payload.foundedCity,
        payload.ahuNumber,
        payload.address,
        payload.phone,
        payload.email,
        payload.instagram,
        payload.tiktok,
        payload.facebook,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menyimpan profil organisasi.', error: String(error) }, { status: 500 });
  }
}
