import { google } from "googleapis";

const user = process.env.MAILER_USER,
  clientId = process.env.GOOGLE_CLIENT_ID,
  clientSecret = process.env.GOOGLE_CLIENT_SECRET,
  refreshToken = process.env.GOOGLE_REFRESH_TOKEN,
  redirectUri = process.env.GOOGLE_REDIRECT_URI;

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

oauth2Client.setCredentials({ refresh_token: refreshToken });

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!to) {
      throw new Error("Recipient email is required");
    }

    const accessToken = await oauth2Client.getAccessToken();

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const messageParts = [
      `From: Expense Manager <${user}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      html || text,
    ];

    const message = messageParts.join("\n");

    const encodedMessage = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    return { info: res.data };
  } catch (error) {
    console.log("GMAIL API ERROR:", error);
    return { error };
  }
};

// import { createTransport } from "nodemailer";
// import { google } from "googleapis";

// const user = process.env.MAILER_USER,
//   clientId = process.env.GOOGLE_CLIENT_ID,
//   clientSecret = process.env.GOOGLE_CLIENT_SECRET,
//   refreshToken = process.env.GOOGLE_REFRESH_TOKEN,
//   redirectUri = process.env.GOOGLE_REDIRECT_URI,
//   service = process.env.MAILER_SERVICE;

// const OAuth2 = google.auth.OAuth2;
// const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

// oauth2Client.setCredentials({ refresh_token: refreshToken });

// export const sendEmail = async (payload) => {
//   try {
//     const accessToken = await oauth2Client.getAccessToken();

//     const transporter = createTransport({
//       service,
//       auth: { type: "OAuth2", user, clientId, clientSecret, refreshToken, accessToken: accessToken.token },
//     });

//     const info = await transporter.sendMail({ from: `Expense Manager`, ...payload });

//     return { info };
//   } catch (error) {
//     console.log("mailer error:", error);
//     return { error };
//   }
// };

// import { createTransport } from "nodemailer";

// export const sendEmail = (payload) => {
//   // const { to, subject, text, html, attachments } = payload;
//   const transporter = createTransport({
//     service: process.env.MAILER_SERVICE,
//     auth: {
//       user: process.env.MAILER_USER,
//       pass: process.env.MAILER_PASSWORD,
//     },
//   });

//   return new Promise((resolve) => {
//     transporter.sendMail(
//       {
//         from: `Expense Manager <${process.env.MAILER_USER}>`,
//         ...payload,
//       },
//       (error, info) => {
//         if (error) {
//           console.log("mailer error : ", error);
//           resolve({ error });
//         } else {
//           resolve({ info });
//         }
//       },
//     );
//   });
// };
