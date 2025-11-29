// const admin = require("firebase-admin");
// const serviceAccount = require("./serviceAccountKey.json"); // path to your file
import admin from "firebase-admin";
import serviceAccount from "../../firebase.json";

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

/**
 * Sends a push notification to a device using FCM token
 * @param {string} token - FCM device token
 * @param {object} data - notification data { title, body, image?, [customData] }
 */
export const sendPushNtification = async (token, data = {}) => {
  const { title, body, imageUrl, customData = {}, android = {} } = data;
  if (imageUrl) customData.imageUrl = imageUrl;
  customData.title = title;
  customData.body = body;

  try {
    const response = await admin.messaging().send({
      token,
      // notification: { title, body, imageUrl },
      data: customData,
      android: { priority: "high", notification: { sound: "default" }, ...android },
      apns: { payload: { aps: { sound: "default" } } },
    });
    console.log("✅ Notification sent successfully:");
    return response;
  } catch (error) {
    console.error("❌ Error sending notification:", error);
  }
};
