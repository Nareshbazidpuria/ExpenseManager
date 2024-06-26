import { createTransport } from "nodemailer";

export const sendEmail = (payload) => {
  const { to, subject, text, html, attachments } = payload;
  const transporter = createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASSWORD,
    },
  });

  return new Promise((resolve) => {
    transporter.sendMail(
      {
        from: `Support Expense Manager <${process.env.MAILER_USER}>`,
        to,
        text,
        html,
        subject,
        attachments,
      },
      (error, info) => (error ? resolve() : resolve(info))
    );
  });
};
