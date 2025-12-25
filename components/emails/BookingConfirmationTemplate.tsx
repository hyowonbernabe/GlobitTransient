import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface BookingConfirmationProps {
  guestName: string;
  unitName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: string;
  balance: string;
  bookingId: string;
}

export const BookingConfirmationTemplate = ({
  guestName,
  unitName,
  checkIn,
  checkOut,
  totalPrice,
  balance,
  bookingId,
}: BookingConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Your booking at Globit Transient is confirmed! 🌲</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking Confirmed</Heading>
        <Text style={text}>
          Hi {guestName},
        </Text>
        <Text style={text}>
          We are excited to host you! Your reservation for <strong>{unitName}</strong> has been verified and secured.
        </Text>

        <Section style={box}>
          <Text style={paragraph}><strong>Confirmation No:</strong> {bookingId}</Text>
          <Hr style={hr} />
          <Text style={paragraph}><strong>Check-in:</strong> {checkIn} (2:00 PM)</Text>
          <Text style={paragraph}><strong>Check-out:</strong> {checkOut} (12:00 PM)</Text>
          <Hr style={hr} />
          <Text style={paragraph}><strong>Total Bill:</strong> {totalPrice}</Text>
          <Text style={paragraph}><strong>Balance Due:</strong> {balance}</Text>
          <Text style={smallText}>Please settle the balance upon arrival (Cash or GCash).</Text>
        </Section>

        <Section style={btnContainer}>
          <Link
            style={button}
            href={`https://maps.google.com/?q=Globit+Transient+Baguio`}
          >
            Get Directions
          </Link>
        </Section>

        <Text style={footer}>
          Globit Transient House<br />
          Near Burnham Park, Baguio City<br />
          0917 123 4567
        </Text>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: '#f6f9f6',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#065f46', // Emerald 800
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
  backgroundColor: '#f0fdf4', // Emerald 50
  borderRadius: '8px',
  margin: '20px 40px',
  border: '1px solid #bbf7d0', // Emerald 200
};

const paragraph = {
  color: '#064e3b',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const hr = {
  borderColor: '#bbf7d0',
  margin: '12px 0',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#059669', // Emerald 600
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const smallText = {
  color: '#047857',
  fontSize: '12px',
  marginTop: '8px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginTop: '32px',
};