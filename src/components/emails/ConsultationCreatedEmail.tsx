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

interface ConsultationCreatedEmailProps {
  reporterName: string;
  requestCode: string;
  subject: string;
  createdAt?: string;
}

export const ConsultationCreatedEmail = ({
  reporterName,
  requestCode,
  subject,
  createdAt,
}: ConsultationCreatedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Konsultasi Anda telah kami terima - {requestCode}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={badgeWrap}>
            <Text style={badge}>LNAKRI NGO</Text>
          </Section>

          <Heading style={heading}>Konsultasi Anda telah diterima</Heading>

          <Text style={lead}>
            Halo <strong>{reporterName}</strong>, permintaan konsultasi Anda sudah berhasil kami simpan dan akan segera ditindaklanjuti oleh tim LNAKRI NGO.
          </Text>

          <Section style={summaryCard}>
            <Text style={summaryLabel}>Nomor Tiket</Text>
            <Text style={ticket}>{requestCode}</Text>

            <Hr style={divider} />

            <Text style={summaryRow}><strong>Topik:</strong> {subject}</Text>
            {createdAt ? <Text style={summaryRow}><strong>Waktu:</strong> {createdAt}</Text> : null}
          </Section>

          <Text style={bodyText}>
            Simpan nomor tiket ini untuk keperluan tindak lanjut. Jika tim kami membutuhkan informasi tambahan, kami akan menghubungi Anda melalui email yang terdaftar.
          </Text>

          <Section style={ctaWrap}>
            <Button href="https://lnakri.web.id" style={ctaButton}>
              Kunjungi lnakri.web.id
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

export default ConsultationCreatedEmail;

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

const badgeWrap = {
  marginBottom: '18px',
};

const badge = {
  backgroundColor: '#1a3a5c',
  borderRadius: '999px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
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

const summaryLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  margin: '0 0 6px',
  textTransform: 'uppercase' as const,
};

const ticket = {
  color: '#4f46e5',
  fontSize: '22px',
  fontWeight: 800,
  margin: '0 0 10px',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '14px 0',
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
  backgroundColor: '#4f46e5',
  borderRadius: '10px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: 700,
  padding: '12px 18px',
  textDecoration: 'none',
};

const footerText = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
};