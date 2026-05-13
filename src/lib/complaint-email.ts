import { Resend } from 'resend';
import ComplaintCreatedEmail from '@/components/emails/ComplaintCreatedEmail';
import ComplaintStatusUpdatedEmail from '@/components/emails/ComplaintStatusUpdatedEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

const fromAddress = 'LNAKRI NGO <noreply@lnakri.web.id>';

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