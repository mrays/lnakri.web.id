import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ComplaintStatusUpdatedEmailProps {
  reporterName: string;
  requestCode: string;
  subject: string;
  currentStatus: string;
  previousStatus?: string | null;
  note?: string | null;
  updatedAt?: string;
}

const statusLabels: Record<string, string> = {
  diterima: 'Diterima',
  diproses: 'Diproses',
  selesai: 'Selesai',
};

export const ComplaintStatusUpdatedEmail = ({
  reporterName,
  requestCode,
  subject,
  currentStatus,
  previousStatus,
  note,
  updatedAt,
}: ComplaintStatusUpdatedEmailProps) => {
  const currentLabel = statusLabels[currentStatus] || currentStatus;
  const previousLabel = previousStatus ? (statusLabels[previousStatus] || previousStatus) : null;

  return (
    <Html>
      <Head />
      <Preview>Status laporan Anda telah berubah menjadi {currentLabel}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>LNAKRI NGO</Text>
          <Heading style={heading}>Status laporan Anda diperbarui</Heading>

          <Text style={lead}>
            Halo <strong>{reporterName}</strong>, kami ingin memberi tahu bahwa status laporan Anda sudah berubah.
          </Text>

          <Section style={summaryCard}>
            <Text style={summaryRow}><strong>Nomor Tiket:</strong> {requestCode}</Text>
            <Text style={summaryRow}><strong>Subjek:</strong> {subject}</Text>
            <Text style={summaryRow}><strong>Status Baru:</strong> {currentLabel}</Text>
            {previousLabel ? <Text style={summaryRow}><strong>Status Sebelumnya:</strong> {previousLabel}</Text> : null}
            {note ? <Text style={summaryRow}><strong>Catatan:</strong> {note}</Text> : null}
            {updatedAt ? <Text style={summaryRow}><strong>Diperbarui:</strong> {updatedAt}</Text> : null}
          </Section>

          <Text style={bodyText}>
            Anda dapat memantau riwayat lengkap laporan ini melalui nomor tiket di atas.
          </Text>

          <Section style={ctaWrap}>
            <Button href="https://lnakri.web.id" style={ctaButton}>
              Buka Portal LNAKRI
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footerText}>
            Email otomatis dari LNAKRI NGO. Mohon jangan membalas langsung email ini.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ComplaintStatusUpdatedEmail;

const body = {
  backgroundColor: '#f4f7fb',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: '24px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf2',
  borderRadius: '16px',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '32px',
};

const brand = {
  backgroundColor: '#1a3a5c',
  borderRadius: '999px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  margin: '0 0 18px',
  padding: '8px 12px',
};

const heading = {
  color: '#10233a',
  fontSize: '28px',
  lineHeight: '1.2',
  margin: '0 0 16px',
};

const lead = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const summaryCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px',
};

const summaryRow = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

const bodyText = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '22px 0 0',
};

const ctaWrap = {
  margin: '24px 0 18px',
};

const ctaButton = {
  backgroundColor: '#1a3a5c',
  borderRadius: '10px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 700,
  padding: '12px 18px',
  textDecoration: 'none',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '14px 0',
};

const footerText = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
};