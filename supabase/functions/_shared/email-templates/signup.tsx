/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Tangle</Heading>
        <Text style={text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . We just need to confirm your email before you can jump in.
        </Text>
        <Text style={text}>
          Confirm{' '}
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>{' '}
          by tapping the button below:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm email
        </Button>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
  margin: '0 0 24px',
}
const link = { color: '#0107ff', textDecoration: 'underline' }
const button = {
  backgroundColor: '#0107ff',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '10px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = { fontSize: '13px', color: '#9c9387', margin: '32px 0 0', lineHeight: '1.5' }
