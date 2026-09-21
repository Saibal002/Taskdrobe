require("dotenv").config(); // <-- ADD THIS LINE AT THE VERY TOP
const nodemailer = require("nodemailer");

// Initialize the Nodemailer transporter with Brevo SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Generic email sender
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML body of the email
 */
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html: htmlContent
        });
        
        console.log(`✅ Email sent to ${to}: [${info.messageId}]`);
        return info;
    } catch (error) {
        console.error("❌ Email Sending Failed:", error);
        throw error;
    }
};

/**
 * Pre-configured Password Reset Email
 */
const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
    const subject = "TaskDrobe - Password Reset Request";
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #0f172a;">Password Reset</h2>
            <p>Hi ${userName},</p>
            <p>We received a request to reset your TaskDrobe password. Click the button below to choose a new one:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, html);
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail
};