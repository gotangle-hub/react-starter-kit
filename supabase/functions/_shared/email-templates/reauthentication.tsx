/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {siteName} verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Verify it's you</Heading>
        <Text style={text}>
          Enter the code below to confirm your identity:
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Arial, sans-serif' }
const container = { padding: '28px 32px', maxWidth: '520px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#161514',
  margin: '0 0 20px',
  letterSpacing: '-0.02em',
}
const text = {
  fontSize: '15px',
  color: '#6e665b',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeStyle = {
  fontFamily: '"IBM Plex Mono", "Courier New", Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#0107ff',
  margin: '0 0 32px',
  letterSpacing: '0.12em',
}
const footer = { fontSize: '13px', color: '#9c9387', margin: '32px 0 0', lineHeight: '1.5' }
