import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("SMTP not configured – check SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactBody = await request.json();
    const { name, email, phone, message } = body;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER || "";
    const phoneLine = phone ? `\nPhone: ${phone}` : "";

    const smtpUser = process.env.SMTP_USER || "";
    const mailOptions = {
      from: `"${name} (via Website)" <${smtpUser}>`,
      replyTo: { name, address: email },
      to: toEmail,
      subject: `New Contact Inquiry from ${name}`,
      text: `You have a new message from the contact form:\n\nName: ${name}\nEmail: ${email}${phoneLine}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1f2937; margin-top: 0;">New Contact Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Name</td>
              <td style="padding: 8px 0; color: #1f2937;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email</td>
              <td style="padding: 8px 0; color: #1f2937;">${email}</td>
            </tr>
            ${phone ? `<tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Phone</td><td style="padding: 8px 0; color: #1f2937;">${phone}</td></tr>` : ""}
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <h3 style="color: #374151; margin-bottom: 8px;">Message</h3>
          <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
      `,
    };

    const transporter = createTransporter();
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form email error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to send message";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
