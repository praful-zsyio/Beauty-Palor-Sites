const { Resend } = require('resend');
const { logToExcel, EXCEL_FILE_PATH } = require('../utils/excelLogger');
const { syncToGoogleSheets } = require('../utils/googleSheets');
const fs = require('fs');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// @desc    Export data to Excel file for download
// @route   GET /api/contact/export
// @access  Private/Admin
exports.exportToExcel = async (req, res) => {
    try {
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            return res.status(404).json({ success: false, message: 'Excel file not generated yet. Submit a form first.' });
        }
        res.download(EXCEL_FILE_PATH, 'Kiran_Beauty_Database.xlsx');
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Send contact form email
// @route   POST /api/contact
// @access  Public
exports.sendContactEmail = async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }

    // ── Log to Excel & Google Sheets ──────────────────────────────────────
    await logToExcel('Enquiries', { name, email, phone, subject, message });
    await syncToGoogleSheets('Enquiries', { name, email, phone, subject, message });

    const ownerEmails = (process.env.EMAIL_TO || 'prafulsonwane58@gmail.com,kiranbeautysalon@gmail.com').split(',').map(e => e.trim());
    const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const subjectLine = subject || 'General Enquiry';
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // ── HTML email to salon owner ──────────────────────────────────────────
    const ownerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#f6f3f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(244,63,94,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f43f5e 0%,#fb7185 50%,#e11d48 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;">🌸</p>
              <h1 style="margin:8px 0 4px;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">Kiran Beauty Salon &amp; Academy</h1>
              <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;">New Contact Form Message</p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background:#fff1f2;border-left:4px solid #f43f5e;padding:14px 40px;">
              <p style="margin:0;color:#be123c;font-weight:600;font-size:13px;">📬 You have received a new message from your website contact form.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 20px;color:#1a1a2e;font-size:17px;font-weight:700;">Contact Details</h2>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3e8ef;">
                    <span style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Name</span><br/>
                    <span style="color:#1a1a2e;font-size:15px;font-weight:600;margin-top:4px;display:block;">${name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3e8ef;">
                    <span style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Email</span><br/>
                    <a href="mailto:${email}" style="color:#f43f5e;font-size:15px;font-weight:600;margin-top:4px;display:block;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3e8ef;">
                    <span style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Phone</span><br/>
                    <a href="tel:${phone}" style="color:#f43f5e;font-size:15px;font-weight:600;margin-top:4px;display:block;text-decoration:none;">${phone}</a>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3e8ef;">
                    <span style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Subject</span><br/>
                    <span style="color:#1a1a2e;font-size:15px;font-weight:600;margin-top:4px;display:block;">${subjectLine}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3e8ef;">
                    <span style="color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Received At</span><br/>
                    <span style="color:#1a1a2e;font-size:14px;margin-top:4px;display:block;">${now} (IST)</span>
                  </td>
                </tr>
              </table>

              <h2 style="margin:24px 0 12px;color:#1a1a2e;font-size:17px;font-weight:700;">Message</h2>
              <div style="background:#fdf2f4;border-radius:10px;padding:20px;border-left:4px solid #f43f5e;">
                <p style="margin:0;color:#374151;font-size:15px;line-height:1.8;white-space:pre-wrap;">${message}</p>
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subjectLine)}" style="display:inline-block;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;">
                      ✉️ Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a2e;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">© 2025 Kiran Beauty Salon &amp; Academy · Pithampur, MP 454775</p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:11px;">This email was sent automatically from your website contact form.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // ── Auto-reply HTML to visitor ─────────────────────────────────────────
    const visitorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You - Kiran Beauty Salon</title>
</head>
<body style="margin:0;padding:0;background:#f6f3f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(244,63,94,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f43f5e 0%,#fb7185 50%,#e11d48 100%);padding:40px;text-align:center;">
              <p style="margin:0;font-size:36px;">🌸</p>
              <h1 style="margin:10px 0 4px;color:#ffffff;font-size:24px;font-weight:700;">Thank You, ${name}!</h1>
              <p style="margin:0;color:rgba(255,255,255,0.9);font-size:15px;">We've received your message and will get back to you soon.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 20px;">
                Hi <strong>${name}</strong>,<br/><br/>
                Thank you for reaching out to <strong>Kiran Beauty Salon &amp; Academy</strong>. We have successfully received your message and one of our team members will get back to you within <strong>24 hours</strong>.
              </p>

              <!-- Summary Box -->
              <div style="background:#fdf2f4;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:4px solid #f43f5e;">
                <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Your Message Summary</p>
                <p style="margin:0 0 4px;color:#1a1a2e;font-size:14px;"><strong>Subject:</strong> ${subjectLine}</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
              </div>

              <!-- Contact Info -->
              <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 12px;color:#1a1a2e;font-size:14px;font-weight:700;">📍 Our Salon</p>
                <p style="margin:0 0 6px;color:#6b7280;font-size:13px;line-height:1.7;">Men Corner, Kaka Complex, New Kaka Complex<br/>Pithampur Industrial Area, Sagour Kuti<br/>Pithampur, Madhya Pradesh 454775</p>
                <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">📞 <a href="tel:+916265175996" style="color:#f43f5e;text-decoration:none;font-weight:600;">+91 6265175996</a></p>
              </div>

              <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0;">
                While you wait, feel free to browse our services or book an appointment directly on our website.<br/><br/>
                With love &amp; care,<br/>
                <strong style="color:#f43f5e;">Kiran Beauty Salon &amp; Academy Team 🌸</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1a2e;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px;">© 2025 Kiran Beauty Salon &amp; Academy · Pithampur, MP 454775</p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.35);font-size:11px;">This is an automated confirmation. Please do not reply directly to this email.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    if (!resend) {
        return res.status(200).json({ success: true, message: 'Your message has been received. We will get back to you within 24 hours! 🌸' });
    }
    try {
        const ownerResponse = await resend.emails.send({
            from: `Kiran Beauty Salon <${fromAddress}>`,
            to: ownerEmails,
            replyTo: email,
            subject: `📬 New Contact: ${subjectLine} — ${name}`,
            html: ownerHtml,
        });

        if (ownerResponse.error) {
            console.error('❌ Resend Owner Email Error:', ownerResponse.error);
            // Hint for common issues
            if (ownerResponse.error.name === 'validation_error') {
                console.error('💡 Hint: Resend Free tier only allows sending to your account email if domain is not verified.');
            }
        } else {
            console.log('✅ Salon Owner Email Sent Successfully:', ownerResponse.data.id);
        }

        // Send auto-reply to visitor (Might fail if using onboarding@resend.dev and visitor email is unverified, so we don't throw on this)
        const visitorResponse = await resend.emails.send({
            from: `Kiran Beauty Salon <${fromAddress}>`,
            to: [email],
            subject: `✅ We received your message — Kiran Beauty Salon`,
            html: visitorHtml,
        });

        if (visitorResponse.error) {
            console.warn('Resend Visitor Auto-Reply Error (Usually due to onboarding domain restrictions):', visitorResponse.error);
        }

        return res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully! We\'ll get back to you within 24 hours. 🌸',
        });
    } catch (err) {
        console.error('Server error sending email:', err);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while sending the email.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
};

// @desc    Send batch emails
// @route   POST /api/contact/batch
// @access  Private/Admin
exports.sendBatchEmails = async (req, res) => {
    try {
        const { emails } = req.body; // Array of email objects
        if (!resend) return res.status(503).json({ success: false, message: 'Email service not configured.' });
        const data = await resend.batch.send(emails);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Retrieve Email
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.retrieveEmail = async (req, res) => {
    try {
        if (!resend) return res.status(503).json({ success: false, message: 'Email service not configured.' });
        const data = await resend.emails.get(req.params.id);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update Email
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateEmail = async (req, res) => {
    try {
        const { scheduledAt } = req.body;
        if (!resend) return res.status(503).json({ success: false, message: 'Email service not configured.' });
        const data = await resend.emails.update({ id: req.params.id, scheduledAt });
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Cancel Email
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.cancelEmail = async (req, res) => {
    try {
        if (!resend) return res.status(503).json({ success: false, message: 'Email service not configured.' });
        const data = await resend.emails.cancel(req.params.id);
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    List Emails
// @route   GET /api/contact/list
// @access  Private/Admin
exports.listEmails = async (req, res) => {
    try {
        if (!resend) return res.status(503).json({ success: false, message: 'Email service not configured.' });
        const { data, error } = await resend.emails.list();
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    List Attachments
// @route   GET /api/contact/:emailId/attachments
// @access  Private/Admin
exports.listAttachments = async (req, res) => {
    try {
        if (!resend) return res.status(503).json({ success: false, message: 'Email service not configured.' });
        const { data, error } = await resend.emails.attachments.list({ emailId: req.params.emailId });
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Retrieve Attachment
// @route   GET /api/contact/:emailId/attachments/:id
// @access  Private/Admin
exports.retrieveAttachment = async (req, res) => {
    try {
        if (!resend) return res.status(503).json({ success: false, message: 'Email service not configured.' });
        const { data, error } = await resend.emails.attachments.get({ id: req.params.id, emailId: req.params.emailId });
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

