/// <reference types="npm:@types/react@18.3.1" />
import type { TemplateEntry } from './registry.ts'

// User-provided email HTML — used VERBATIM, do not restyle.
// `{{ .SiteURL }}` is substituted at send time with the configured site URL.
const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Welcome to Tangle</title>
</head>
<body style="margin:0;padding:0;background-color:#E7E0D2;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">You&rsquo;re in. Welcome to a network built on ideas.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E7E0D2;">
    <tr><td align="center" style="padding:30px 16px 50px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;width:100%;">

        <!-- hero -->
        <tr><td class="sec" style="background-color:#161514;border-radius:24px;padding:46px 34px 42px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;font-style:italic;letter-spacing:-.02em;"><span style="color:#F4D738">.t</span><span style="color:#FAF1E0">angle</span></span>
          <div style="height:26px;"></div>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.05;font-weight:500;letter-spacing:-.025em;color:#FAF1E0;">You&rsquo;re in.<br>Welcome to the network.</div>
          <div style="height:14px;"></div>
          <div style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;line-height:1.6;color:rgba(250,241,224,.66);">A home for designers who care more about the work than the noise. Here&rsquo;s what you just joined &mdash; take a scroll.</div>
        </td></tr>

        <!-- manifesto -->
        <tr><td class="sec" style="padding:40px 6px 8px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.15;font-weight:500;letter-spacing:-.02em;color:#161514;">Built on ideas.<br>Not on noise.</div>
          <div style="height:12px;"></div>
          <div style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;line-height:1.65;color:#6E665B;">No vanity metrics shouting over the work. Just real projects, real people, and the quiet confidence that good ideas find their way.</div>
        </td></tr>

        <!-- moments -->
        <tr><td>
          <table role="presentation" class="sec" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr><td style="background-color:#FFFFFF;border:1px solid #E4DAC7;border-radius:18px;padding:30px 28px;">
    <div style="font-family:Georgia,serif;font-size:13px;font-weight:bold;font-style:italic;color:#0107FF;letter-spacing:.04em;margin-bottom:10px;">01</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1.18;font-weight:500;letter-spacing:-.01em;color:#161514;margin-bottom:9px;">Make work, together.</div>
    <div style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:14.5px;line-height:1.6;color:#6E665B;">Find people who share your obsession and build something real, collaborations can be two of you or a whole team.</div>
  </td></tr></table>
          <table role="presentation" class="sec" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr><td style="background-color:#FFFFFF;border:1px solid #E4DAC7;border-radius:18px;padding:30px 28px;">
    <div style="font-family:Georgia,serif;font-size:13px;font-weight:bold;font-style:italic;color:#0107FF;letter-spacing:.04em;margin-bottom:10px;">02</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1.18;font-weight:500;letter-spacing:-.01em;color:#161514;margin-bottom:9px;">Get seen for the work.</div>
    <div style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:14.5px;line-height:1.6;color:#6E665B;">Strong work breaks out here. It doesn&rsquo;t matter how many followers you have, if it&rsquo;s good, it travels.</div>
  </td></tr></table>
          <table role="presentation" class="sec" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr><td style="background-color:#FFFFFF;border:1px solid #E4DAC7;border-radius:18px;padding:30px 28px;">
    <div style="font-family:Georgia,serif;font-size:13px;font-weight:bold;font-style:italic;color:#0107FF;letter-spacing:.04em;margin-bottom:10px;">03</div>
    <div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1.18;font-weight:500;letter-spacing:-.01em;color:#161514;margin-bottom:9px;">Find your people.</div>
    <div style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:14.5px;line-height:1.6;color:#6E665B;">Connect, swap feedback, and grow alongside a community that actually gets what you do.</div>
  </td></tr></table>
        </td></tr>

        <!-- values band -->
        <tr><td class="sec" style="padding-top:14px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#F4D738;border-radius:18px;padding:28px 28px;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:1.25;font-weight:500;letter-spacing:-.01em;color:#161514;">Credit each other. Keep it fair.<br>Let the work speak.</div>
          </td></tr></table>
        </td></tr>

        <!-- CTA -->
        <tr><td class="sec" align="center" style="padding:38px 6px 8px;">
          <div style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;line-height:1.6;color:#6E665B;margin-bottom:20px;">Your profile&rsquo;s waiting. Add your first piece and see where it goes.</div>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#0107FF;border-radius:13px;">
            <a href="{{ .SiteURL }}" target="_blank" style="display:inline-block;padding:16px 34px;font-family:'Trebuchet MS',Arial,sans-serif;font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;">Start exploring &rarr;</a>
          </td></tr></table>
        </td></tr>

        <!-- footer -->
        <tr><td style="padding:40px 8px 0;">
          <div style="border-top:1px solid #E4DAC7;padding-top:20px;">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;font-style:italic;letter-spacing:-.02em;"><span style="color:#0107FF">.t</span><span style="color:#161514">angle</span></span>
            <div style="height:10px;"></div>
            <div style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;line-height:1.65;color:#9C9387;">A network built on ideas, made with people who share your passion.</div>
            <div style="font-family:'Trebuchet MS',Arial,sans-serif;font-size:12px;line-height:1.65;color:#9C9387;margin-top:6px;">You&rsquo;re receiving this because you joined Tangle. <a href="{{ .SiteURL }}" style="color:#9C9387;">Manage email preferences</a>.</div>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

const PLAIN_TEXT = `You're in. Welcome to Tangle — a network built on ideas.

Built on ideas. Not on noise.
No vanity metrics shouting over the work. Just real projects, real people, and the quiet confidence that good ideas find their way.

01 · Make work, together.
Find people who share your obsession and build something real — collaborations can be two of you or a whole team.

02 · Get seen for the work.
Strong work breaks out here. It doesn't matter how many followers you have, if it's good, it travels.

03 · Find your people.
Connect, swap feedback, and grow alongside a community that actually gets what you do.

Credit each other. Keep it fair. Let the work speak.

Start exploring: {{ .SiteURL }}

You're receiving this because you joined Tangle.`

function renderWelcomeHtml(data: Record<string, any>): string {
  const siteUrl: string =
    (typeof data?.siteUrl === 'string' && data.siteUrl) ||
    Deno.env.get('SITE_URL') ||
    'https://gotangle.app'
  return WELCOME_HTML.split('{{ .SiteURL }}').join(siteUrl)
}

function renderWelcomeText(data: Record<string, any>): string {
  const siteUrl: string =
    (typeof data?.siteUrl === 'string' && data.siteUrl) ||
    Deno.env.get('SITE_URL') ||
    'https://gotangle.app'
  return PLAIN_TEXT.split('{{ .SiteURL }}').join(siteUrl)
}

export const template = {
  subject: 'Welcome to Tangle',
  displayName: 'Welcome to Tangle',
  rawHtml: renderWelcomeHtml,
  rawText: renderWelcomeText,
  previewData: { siteUrl: 'https://gotangle.app' },
} satisfies TemplateEntry
