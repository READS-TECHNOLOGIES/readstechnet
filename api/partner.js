// api/partner.js
const nodemailer = require('nodemailer');

// Configure your email transporter using environment variables
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
        const { organizationName, contactPerson, email, partnershipType, message } = req.body;

        // Simple validation
        if (!organizationName || !contactPerson || !email || !partnershipType || !message) {
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

        // Map partnership type to readable format
        const partnershipTypeMap = {
            'school': 'School/University',
            'contentCreator': 'Content Creator',
            'examBoard': 'Exam Board',
            'other': 'Other'
        };
        const partnershipTypeLabel = partnershipTypeMap[partnershipType] || partnershipType;

        // Setup email data
        const mailData = {
            from: process.env.SMTP_USER,
            to: 'readstechnologies@gmail.com', // Partnership inquiries email
            subject: `Partnership Application: ${organizationName} - ${partnershipTypeLabel}`,
            html: `
                <h2>New Partnership Application</h2>
                <p><strong>Organization/Company:</strong> ${organizationName}</p>
                <p><strong>Contact Person:</strong> ${contactPerson}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Partnership Type:</strong> ${partnershipTypeLabel}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p style="color: #666; font-size: 12px;">This application was submitted from the $READS partnership form.</p>
            `,
            replyTo: email, // Allow easy reply to the applicant
        };

        // Send the email
        await transporter.sendMail(mailData);

        // Return JSON success response
        return res.status(200).json({ 
            success: true,
            message: 'Your partnership application has been submitted successfully! We will review it and get back to you soon.' 
        });

    } catch (error) {
        console.error('Partnership email sending failed:', error);
        
        // Return JSON error response
        return res.status(500).json({ 
            success: false,
            message: 'Failed to submit application. Please try again later.' 
        });
    }
};
