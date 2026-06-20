function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function emailShell(
  previewText: string,
  kicker: string,
  heading: string,
  body: string,
  block: string,
  note: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tangle</title>
</head>
<body style="margin:0; padding:0; background-color:#E7E0D2; -webkit-text-size-adjust:100%;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${htmlEscape(previewText)} &mdash; Tangle.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E7E0D2;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; width:100%;">
          <tr>
            <td align="left" style="padding:0 8px 28px 8px;">
              <span style="font-family:Georgia,'Times New Roman',serif; font-size:30px; font-weight:bold; font-style:italic; letter-spacing:-0.02em;"><span style="color:#0107FF;">.t</span><span style="color:#161514;">angle</span></span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#FFFFFF; border-radius:20px; border:1px solid #ECE4D4; padding:40px 36px;">
              <p style="margin:0 0 14px 0; font-family:'Trebuchet MS',Arial,sans-serif; font-size:12px; font-weight:bold; letter-spacing:0.12em; text-transform:uppercase; color:#9C9387;">${htmlEscape(kicker)}</p>
              <h1 style="margin:0 0 14px 0; font-family:Georgia,'Times New Roman',serif; font-size:28px; line-height:1.15; font-weight:500; letter-spacing:-0.02em; color:#161514;">${htmlEscape(heading)}</h1>
              <p style="margin:0 0 28px 0; font-family:'Trebuchet MS',Arial,sans-serif; font-size:15px; line-height:1.6; color:#6E665B;">${htmlEscape(body)}</p>
              ${block}
              <p style="margin:24px 0 0 0; font-family:'Trebuchet MS',Arial,sans-serif; font-size:13px; line-height:1.6; color:#9C9387;">${htmlEscape(note)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 8px 0 8px;">
              <p style="margin:0 0 6px 0; font-family:'Trebuchet MS',Arial,sans-serif; font-size:12px; line-height:1.6; color:#9C9387;">Tangle &mdash; a network built on ideas, made with people who share your passion.</p>
              <p style="margin:0; font-family:'Trebuchet MS',Arial,sans-serif; font-size:12px; line-height:1.6; color:#9C9387;">&copy; Tangle.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function codeBlock(token: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="background-color:#F1EADD; border-radius:14px; padding:24px 16px;">
      <div style="font-family:'Courier New',Courier,monospace; font-size:36px; font-weight:bold; letter-spacing:0.32em; color:#0107FF; padding-left:0.32em;">${htmlEscape(token)}</div>
    </td>
  </tr>
</table>`
}

function linkButton(url: string, cta: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="background-color:#0107FF; border-radius:12px;">
      <a href="${htmlEscape(url)}" target="_blank" style="display:inline-block; padding:15px 30px; font-family:'Trebuchet MS',Arial,sans-serif; font-size:15px; font-weight:bold; color:#FFFFFF; text-decoration:none;">${htmlEscape(cta)} &rarr;</a>
    </td>
  </tr>
</table>`
}

export interface TemplateData {
  token?: string
  confirmationUrl?: string
  email?: string
  oldEmail?: string
  newEmail?: string
}

export function renderSignup(data: TemplateData): { html: string; text: string } {
  const token = data.token || ''
  const html = emailShell(
    "Confirm your email",
    "Confirm your email",
    "Let's confirm it's you.",
    "Enter this code in the app to finish setting up your Tangle account. It keeps your work and your network secure.",
    codeBlock(token),
    "This code expires in 30 minutes. If you didn't request it, you can safely ignore this email — no account will be created."
  )
  const text = `Tangle

Your verification code: ${token}

Enter this code in the app to finish setting up your Tangle account. It keeps your work and your network secure.

This code expires in 30 minutes. If you didn't request it, you can safely ignore this email — no account will be created.

Tangle — a network built on ideas, made with people who share your passion.`
  return { html, text }
}

export function renderMagicLink(data: TemplateData): { html: string; text: string } {
  const url = data.confirmationUrl || ''
  const html = emailShell(
    "Sign in",
    "Sign in",
    "Your link to Tangle.",
    "Tap the button below to sign in — no password needed. This link works once and only for you.",
    linkButton(url, "Sign in to Tangle"),
    "This link expires in 1 hour. If you didn't try to sign in, you can ignore this email."
  )
  const text = `Tangle

Sign in to Tangle: ${url}

Tap the link below to sign in — no password needed. This link works once and only for you.

This link expires in 1 hour. If you didn't try to sign in, you can ignore this email.

Tangle — a network built on ideas, made with people who share your passion.`
  return { html, text }
}

export function renderRecovery(data: TemplateData): { html: string; text: string } {
  const token = data.token || ''
  const html = emailShell(
    "Reset password",
    "Reset password",
    "Set a new password.",
    "We got a request to reset your Tangle password. Enter this 6-digit code in the app to choose a new one.",
    codeBlock(token),
    "This code expires in 30 minutes. If you didn't request this, your password is still safe — just ignore this email."
  )
  const text = `Tangle

Your password reset code: ${token}

Enter this 6-digit code in the app to choose a new password.

This code expires in 30 minutes. If you didn't request this, your password is still safe — just ignore this email.

Tangle — a network built on ideas, made with people who share your passion.`
  return { html, text }
}

export function renderInvite(data: TemplateData): { html: string; text: string } {
  const url = data.confirmationUrl || ''
  const html = emailShell(
    "You're invited",
    "You're invited",
    "Join us on Tangle.",
    "You've been invited to Tangle — a network built on ideas, made with people who share your passion. Tap to accept and set up your account.",
    linkButton(url, "Accept invite"),
    "This invitation is tied to this email address. If it wasn't meant for you, you can ignore it."
  )
  const text = `Tangle

You've been invited to Tangle: ${url}

You've been invited to Tangle — a network built on ideas, made with people who share your passion. Tap to accept and set up your account.

This invitation is tied to this email address. If it wasn't meant for you, you can ignore it.

Tangle — a network built on ideas, made with people who share your passion.`
  return { html, text }
}

export function renderEmailChange(data: TemplateData): { html: string; text: string } {
  const token = data.token || ''
  const html = emailShell(
    "Confirm change",
    "Confirm change",
    "Confirm your new email.",
    "Enter this code to confirm the new email address on your Tangle account.",
    codeBlock(token),
    "This code expires in 30 minutes. If you didn't ask to change your email, please secure your account."
  )
  const text = `Tangle

Your verification code: ${token}

Enter this code to confirm the new email address on your Tangle account.

This code expires in 30 minutes. If you didn't ask to change your email, please secure your account.

Tangle — a network built on ideas, made with people who share your passion.`
  return { html, text }
}

export function renderReauthentication(data: TemplateData): { html: string; text: string } {
  const token = data.token || ''
  const html = emailShell(
    "Confirm it's you",
    "Confirm it's you",
    "Quick security check.",
    "Enter this code to confirm this action on your Tangle account.",
    codeBlock(token),
    "This code expires in 30 minutes. If this wasn't you, please secure your account."
  )
  const text = `Tangle

Your verification code: ${token}

Enter this code to confirm this action on your Tangle account.

This code expires in 30 minutes. If this wasn't you, please secure your account.

Tangle — a network built on ideas, made with people who share your passion.`
  return { html, text }
}
