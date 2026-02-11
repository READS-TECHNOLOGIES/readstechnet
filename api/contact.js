// api/contact.js
const nodemailer = require('nodemailer');

// Configure your email transporter using environment variables
// IMPORTANT: Use environment variables for sensitive info like passwords!
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // Use true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        // Extract form fields from the request body
        const { name, email, subject, message } = req.body;

        // Simple validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Setup email data
        const mailData = {
            from: process.env.SMTP_USER, // The sending email address
            to: 'readstechnologies@gmail.com', // The recipient email address for READS
            subject: `Contact Form Submission: ${subject}`,
            html: `
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        // Send the email
        await transporter.sendMail(mailData);

        // Redirect or send success response (similar to Formspree behavior)
        // Note: For simple HTML forms, a redirect is often best.
        res.writeHead(302, { Location: '/contact.html?success=true' });
        res.end();

    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
};