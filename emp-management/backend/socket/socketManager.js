
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const userSockets = new Map();

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // 🔐 AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("❌ JWT ERROR:", err.message);
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Connected | userId: ${userId} | socketId: ${socket.id}`);

    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    socket.join(`user_${userId}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Disconnected | userId: ${userId}`);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(userId);
      }
    });

    socket.on('ping_server', () => {
      socket.emit('pong_server', { time: new Date() });
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

// ✅ Kisi ek HR ko notification emit karo
const emitNotificationToUser = (userId, notification) => {
  if (!io) return;
  io.to(`user_${userId.toString()}`).emit('new_notification', notification);
};

// ✅ HR ka unread count update karo
const emitUnreadCount = async (userId) => {
  if (!io) return;
  try {
    const Notification = require('../models/Notification');
    const count = await Notification.countDocuments({ userId, isRead: false });
    io.to(`user_${userId.toString()}`).emit('unread_count', count);
  } catch (err) {
    console.error('emitUnreadCount error:', err.message);
  }
};

// ✅ Interview schedule hone par HR ko turant notify karo
const notifyInterviewScheduled = async (hrId, { candidateName, round, mode, scheduledAt, candidateId }) => {
  if (!io) return;
  try {
    const Notification = require('../models/Notification');

    const timeStr = scheduledAt
      ? new Date(scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '';

    const notif = await Notification.create({
      userId: hrId,
      type: 'interview_scheduled',
      title: '📅 Interview Scheduled',
      message: `${candidateName} — ${round || 'Interview'} (${mode || ''})${timeStr ? ' at ' + timeStr : ''}`,
      link: `/hiring/candidates/${candidateId}`,
      meta: {
        candidateId,
        candidateName,
        scheduledAt,
      },
    });

    emitNotificationToUser(hrId.toString(), notif);
    await emitUnreadCount(hrId.toString());

    console.log(`📅 Interview notif sent → HR: ${hrId} | Candidate: ${candidateName}`);
  } catch (err) {
    console.error('notifyInterviewScheduled error:', err.message);
  }
};

const getIO = () => io;

module.exports = {
  initSocket,
  emitNotificationToUser,
  emitUnreadCount,
  notifyInterviewScheduled,
  getIO,
};
