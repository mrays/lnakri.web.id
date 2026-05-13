import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

type FounderPayload = {
  name: string;
  jabatan: string;
  sk: string;
  desc: string;
  photo: string;
  photoAlt?: string;
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT id, full_name, position_title, decree_number, description, photo_url, photo_alt
       FROM founders
       WHERE is_active = 1
       ORDER BY sort_order ASC, id ASC`
    );

    const founders = (rows as any[]).map((row) => ({
      id: String(row.id),
      name: row.full_name,
      jabatan: row.position_title,
      sk: row.decree_number,
      desc: row.description,
      photo: row.photo_url,
      photoAlt: row.photo_alt || `Foto ${row.position_title} ${row.full_name} LNAKRI NGO`,
    }));

    return NextResponse.json({ founders });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data pendiri.', error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as FounderPayload;
    if (!payload.name || !payload.jabatan || !payload.sk) {
      return NextResponse.json({ message: 'Data wajib belum lengkap.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    const [[sortRow]] = await pool.query<any[]>(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM founders'
    );

    const [insertResult] = await pool.query<any>(
      `INSERT INTO founders (full_name, position_title, decree_number, description, photo_url, photo_alt, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        payload.name,
        payload.jabatan,
        payload.sk,
        payload.desc || '',
        payload.photo || '',
        payload.photoAlt || `Foto ${payload.jabatan} ${payload.name} LNAKRI NGO`,
        Number(sortRow.next_order || 1),
      ]
    );

    return NextResponse.json({
      founder: {
        id: String(insertResult.insertId),
        name: payload.name,
        jabatan: payload.jabatan,
        sk: payload.sk,
        desc: payload.desc || '',
        photo: payload.photo || '',
        photoAlt: payload.photoAlt || `Foto ${payload.jabatan} ${payload.name} LNAKRI NGO`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menambah data pendiri.', error: String(error) }, { status: 500 });
  }
}
