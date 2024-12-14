const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  // Define mail options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || null, // If HTML is provided
  };
  
  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
