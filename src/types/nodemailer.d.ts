declare module "nodemailer" {
  import { Transport, TransportOptions } from "nodemailer/lib/mailer";
  import Mail from "nodemailer/lib/mailer";
  import SMTPTransport from "nodemailer/lib/smtp-transport";

  interface SMTPOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
    tls?: {
      rejectUnauthorized?: boolean;
    };
  }

  function createTransport(
    options: SMTPOptions
  ): Mail<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;

  export { createTransport, Transport, TransportOptions, Mail, SMTPTransport };
  export default { createTransport };
}
