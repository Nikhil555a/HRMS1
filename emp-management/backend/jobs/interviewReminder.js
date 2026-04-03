
const cron        = require('node-cron');
const Candidate   = require('../models/hiring/Candidate');
const Notification = require('../models/Notification');
// const { sendInterviewReminderEmail }  = require('../utils/emailService');
const {sendInterviewReminderEmail} =require("../utils/emailServices")
const { emitNotificationToUser, emitUnreadCount } = require('../socket/socketManager');

// ── Dedup set: avoid sending same reminder twice in same session ──
const notifiedSet = new Set();

const startInterviewReminderCron = () => {
  console.log('⏰ Interview reminder cron started (every minute)');

  // ── Every minute: check for interviews in next 15 mins ────
  cron.schedule('* * * * *', async () => {
    try {
      const now         = new Date();
      const windowStart = new Date(now.getTime() + 14 * 60 * 1000); // 14 min ahead
      const windowEnd   = new Date(now.getTime() + 16 * 60 * 1000); // 16 min ahead

      // Find candidates with an interview in the window
      const candidates = await Candidate.find({
        'interviews.scheduledAt': { $gte: windowStart, $lte: windowEnd },
        'interviews.status': 'Scheduled',
      })
        .populate('assignedTo', 'name email _id')
        .select('name interviews assignedTo');

      for (const candidate of candidates) {
        for (const interview of candidate.interviews) {
          if (interview.status !== 'Scheduled' || !interview.scheduledAt) continue;

          const scheduledAt = new Date(interview.scheduledAt);
          if (scheduledAt < windowStart || scheduledAt > windowEnd) continue;

          // Build dedup key: unique per candidate + interview + reminder type
          const notifKey = `${candidate._id}_${interview._id}_15min`;
          if (notifiedSet.has(notifKey)) continue;
          notifiedSet.add(notifKey);

          // The HR who is assigned to this candidate gets the notification
          const hr = candidate.assignedTo;
          if (!hr) {
            console.warn(`⚠️ No HR assigned to candidate: ${candidate.name}`);
            continue;
          }

          const timeStr = scheduledAt.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true,
          });

          // 1️⃣ Save notification to DB for this HR only
          const notif = await Notification.create({
            userId: hr._id,                     // ← goes to assignedTo HR ONLY
            type:   'interview_reminder',
            title:  '⏰ Interview in 15 minutes!',
            message: `${candidate.name} — ${interview.round || 'Interview'} (${interview.mode || ''}) at ${timeStr}`,
            link:   `/hiring/candidates/${candidate._id}`,
            meta: {
              candidateId:   candidate._id,
              candidateName: candidate.name,
              interviewId:   interview._id.toString(),
              scheduledAt,
              round: interview.round,
              mode:  interview.mode,
            },
          });

          console.log(`🔔 Reminder saved → HR: ${hr.name} (${hr._id}) | Candidate: ${candidate.name}`);

          // 2️⃣ Push via Socket.IO — ONLY to that HR's private room
          emitNotificationToUser(hr._id.toString(), notif);
          await emitUnreadCount(hr._id.toString());

          console.log(`⚡ Socket emitted → user_${hr._id}`);

          // 3️⃣ Send email reminder to the HR
          if (hr.email) {
            try {
              await sendInterviewReminderEmail(hr.email, {
                hrName:        hr.name,
                candidateName: candidate.name,
                round:         interview.round,
                mode:          interview.mode,
                scheduledAt,
                meetingLink:   interview.meetingLink,
                minutesBefore: 15,
              });
              console.log(`📧 Email sent → ${hr.email}`);
            } catch (emailErr) {
              console.error(`📧 Email failed (${hr.email}):`, emailErr.message);
            }
          }
        }
      }
    } catch (err) {
      console.error('Cron error:', err.message);
    }
  });

  // ── Also remind 1 hour before ──────────────────────────────
  cron.schedule('* * * * *', async () => {
    try {
      const now         = new Date();
      const windowStart = new Date(now.getTime() + 59 * 60 * 1000);
      const windowEnd   = new Date(now.getTime() + 61 * 60 * 1000);

      const candidates = await Candidate.find({
        'interviews.scheduledAt': { $gte: windowStart, $lte: windowEnd },
        'interviews.status': 'Scheduled',
      })
        .populate('assignedTo', 'name email _id')
        .select('name interviews assignedTo');

      for (const candidate of candidates) {
        for (const interview of candidate.interviews) {
          if (interview.status !== 'Scheduled' || !interview.scheduledAt) continue;
          const scheduledAt = new Date(interview.scheduledAt);
          if (scheduledAt < windowStart || scheduledAt > windowEnd) continue;

          const notifKey = `${candidate._id}_${interview._id}_1hr`;
          if (notifiedSet.has(notifKey)) continue;
          notifiedSet.add(notifKey);

          const hr = candidate.assignedTo;
          if (!hr) continue;

          const timeStr = scheduledAt.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true,
          });

          const notif = await Notification.create({
            userId:  hr._id,
            type:    'interview_today',
            title:   '📅 Interview in 1 hour',
            message: `${candidate.name} — ${interview.round || 'Interview'} at ${timeStr}`,
            link:    `/hiring/candidates/${candidate._id}`,
            meta: { candidateId: candidate._id, candidateName: candidate.name, scheduledAt },
          });

          emitNotificationToUser(hr._id.toString(), notif);
          await emitUnreadCount(hr._id.toString());
          console.log(`⏰ 1hr reminder → HR: ${hr.name} | Candidate: ${candidate.name}`);
        }
      }
    } catch (err) {
      console.error('1hr cron error:', err.message);
    }
  });

  // ── Clear dedup cache hourly ───────────────────────────────
  cron.schedule('0 * * * *', () => {
    notifiedSet.clear();
    console.log('🧹 Notification dedup cache cleared');
  });
};

module.exports = { startInterviewReminderCron };
