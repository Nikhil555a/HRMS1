
// const express = require('express');
// const http = require('http'); // ✅ Socket ke liye
// const mongoose = require('mongoose');
// const cors = require('cors');    
// const path = require('path');
// require('dotenv').config();

// const app = express();
// const httpServer = http.createServer(app); // ✅ IMPORTANT

// // ── Middleware ──
// app.use(cors({ origin:process.env.CLIENT_URL , credentials: true }));
// // const allowedOrigins = [
// //   "https://hrms1-13.onrender.com", // deployed frontend
// //   "http://localhost:3000"           // local frontend
// // ];

// // app.use(cors({
// //   origin: function(origin, callback){
// //     // allow requests with no origin like mobile apps or curl
// //     if(!origin) return callback(null, true);
// //     if(allowedOrigins.indexOf(origin) === -1){
// //       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
// //       return callback(new Error(msg), false);
// //     }
// //     return callback(null, true);
// //   },
// //   credentials: true
// // }));

// app.use(express.json({ limit: '20mb' }));
// app.use(express.urlencoded({ extended: true, limit: '20mb' }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// // app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// // ── Employee Management Routes ──
// app.use('/api/auth',        require('./routes/auth'));
// app.use('/api/departments', require('./routes/departments'));
// app.use('/api/employees',   require('./routes/employees'));
// app.use('/api/attendance',  require('./routes/attendance'));
// app.use('/api/internships', require('./routes/internships'));


// // ── Hiring System Routes (✅ CORRECT STRUCTURE) ──
// app.use('/api/hiring/jobs',       require('./routes/hiring/jobs'));
// app.use('/api/hiring/candidates', require('./routes/hiring/candidates'));
// app.use('/api/hiring/interviews', require('./routes/hiring/interviews'));
// app.use('/api/hiring/documents',  require('./routes/hiring/documents'));
// app.use('/api/hiring/dashboard',  require('./routes/hiring/dashboard'));
// app.use('/api/admin',             require('./routes/hiring/admin'));





// // ── Notifications ──
// // app.use('/api/notifications', require('./routes/notifications'));
// app.use("/api/notifications", require("./routes/notification"))


// // ── Health Check ──
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', time: new Date() });
// });


// // ── Error Handler ──
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: err.message || 'Internal server error' });
// });


// // ── MongoDB + Socket + Cron ──
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log('✅ MongoDB Connected');

//     // 🔌 Socket init
//     // const { initSocket } = require('./socket/socketManager');
//     const {initSocket} =require("./socket/socketManager")
//     initSocket(httpServer);

//     // ⏰ Interview Reminder Cron
//     const {startInterviewReminderCron} = require("./jobs/interviewReminder")
//     // const { startInterviewReminderCron } = require('./jobs/interviewReminder');
//     startInterviewReminderCron();

//   })
//   .catch(err => console.error('❌ MongoDB Error:', err));


// // ── Server Start (IMPORTANT: httpServer) ──
// const PORT = process.env.PORT || 5000;

// httpServer.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`   Employee API : http://localhost:${PORT}/api`);
//   console.log(`   Hiring API   : http://localhost:${PORT}/api/hiring`);
//   console.log(`   Socket       : ws://localhost:${PORT}`);
// });




const express = require('express');
const http = require('http'); // ✅ Socket ke liye
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app); // ✅ IMPORTANT

// ── Middleware ──
app.use(cors({ origin: "https://hrms1-13.onrender.com" || '*', credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ── Employee Management Routes ──
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/employees',   require('./routes/employees'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/internships', require('./routes/internships'));


// ── Hiring System Routes (✅ CORRECT STRUCTURE) ──
app.use('/api/hiring/jobs',       require('./routes/hiring/jobs'));
app.use('/api/hiring/candidates', require('./routes/hiring/candidates'));
app.use('/api/hiring/interviews', require('./routes/hiring/interviews'));
app.use('/api/hiring/documents',  require('./routes/hiring/documents'));
app.use('/api/hiring/dashboard',  require('./routes/hiring/dashboard'));
app.use('/api/admin',             require('./routes/hiring/admin'));





// ── Notifications ──
// app.use('/api/notifications', require('./routes/notifications'));
app.use("/api/notifications", require("./routes/notification"))


// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});


// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});


// ── MongoDB + Socket + Cron ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    // 🔌 Socket init
    // const { initSocket } = require('./socket/socketManager');
    const {initSocket} =require("./socket/socketManager")
    initSocket(httpServer);

    // ⏰ Interview Reminder Cron
    const {startInterviewReminderCron} = require("./jobs/interviewReminder")
    // const { startInterviewReminderCron } = require('./jobs/interviewReminder');
    startInterviewReminderCron();

  })
  .catch(err => console.error('❌ MongoDB Error:', err));


// ── Server Start (IMPORTANT: httpServer) ──
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Employee API : http://localhost:${PORT}/api`);
  console.log(`   Hiring API   : http://localhost:${PORT}/api/hiring`);
  console.log(`   Socket       : ws://localhost:${PORT}`);
});

