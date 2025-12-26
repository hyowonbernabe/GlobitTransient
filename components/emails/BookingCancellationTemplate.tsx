import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface BookingCancellationProps {
  guestName: string;
  unitName: string;
  bookingId: string;
  reason?: string;
}

export const BookingCancellationTemplate = ({
  guestName,
  unitName,
  bookingId,
  reason = "Payment was not received within the valid period.",
}: BookingCancellationProps) => (
  <Html>
    <Head />
    <Preview>Booking Cancellation - Globit Transient</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking Cancelled</Heading>
        <Text style={text}>
          Hi {guestName},
        </Text>
        <Text style={text}>
          We are writing to inform you that your reservation for <strong>{unitName}</strong> (ID: {bookingId}) has been cancelled.
        </Text>

        <Section style={box}>
          <Text style={paragraph}><strong>Reason:</strong></Text>
          <Text style={reasonText}>{reason}</Text>
        </Section>

        <Text style={text}>
          If you have already made a payment, please contact us immediately with your proof of payment so we can assist you.
        </Text>

        <Section style={btnContainer}>
          <Link
            style={button}
            href={`https://facebook.com/globit-transient`} 
          >
            Contact Admin
          </Link>
        </Section>

        <Text style={footer}>
          Globit Transient House<br />
          Baguio City
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
  border: '1px solid #e5e7eb',
};

const h1 = {
  color: '#ef4444', 
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const box = {
  padding: '24px',
  backgroundColor: '#fef2f2', 
  borderRadius: '8px',
  margin: '20px 40px',
  border: '1px solid #fecaca', 
};

const paragraph = {
  color: '#991b1b',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 4px',
};

const reasonText = {
  color: '#b91c1c',
  fontSize: '14px',
  margin: '0',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#4b5563', 
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
};