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
}

export const ReportEmail = ({ reportId }: ReportEmailProps) => (
  <Html>
    <Head />
    <Preview>Laporan Baru Telah Dibuat</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Laporan Baru</Heading>
        <Text style={text}>
          Laporan baru telah dibuat dengan ID: <strong>{reportId}</strong>
        </Text>
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