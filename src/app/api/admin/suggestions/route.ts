import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      `SELECT id, full_name, email, message, is_read, created_at
       FROM suggestions
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC`
    );

    const suggestions = (rows as any[]).map((row) => ({
      id: String(row.id),
      name: row.full_name,
      email: row.email,
      message: row.message,
      read: Boolean(row.is_read),
      date: new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: row.created_at,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memuat saran.', error: String(error) }, { status: 500 });
  }
}
