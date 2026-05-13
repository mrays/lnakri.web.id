import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pool = getMysqlPool();
    
    // Count complaints (all in table)
    const [complaintRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM case_requests`
    );
    
    // Count unread suggestions
    const [suggestionRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM suggestions WHERE is_read = 0 AND deleted_at IS NULL`
    );

    return NextResponse.json({
      complaints: complaintRows[0].count,
      suggestions: suggestionRows[0].count
    });
  } catch (error) {
    console.error('Failed to fetch sidebar counts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
