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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as FounderPayload;

    if (!payload.name || !payload.jabatan || !payload.sk) {
      return NextResponse.json({ message: 'Data wajib belum lengkap.' }, { status: 400 });
    }

    const pool = getMysqlPool();
    await pool.query(
      `UPDATE founders
       SET full_name = ?, position_title = ?, decree_number = ?, description = ?, photo_url = ?, photo_alt = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        payload.name,
        payload.jabatan,
        payload.sk,
        payload.desc || '',
        payload.photo || '',
        payload.photoAlt || `Foto ${payload.jabatan} ${payload.name} LNAKRI NGO`,
        Number(id),
      ]
    );

    return NextResponse.json({
      founder: {
        id,
        name: payload.name,
        jabatan: payload.jabatan,
        sk: payload.sk,
        desc: payload.desc || '',
        photo: payload.photo || '',
        photoAlt: payload.photoAlt || `Foto ${payload.jabatan} ${payload.name} LNAKRI NGO`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui data pendiri.', error: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const pool = getMysqlPool();
    await pool.query('DELETE FROM founders WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus data pendiri.', error: String(error) }, { status: 500 });
  }
}
