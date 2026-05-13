import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET all suggestions (not deleted)
export async function GET() {
  try {
    const pool = await getMysqlPool();
    const [rows]: any = await pool.query(
      `SELECT id, full_name, email, message, is_read, created_at 
       FROM suggestions 
       WHERE deleted_at IS NULL 
       ORDER BY created_at DESC`
    );

    const suggestions = rows.map((row: any) => ({
      id: row.id.toString(),
      name: row.full_name,
      email: row.email,
      message: row.message,
      read: row.is_read === 1,
      date: new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new suggestion (public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pool = await getMysqlPool();

    const sql = `
      INSERT INTO suggestions (full_name, email, message, source_page)
      VALUES (?, ?, ?, ?)
    `;

    const values = [
      body.name,
      body.email,
      body.message,
      body.source_page || 'homepage',
    ];

    await pool.query(sql, values);

    return NextResponse.json({ success: true, message: 'Suggestion sent successfully' });
  } catch (error) {
    console.error('Failed to create suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
