import { EmailLog } from "../../Models/EmailLog.js";
import { sendEmail } from "../../Utils/mailer.js";
import eventBus from "../Event.js";

eventBus.on("ORDER_REJECTED", async (payload) => {
  console.log("Hit");
  const {
    orderId,
    customerName,
    vendorId,
    rejectionStage,
    rejectionReason,
    storeName,
    customerEmail,
    supportEmail,
  } = payload;
  const htmlContent = `<h2 style="color:${"#000"}">Order Rejected</h2>
    <p>Hi ${customerName},</p>
    <p>Your order ${orderId} was rejected at stage: <b>${rejectionStage}</b></p>
    <p>Reason: ${rejectionReason}</p>
    <footer>${storeName}</footer>
    `;
  const emailData = {
    fromName: storeName,
    to: customerEmail,
    subject: `Your order ${orderId} has been rejected`,
    html: htmlContent,
    replyTo: `${storeName}.support@gmail.com`,
  };
  const log = await EmailLog.create({
    orderId: orderId,
    vendorId: vendorId,
    to: emailData.to,
    fromEmail: `"${storeName}" <${supportEmail}>`,
    fromName: emailData.fromName,
    replyTo: emailData.replyTo,
    subject: emailData.subject,
  });
  try {
    await sendEmail(emailData);
    log.status = "SENT";
    log.sentAt = new Date();
  } catch (err) {
    log.status = "FAILED";
    log.error = err.message;
    log.retryCount += 1;
  }
  await log.save();
});
