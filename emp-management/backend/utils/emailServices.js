const nodemailer = require('nodemailer');

// Create transporter — Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password (not your Gmail password)
  },
});

/**
 * Send interview reminder email
 * @param {string} toEmail - HR ka email
 * @param {object} data - { hrName, candidateName, round, mode, scheduledAt, meetingLink, minutesBefore }
 */
const sendInterviewReminderEmail = async (toEmail, data) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured — skipping email for:', toEmail);
    return;
  }

  const timeStr = new Date(data.scheduledAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });
  const dateStr = new Date(data.scheduledAt).toLocaleDateString('en-IN', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6366f1, #0ea5e9); padding: 28px 24px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 8px;">📅</div>
        <h2 style="color: white; margin: 0; font-size: 20px;">Interview Reminder</h2>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">
          Starting in <strong>${data.minutesBefore} minutes</strong>
        </p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">
          Hi <strong>${data.hrName}</strong>, you have an upcoming interview:
        </p>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 16px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; width: 40%;">Candidate</td>
            <td style="padding: 12px 16px; color: #1e293b; font-size: 14px; font-weight: 600;">${data.candidateName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 16px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Round</td>
            <td style="padding: 12px 16px; color: #1e293b; font-size: 14px;">${data.round || 'Interview'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 16px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Mode</td>
            <td style="padding: 12px 16px; color: #1e293b; font-size: 14px;">${data.mode || 'Not specified'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 16px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Date</td>
            <td style="padding: 12px 16px; color: #1e293b; font-size: 14px;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase;">Time</td>
            <td style="padding: 12px 16px; color: #6366f1; font-size: 16px; font-weight: 800;">${timeStr}</td>
          </tr>
        </table>
        ${data.meetingLink ? `
        <div style="margin-top: 20px; text-align: center;">
          <a href="${data.meetingLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #0ea5e9); color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">
            🔗 Join Meeting
          </a>
        </div>` : ''}
        <p style="margin-top: 20px; color: #94a3b8; font-size: 12px; text-align: center;">
          This is an automated reminder from HRMS
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: toEmail,
    subject: `⏰ Interview in ${data.minutesBefore} min — ${data.candidateName} (${data.round || 'Interview'})`,
    html,
  });
};

module.exports = { sendInterviewReminderEmail };
