/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  accountType?: string
  siteUrl?: string
}

const ACCOUNT_LINES: Record<string, string> = {
  designer: "You're in — a home where designers are matched, collaborate, get discovered and get hired.",
  studio: "Your studio is in — showcase your team's work, find talent and grow your practice.",
  client: "You're in — post briefs, discover makers and hire the right people for your project.",
  institution: "Your institution is in — give every student a place to learn, share and be seen.",
  faculty: "You're in — set up your classes, share briefs and guide your students.",
  student: "You're in — free with your school. Build your work, join classes and connect with the community.",
  collector: "You're in — discover, follow and save the work of designers around the world.",
}

const WelcomeEmail = ({ name, accountType, siteUrl = 'https://gotangle.app' }: Props) => {
  const line = ACCOUNT_LINES[(accountType || 'designer').toLowerCase()] || ACCOUNT_LINES.designer
  const greeting = name ? `Welcome to Tangle, ${name}.` : 'Welcome to Tangle.'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to Tangle — a community built on ideas.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoWrap}>
            <Text style={logo}>
              <span style={logoDot}>.t</span>
              <span style={logoRest}>angle</span>
            </Text>
          </Section>

          <Heading style={h1}>{greeting}</Heading>
          <Text style={lead}>{line}</Text>

          <Section style={card}>
            <Text style={cardTitle}>A few things we ask of everyone</Text>
            <Text style={cardItem}>· Share your own work and credit the people who helped make it.</Text>
            <Text style={cardItem}>· Be honest, be kind, keep your promises.</Text>
            <Text style={cardItem}>· Respect other makers' ideas and copyright.</Text>
          </Section>

          <Text style={text}>
            Tangle works because of the community. Start by adding your first piece of work,
            following a few makers, and saying hello.
          </Text>

          <Section style={{ textAlign: 'center', margin: '32px 0 8px' }}>
            <Link href={siteUrl} style={button}>Open Tangle</Link>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            You're getting this because you just created a Tangle account. If that wasn't you,
            please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to Tangle',
  displayName: 'Welcome',
  previewData: { name: 'Sam', accountType: 'designer' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: '"Helvetica Neue", Arial, sans-serif' }
const container = { padding: '32px 32px 40px', maxWidth: '560px' }
const logoWrap = { margin: '0 0 28px' }
const logo = { fontFamily: 'Georgia, serif', fontStyle: 'italic' as const, fontWeight: 'bold' as const, fontSize: '34px', letterSpacing: '-0.02em', margin: 0 }
const logoDot = { color: '#0107ff' }
const logoRest = { color: '#161514' }
const h1 = { fontSize: '28px', fontWeight: 'bold' as const, color: '#161514', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: '1.2' }
const lead = { fontSize: '16px', color: '#6e665b', lineHeight: '1.6', margin: '0 0 28px' }
const text = { fontSize: '15px', color: '#6e665b', lineHeight: '1.6', margin: '0 0 8px' }
const card = { backgroundColor: '#faf7f0', border: '1px solid #ece4d4', borderRadius: '14px', padding: '20px 22px', margin: '0 0 28px' }
const cardTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#161514', margin: '0 0 10px', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }
const cardItem = { fontSize: '14px', color: '#6e665b', lineHeight: '1.6', margin: '0 0 6px' }
const button = { backgroundColor: '#0107ff', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '10px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#ece4d4', margin: '32px 0 20px' }
const footer = { fontSize: '12px', color: '#9c9387', lineHeight: '1.5', margin: 0 }
