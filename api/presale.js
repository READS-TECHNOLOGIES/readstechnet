// api/presale.js
// Handles $READS presale waitlist form submissions.
// Sends a confirmation email to the user + notification email to the admin.
//
// Required environment variables (set in Vercel → Settings → Environment Variables):
//   SMTP_HOST      e.g. smtp.gmail.com
//   SMTP_PORT      e.g. 465 (SSL) or 587 (TLS)
//   SMTP_USER      e.g. readstechnologies@gmail.com
//   SMTP_PASS      App password (NOT your login password)
//   ADMIN_EMAIL    Where waitlist notifications are sent (e.g. readstechnologies@gmail.com)

const nodemailer = require('nodemailer');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Escape HTML special chars to prevent injection in email body */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Validate email format */
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ─── Transporter ────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: parseInt(process.env.SMTP_PORT, 10) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Handler ────────────────────────────────────────────────────────────────

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { name, email, phone = '', type = 'other' } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    if (!validEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const allowedTypes = ['student', 'parent', 'investor', 'school', 'other'];
    const safeType = allowedTypes.includes(type) ? type : 'other';

    const typeLabels = {
      student: 'Student (JAMB / WAEC / NECO)',
      parent: 'Parent / Guardian',
      investor: 'Crypto Investor',
      school: 'School / Institution',
      other: 'Other',
    };

    // ── Admin notification email ─────────────────────────────────────────────

    const adminMail = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || 'readstechnologies@gmail.com',
      subject: `New $READS Waitlist Signup — ${esc(name)}`,
      html: `
        <div style="font-family:DM Sans,sans-serif;max-width:560px;margin:0 auto;background:#0d2016;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1a3a28,#0d2016);padding:32px 32px 20px;border-bottom:2px solid #d4af37;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#d4af37;font-weight:700;">$READS Presale</p>
            <h1 style="margin:0;font-size:22px;color:#fff;">New Waitlist Signup</h1>
          </div>
          <div style="padding:28px 32px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="color:rgba(255,255,255,.5);padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);">Full Name</td>
                  <td style="font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);">${esc(name)}</td></tr>
              <tr><td style="color:rgba(255,255,255,.5);padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);">Email</td>
                  <td style="font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);"><a href="mailto:${esc(email)}" style="color:#d4af37;">${esc(email)}</a></td></tr>
              <tr><td style="color:rgba(255,255,255,.5);padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);">Phone</td>
                  <td style="font-weight:600;text-align:right;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.08);">${phone ? esc(phone) : '—'}</td></tr>
              <tr><td style="color:rgba(255,255,255,.5);padding:10px 0;">User Type</td>
                  <td style="font-weight:600;text-align:right;padding:10px 0;">${esc(typeLabels[safeType])}</td></tr>
            </table>
          </div>
          <div style="padding:0 32px 28px;font-size:12px;color:rgba(255,255,255,.3);">
            Submitted via readstechnet.vercel.app/presale.html · ${new Date().toUTCString()}
          </div>
        </div>
      `,
    };

    // ── User confirmation email ──────────────────────────────────────────────

    const userMail = {
      from: `READS Technologies <${process.env.SMTP_USER}>`,
      to: email,
      subject: `You're on the $READS Presale Waitlist 🚀`,
      html: `
        <div style="font-family:DM Sans,sans-serif;max-width:560px;margin:0 auto;background:#0d2016;color:#fff;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#1a3a28,#0d2016);padding:40px 32px 28px;text-align:center;border-bottom:2px solid #d4af37;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#d4af37;font-weight:700;">$READS Presale</p>
            <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#fff;line-height:1.2;">You're on the List,<br/>${esc(name.split(' ')[0])}! 🎉</h1>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,.6);line-height:1.7;">You've secured your spot on the $READS presale waitlist.<br/>We'll notify you the moment presale opens — before anyone else.</p>
          </div>

          <div style="padding:32px;background:rgba(255,255,255,.03);">
            <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#d4af37;">What Happens Next</p>
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${[
                ['1', 'Get Notified', 'We email you the moment presale opens with your personal allocation link.'],
                ['2', 'Connect Wallet', 'Connect a Cardano wallet (Nami, Eternl, or Flint) to participate.'],
                ['3', 'Purchase $READS', 'Buy at your tier price and receive your bonus tokens.'],
                ['4', 'Receive Tokens', '$READS tokens delivered to your wallet at Token Launch — Phase 4.'],
              ].map(([n, t, d]) => `
                <div style="display:flex;gap:14px;align-items:flex-start;">
                  <div style="min-width:32px;height:32px;border-radius:50%;background:#d4af37;color:#0d2016;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${n}</div>
                  <div>
                    <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:3px;">${t}</div>
                    <div style="font-size:13px;color:rgba(255,255,255,.5);line-height:1.6;">${d}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="padding:28px 32px;text-align:center;background:#0d2016;">
            <a href="https://readstechnet.vercel.app/presale.html" style="display:inline-block;background:#d4af37;color:#0d2016;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">View Presale Page</a>
            <p style="margin:20px 0 0;font-size:12px;color:rgba(255,255,255,.25);">READS Technologies · readstechnet.vercel.app<br/>You received this because you joined the $READS waitlist.</p>
          </div>
        </div>
      `,
    };

    // ── Send both emails ─────────────────────────────────────────────────────

    await Promise.all([
      transporter.sendMail(adminMail),
      transporter.sendMail(userMail),
    ]);

    // ── Respond ─────────────────────────────────────────────────────────────

    // For fetch/AJAX submissions → return JSON
    if (req.headers['content-type']?.includes('application/json')) {
      return res.status(200).json({ success: true });
    }

    // For plain HTML form submissions → redirect with success flag
    res.writeHead(302, { Location: '/presale.html?waitlist=success' });
    res.end();

  } catch (error) {
    console.error('Presale waitlist error:', error);
    res.status(500).json({ error: 'Failed to join waitlist. Please try again.' });
  }
};
