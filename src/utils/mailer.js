import { createTransport } from "nodemailer";

export const sendEmail = (payload) => {
  // const { to, subject, text, html, attachments } = payload;
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
        from: `Expense Manager <${process.env.MAILER_USER}>`,
        ...payload,
      },
      (error, info) => {
        if (error) {
          console.log("mailer error : ", error);
          resolve({ error });
        } else {
          resolve({ info });
        }
      },
    );
  });
};
