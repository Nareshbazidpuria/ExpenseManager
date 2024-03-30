// import { Expo } from "expo-server-sdk";

// export const sendNotification = async (payload) => {
//   const expo = new Expo({ accessToken: process.env.EXPO_TOKEN });
//   const chunks = expo.chunkPushNotifications([payload]);
//   const tickets = [];
//   for (const chunk of chunks) {
//     try {
//       const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//       tickets.push(...ticketChunk);
//     } catch (error) {
//       console.error(error);
//     }
//   }
//   let response = "";
//   for (const ticket of tickets) {
//     if (ticket.status === "error") {
//       console.log(ticket);
//       if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
//         response = "DeviceNotRegistered";
//       }
//     }
//     if (ticket.status === "ok") {
//       response = ticket.id;
//     }
//   }
//   return response;
// };
