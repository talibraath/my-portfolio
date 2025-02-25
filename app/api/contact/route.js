import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Ensure environment variables exist
if (!process.env.EMAIL_ADDRESS || !process.env.GMAIL_PASSKEY) {
  throw new Error("Missing required environment variables: EMAIL_ADDRESS or GMAIL_PASSKEY.");
}

// Create and configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS, // Your Gmail
    pass: process.env.GMAIL_PASSKEY, // App password (generated from Google)
  },
});

// HTML email template
const generateEmailTemplate = (name, email, userMessage) => `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #007BFF;">New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px; margin-left: 0;">
        ${userMessage}
      </blockquote>
      <p style="font-size: 12px; color: #888;">Click reply to respond to the sender.</p>
    </div>
  </div>
`;

// Function to send an email
async function sendEmail(payload) {
  try {
    const { name, email, message: userMessage } = payload;

    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_ADDRESS}>`,
      to: "talib.raath@gmail.com",
      subject: `New Message From ${name}`,
      text: userMessage,
      html: generateEmailTemplate(name, email, userMessage),
      replyTo: email,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error while sending email:", error);
    return false;
  }
}

// API Route Handler
export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload.name || !payload.email || !payload.message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, email, or message." },
        { status: 400 }
      );
    }

    const emailSuccess = await sendEmail(payload);

    if (emailSuccess) {
      return NextResponse.json(
        { success: true, message: "Email sent successfully!" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to send email." },
      { status: 500 }
    );
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return NextResponse.json(
      { success: false, message: "Server error occurred." },
      { status: 500 }
    );
  }
}
