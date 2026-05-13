import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ReportEmailProps {
  reportId: string;
  reportType?: string;
  reporterName?: string;
  subject?: string;
}

const typeLabels: Record<string, string> = {
  keluhan: 'Keluhan Umum',
  mbg: 'Laporan MBG',
  bantuan_hukum: 'Bantuan Hukum',
  perlindungan: 'Perlindungan Hukum',
  konsultasi: 'Konsultasi',
};

export const ReportEmail = ({ reportId, reportType, reporterName, subject }: ReportEmailProps) => (
  <Html>
    <Head />
    <Preview>Laporan baru telah masuk</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Laporan baru telah masuk</Heading>
        <Text style={text}>
          Laporan baru telah diterima dengan ID: <strong>{reportId}</strong>
        </Text>
        {reportType ? <Text style={text}>Jenis: <strong>{typeLabels[reportType] || reportType}</strong></Text> : null}
        {reporterName ? <Text style={text}>Pelapor: <strong>{reporterName}</strong></Text> : null}
        {subject ? <Text style={text}>Subjek: <strong>{subject}</strong></Text> : null}
        <Text style={text}>
          Silakan periksa dasbor Anda untuk melihat detail laporan.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ReportEmail;

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "16px",
  margin: "24px 0",
};