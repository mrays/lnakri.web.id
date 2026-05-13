import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// PUT update suggestion (mark as read)
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const pool = await getMysqlPool();

    const sql = `
      UPDATE suggestions 
      SET is_read = ? 
      WHERE id = ?
    `;

    await pool.query(sql, [body.read ? 1 : 0, id]);

    return NextResponse.json({ success: true, message: 'Suggestion updated successfully' });
  } catch (error) {
    console.error('Failed to update suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE suggestion (soft delete)
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const pool = await getMysqlPool();

    const sql = `
      UPDATE suggestions 
      SET deleted_at = NOW() 
      WHERE id = ?
    `;

    await pool.query(sql, [id]);

    return NextResponse.json({ success: true, message: 'Suggestion deleted successfully' });
  } catch (error) {
    console.error('Failed to delete suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
