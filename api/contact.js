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
    // Set CORS headers to allow requests from your frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ 
            success: false, 
            message: 'Method Not Allowed' 
        });
    }

    try {
        // Extract form fields from the request body
        const { name, email, subject, message } = req.body;

        // Simple validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required.' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a valid email address.' 
            });
        }

        // Setup email data
        const mailData = {
            from: process.env.SMTP_USER, // The sending email address
            to: 'readstechnologies@gmail.com', // The recipient email address for READS
            subject: `Contact Form Submission: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">This message was sent from the $READS contact form.</p>
            `,
            replyTo: email, // Allow easy reply to the sender
        };

        // Send the email
        await transporter.sendMail(mailData);

        // Return JSON success response
        return res.status(200).json({ 
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.' 
        });

    } catch (error) {
        console.error('Email sending failed:', error);
        
        // Return JSON error response
        return res.status(500).json({ 
            success: false,
            message: 'Failed to send message. Please try again later.' 
        });
    }
};
