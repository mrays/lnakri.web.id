import { Resend } from 'resend';
import ComplaintCreatedEmail from '@/components/emails/ComplaintCreatedEmail';
import ComplaintStatusUpdatedEmail from '@/components/emails/ComplaintStatusUpdatedEmail';
import ReportEmail from '@/components/emails/ReportEmail';
import { getMysqlPool } from '@/lib/mysql';

const resend = new Resend(process.env.RESEND_API_KEY);

const fromAddress = 'LNAKRI NGO <noreply@lnakri.web.id>';

async function getOrganizationNotificationEmail(): Promise<string | null> {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query('SELECT email FROM organization_profiles WHERE id = 1 LIMIT 1');
    const row = (rows as any[])[0];
    const email = String(row?.email || '').trim();
    return email || null;
  } catch (error) {
    console.error('Failed to read organization notification email:', error);
    return null;
  }
}

export async function sendComplaintCreatedEmail(input: {
  to: string;
  reporterName: string;
  requestCode: string;
  subject: string;
  type: string;
  location?: string | null;
  attachmentCount?: number;
  createdAt?: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
    return;
  }

  await resend.emails.send({
    from: fromAddress,
    to: [input.to],
    subject: `[LNAKRI] Laporan Anda Diterima - ${input.requestCode}`,
    react: ComplaintCreatedEmail(input),
  });
}

export async function sendInternalNotificationEmail(input: {
  reportId: string;
  reportType: string;
  reporterName: string;
  subject: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
    return;
  }

  const to = await getOrganizationNotificationEmail();
  if (!to) {
    return;
  }

  await resend.emails.send({
    from: fromAddress,
    to: [to],
    subject: `[LNAKRI] Laporan Baru Masuk - ${input.reportId}`,
    react: ReportEmail({
      reportId: input.reportId,
      reportType: input.reportType,
      reporterName: input.reporterName,
      subject: input.subject,
    }),
  });
}

export async function sendComplaintStatusUpdatedEmail(input: {
  to: string;
  reporterName: string;
  requestCode: string;
  subject: string;
  currentStatus: string;
  previousStatus?: string | null;
  note?: string | null;
  updatedAt?: string;
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
    return;
  }

  await resend.emails.send({
    from: fromAddress,
    to: [input.to],
    subject: `[LNAKRI] Update Status Laporan - ${input.requestCode}`,
    react: ComplaintStatusUpdatedEmail(input),
  });
}