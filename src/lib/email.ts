import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface EmailResult {
  sent: boolean
  devLink?: string
}

export async function sendInviteEmail(opts: {
  to: string
  name: string
  link: string
}): Promise<EmailResult> {
  const link = opts.link
  if (!resend || !process.env.EMAIL_FROM) {
    console.log(`[magicpie] INVITE for ${opts.to}: ${link}`)
    return { sent: false, devLink: link }
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: opts.to,
      subject: "You're invited to Magicpie",
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#18181b">
          <div style="font-size:22px;font-weight:900;font-style:italic">Magicpie</div>
          <p style="margin:24px 0 8px;font-size:15px">Hi${opts.name ? ` ${opts.name}` : ""},</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.5">
            You've been invited to join the band's settlement workspace. Accept the invite to set up your account.
          </p>
          <a href="${link}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:8px;font-size:14px">
            Accept invite
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#71717a">
            Or copy this link: <span style="word-break:break-all">${link}</span>
          </p>
        </div>
      `,
    })
    return { sent: true }
  } catch (e) {
    console.error("[magicpie] email send failed", e)
    console.log(`[magicpie] INVITE for ${opts.to}: ${link}`)
    return { sent: false, devLink: link }
  }
}