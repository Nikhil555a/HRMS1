

// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../../utils/api';
// import { useAuth } from '../../context/AuthContext';

// const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
// const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// // ✅ IST-safe local date string helper
// // const getLocalDateString = (date = new Date()) => {
// //   const yyyy = date.getFullYear();
// //   const mm   = String(date.getMonth() + 1).padStart(2, '0');
// //   const dd   = String(date.getDate()).padStart(2, '0');
// //   return `${yyyy}-${mm}-${dd}`;
// // };
// const getLocalDateString = (date = new Date()) => {
//   // ✅ IST offset manually add karo (UTC + 5:30 = 330 minutes)
//   const istOffset = 5.5 * 60 * 60 * 1000;
//   const istDate   = new Date(date.getTime() + istOffset);
//   const yyyy = istDate.getUTCFullYear();
//   const mm   = String(istDate.getUTCMonth() + 1).padStart(2, '0');
//   const dd   = String(istDate.getUTCDate()).padStart(2, '0');
//   return `${yyyy}-${mm}-${dd}`;
// };

// export default function EmployeeAttendance() {
//   const { user } = useAuth();

//   // ✅ liveTime for clock (updates every second)
//   const [liveTime, setLiveTime] = useState(new Date());
//   useEffect(() => {
//     const t = setInterval(() => setLiveTime(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const [toast, setToast] = useState(null);
//   const [checkInLoading, setCheckInLoading]   = useState(false);
//   const [checkOutLoading, setCheckOutLoading] = useState(false);

//   const [ciName, setCiName]     = useState(user?.name || '');
//   const [ciTime, setCiTime]     = useState('');
//   const [ciTasks, setCiTasks]   = useState('');
//   const [ciErrors, setCiErrors] = useState({});

//   const [coName, setCoName]     = useState(user?.name || '');
//   const [coTime, setCoTime]     = useState('');
//   const [coTasks, setCoTasks]   = useState('');
//   const [coErrors, setCoErrors] = useState({});

//   const [records, setRecords]               = useState([]);
//   const [loadingRecords, setLoadingRecords] = useState(true);

//   const showToast = (msg, type = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   // ✅ Fixed: no stale `now` dependency, IST-safe date filter
//   // const fetchTodayRecords = useCallback(async () => {
//   //   setLoadingRecords(true);
//   //   try {
//   //     const today = new Date();
//   //     const month = today.getMonth() + 1;
//   //     const year  = today.getFullYear();
//   //     const res   = await api.get('/attendance/my', { params: { month, year } });
//   //     const data  = res.data || [];

//   //     const todayStr = getLocalDateString(today); // e.g. "2026-04-21"
//   //     setRecords(data.filter(r => r.date?.startsWith(todayStr)));
//   //   } catch (err) {
//   //     console.log(err);
//   //     setRecords([]);
//   //   } finally {
//   //     setLoadingRecords(false);
//   //   }
//   // }, []); // ✅ empty deps — no stale closure issue

// const fetchTodayRecords = useCallback(async () => {
//   setLoadingRecords(true);
//   try {
//     const today = new Date();
//     const month = today.getMonth() + 1;
//     const year  = today.getFullYear();

//     // console.log('📡 Fetching:', { month, year });

//     const res  = await api.get('/attendance/my', { params: { month, year } });

//     // console.log('✅ Full response:', res);
//     // console.log('✅ res.data:', res.data);

//     const data = res.data || [];
//     const todayStr = getLocalDateString(today);

//     // console.log('📅 todayStr:', todayStr);
//     // console.log('📋 All records from API:', data);
//     // console.log('🔍 Filtered:', data.filter(r => r.date?.startsWith(todayStr)));

//     // setRecords(data.filter(r => r.date?.startsWith(todayStr)));
//     setRecords(data.filter(r => {
//   if (!r.date) return false;
//   const recordDate = new Date(r.date);
//   const recordIST  = getLocalDateString(recordDate); // IST mein convert
//   return recordIST === todayStr;
// }));
//   } catch (err) {
//     // console.log('❌ Error caught:', err);
//     // console.log('❌ Error response:', err?.response?.data);
//     // console.log('❌ Error status:', err?.response?.status);
//     setRecords([]);
//   } finally {
//     setLoadingRecords(false);
//   }
// }, []);


//   // ✅ Set initial time inputs using local time (not UTC)
//   useEffect(() => {
//     fetchTodayRecords();
//     const now = new Date();
//     const h = String(now.getHours()).padStart(2, '0');
//     const m = String(now.getMinutes()).padStart(2, '0');
//     setCiTime(`${h}:${m}`);
//     setCoTime(`${h}:${m}`);
//   }, [fetchTodayRecords]);

//   const validateCheckIn = () => {
//     const errs = {};
//     if (!ciName.trim())  errs.name  = 'Name is required';
//     if (!ciTime)         errs.time  = 'Time is required';
//     if (!ciTasks.trim()) errs.tasks = "Today's tasks are required";
//     setCiErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const validateCheckOut = () => {
//     const errs = {};
//     if (!coName.trim())  errs.name  = 'Name is required';
//     if (!coTime)         errs.time  = 'Time is required';
//     if (!coTasks.trim()) errs.tasks = 'Updated tasks are required';
//     setCoErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleCheckIn = async () => {
//     if (!validateCheckIn()) return;
//     setCheckInLoading(true);
//     try {
//       const todayStr   = getLocalDateString(); // ✅ IST-safe
//       const checkInISO = new Date(`${todayStr}T${ciTime}:00`).toISOString();
//       await api.post('/attendance/checkin', {
//         employeeName: ciName.trim(),
//         checkIn: checkInISO,
//         todayTasks: ciTasks.trim(),
//       });
//       showToast(`Check-in marked for ${ciName} at ${ciTime}`);
//       setCiTasks(''); setCiErrors({});
//       fetchTodayRecords();
//     } catch (err) {
//       showToast(err.response?.data?.message || 'Check-in failed. Try again.', 'error');
//     } finally {
//       setCheckInLoading(false);
//     }
//   };

//   const handleCheckOut = async () => {
//     if (!validateCheckOut()) return;
//     setCheckOutLoading(true);
//     try {
//       const todayStr    = getLocalDateString(); // ✅ IST-safe
//       const checkOutISO = new Date(`${todayStr}T${coTime}:00`).toISOString();
//       await api.post('/attendance/checkout', {
//         employeeName: coName.trim(),
//         checkOut: checkOutISO,
//         updatedTasks: coTasks.trim(),
//       });
//       showToast(`Check-out marked for ${coName} at ${coTime}`);
//       setCoTasks(''); setCoErrors({});
//       fetchTodayRecords();
//     } catch (err) {
//       showToast(err.response?.data?.message || 'Check-out failed. Try again.', 'error');
//     } finally {
//       setCheckOutLoading(false);
//     }
//   };

//   const fmtTime = (iso) =>
//     iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

//   const calcHours = (r) => {
//     if (r?.checkIn && r?.checkOut) {
//       const diff = (new Date(r.checkOut) - new Date(r.checkIn)) / 3600000;
//       return `${diff.toFixed(1)}h`;
//     }
//     return null;
//   };

//   // ✅ All display values from liveTime (always fresh)
//   const liveHH = String(liveTime.getHours()).padStart(2, '0');
//   const liveMM = String(liveTime.getMinutes()).padStart(2, '0');
//   const liveSS = String(liveTime.getSeconds()).padStart(2, '0');

//   /* ── shared mini styles ── */
//   const inputStyle = (hasErr) => ({
//     width: '100%',
//     padding: '10px 13px',
//     border: `1px solid ${hasErr ? 'var(--danger)' : 'var(--border)'}`,
//     borderRadius: '8px',
//     fontSize: '14px',
//     background: 'var(--bg)',
//     color: 'var(--text)',
//     outline: 'none',
//     boxSizing: 'border-box',
//     fontFamily: 'inherit',
//   });

//   const labelStyle = {
//     fontSize: '12px',
//     fontWeight: 600,
//     color: 'var(--text-muted)',
//     marginBottom: '6px',
//     display: 'block',
//     textTransform: 'uppercase',
//     letterSpacing: '0.05em',
//   };

//   const errStyle = { fontSize: '12px', color: 'var(--danger)', marginTop: '4px' };

//   return (
//     <div>

//       {/* ── Toast ── */}
//       {toast && (
//         <div style={{
//           position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
//           background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
//           color: '#fff', padding: '13px 20px', borderRadius: '10px',
//           fontSize: '14px', fontWeight: 500, maxWidth: '340px',
//           boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
//           display: 'flex', alignItems: 'center', gap: '8px',
//         }}>
//           <span>{toast.type === 'error' ? '❌' : '✅'}</span>
//           {toast.msg}
//         </div>
//       )}

//       {/* ── Page Header ── */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//         <div>
//           <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Attendance</h1>
//           <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
//             Mark your daily check-in and check-out
//           </p>
//         </div>
//       </div>

//       {/* ── Info Bar ── */}
//       <div className="card" style={{
//         borderLeft: '3px solid var(--primary)',
//         display: 'grid',
//         gridTemplateColumns: 'repeat(4, 1fr)',
//         gap: '0',
//         marginBottom: '24px',
//         padding: '20px 24px',
//       }}>
//         {/* Day — ✅ liveTime se */}
//         <div style={{ borderRight: '1px solid var(--border)', paddingRight: '20px' }}>
//           <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Day</div>
//           <div style={{ fontSize: '20px', fontWeight: 800 }}>{DAYS_FULL[liveTime.getDay()]}</div>
//         </div>
//         {/* Date — ✅ liveTime se */}
//         <div style={{ borderRight: '1px solid var(--border)', paddingLeft: '20px', paddingRight: '20px' }}>
//           <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Date</div>
//           <div style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1 }}>{String(liveTime.getDate()).padStart(2, '0')}</div>
//         </div>
//         {/* Month / Year — ✅ liveTime se */}
//         <div style={{ borderRight: '1px solid var(--border)', paddingLeft: '20px', paddingRight: '20px' }}>
//           <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Month / Year</div>
//           <div style={{ fontSize: '20px', fontWeight: 800 }}>{MONTHS[liveTime.getMonth()]}</div>
//           <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{liveTime.getFullYear()}</div>
//         </div>
//         {/* Live Clock */}
//         <div style={{ paddingLeft: '20px' }}>
//           <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Current Time</div>
//           <div style={{ fontSize: '30px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
//             {liveHH}:{liveMM}
//             <span style={{ fontSize: '18px', color: 'var(--accent)', marginLeft: '3px' }}>:{liveSS}</span>
//           </div>
//           <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
//             {liveTime.toLocaleDateString('en-IN')} IST
//           </div>
//         </div>
//       </div>

//       {/* ── Check In + Check Out Forms ── */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

//         {/* CHECK IN */}
//         <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
//             <div style={{
//               width: '40px', height: '40px', borderRadius: '10px',
//               background: 'rgba(16,185,129,0.15)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: '20px', flexShrink: 0,
//             }}>✅</div>
//             <div>
//               <div style={{ fontWeight: 700, fontSize: '16px' }}>Check In</div>
//               <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mark your arrival time</div>
//             </div>
//           </div>

//           <div style={{ marginBottom: '14px' }}>
//             <label style={labelStyle}>Employee Name <span style={{ color: 'var(--danger)' }}>*</span></label>
//             <input
//               type="text"
//               placeholder="Enter your full name"
//               value={ciName}
//               onChange={e => { setCiName(e.target.value); setCiErrors(p => ({ ...p, name: '' })); }}
//               style={inputStyle(ciErrors.name)}
//             />
//             {ciErrors.name && <div style={errStyle}>{ciErrors.name}</div>}
//           </div>

//           <div style={{ marginBottom: '14px' }}>
//             <label style={labelStyle}>Check-In Time <span style={{ color: 'var(--danger)' }}>*</span></label>
//             <input
//               type="time"
//               value={ciTime}
//               onChange={e => { setCiTime(e.target.value); setCiErrors(p => ({ ...p, time: '' })); }}
//               style={inputStyle(ciErrors.time)}
//             />
//             {ciErrors.time && <div style={errStyle}>{ciErrors.time}</div>}
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             <label style={labelStyle}>Today's Tasks <span style={{ color: 'var(--danger)' }}>*</span></label>
//             <textarea
//               placeholder={'What will you work on today?\ne.g. Fix login bug, Review PR #42...'}
//               value={ciTasks}
//               onChange={e => { setCiTasks(e.target.value); setCiErrors(p => ({ ...p, tasks: '' })); }}
//               rows={5}
//               style={{ ...inputStyle(ciErrors.tasks), resize: 'vertical', lineHeight: 1.6 }}
//             />
//             {ciErrors.tasks && <div style={errStyle}>{ciErrors.tasks}</div>}
//           </div>

//           <button
//             onClick={handleCheckIn}
//             disabled={checkInLoading}
//             className="btn btn-primary"
//             style={{
//               width: '100%', padding: '12px',
//               background: 'var(--success)',
//               fontSize: '15px', fontWeight: 700,
//               opacity: checkInLoading ? 0.7 : 1,
//               cursor: checkInLoading ? 'not-allowed' : 'pointer',
//             }}
//           >
//             {checkInLoading ? 'Saving...' : '✅ Mark Check-In'}
//           </button>
//         </div>

//         {/* CHECK OUT */}
//         <div className="card" style={{ borderLeft: '3px solid var(--danger)' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
//             <div style={{
//               width: '40px', height: '40px', borderRadius: '10px',
//               background: 'rgba(239,68,68,0.15)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               fontSize: '20px', flexShrink: 0,
//             }}>🏁</div>
//             <div>
//               <div style={{ fontWeight: 700, fontSize: '16px' }}>Check Out</div>
//               <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mark your departure time</div>
//             </div>
//           </div>

//           <div style={{ marginBottom: '14px' }}>
//             <label style={labelStyle}>Employee Name <span style={{ color: 'var(--danger)' }}>*</span></label>
//             <input
//               type="text"
//               placeholder="Enter your full name"
//               value={coName}
//               onChange={e => { setCoName(e.target.value); setCoErrors(p => ({ ...p, name: '' })); }}
//               style={inputStyle(coErrors.name)}
//             />
//             {coErrors.name && <div style={errStyle}>{coErrors.name}</div>}
//           </div>

//           <div style={{ marginBottom: '14px' }}>
//             <label style={labelStyle}>Check-Out Time <span style={{ color: 'var(--danger)' }}>*</span></label>
//             <input
//               type="time"
//               value={coTime}
//               onChange={e => { setCoTime(e.target.value); setCoErrors(p => ({ ...p, time: '' })); }}
//               style={inputStyle(coErrors.time)}
//             />
//             {coErrors.time && <div style={errStyle}>{coErrors.time}</div>}
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             <label style={labelStyle}>Updated Tasks / Work Done <span style={{ color: 'var(--danger)' }}>*</span></label>
//             <textarea
//               placeholder={'What did you complete today?\ne.g. Fixed login bug ✓, Reviewed PR #42 ✓...'}
//               value={coTasks}
//               onChange={e => { setCoTasks(e.target.value); setCoErrors(p => ({ ...p, tasks: '' })); }}
//               rows={5}
//               style={{ ...inputStyle(coErrors.tasks), resize: 'vertical', lineHeight: 1.6 }}
//             />
//             {coErrors.tasks && <div style={errStyle}>{coErrors.tasks}</div>}
//           </div>

//           <button
//             onClick={handleCheckOut}
//             disabled={checkOutLoading}
//             className="btn btn-danger"
//             style={{
//               width: '100%', padding: '12px',
//               fontSize: '15px', fontWeight: 700,
//               opacity: checkOutLoading ? 0.7 : 1,
//               cursor: checkOutLoading ? 'not-allowed' : 'pointer',
//             }}
//           >
//             {checkOutLoading ? 'Saving...' : '🏁 Mark Check-Out'}
//           </button>
//         </div>
//       </div>

//       {/* ── Today's Records ── */}
//       <div className="card">
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
//           <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>📋 Today's Attendance Records</h3>
//           <span style={{
//             fontSize: '11px', fontWeight: 700, padding: '3px 10px',
//             borderRadius: '20px',
//             background: 'rgba(99,102,241,0.15)',
//             color: 'var(--primary)',
//           }}>
//             {records.length} {records.length === 1 ? 'entry' : 'entries'}
//           </span>
//         </div>

//         {loadingRecords ? (
//           <div className="loading"><div className="spinner" /></div>
//         ) : records.length === 0 ? (
//           <div className="empty-state">
//             <p>No records yet for today</p>
//             <span>Mark your check-in above to get started.</span>
//           </div>
//         ) : (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
//             {records.map((r, i) => {
//               const hours    = calcHours(r);
//               const initials = (r.employeeName || r.name || 'E')
//                 .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

//               return (
//                 <div key={i} style={{
//                   background: 'var(--bg)',
//                   border: '1px solid var(--border)',
//                   borderRadius: '12px',
//                   padding: '18px 20px',
//                 }}>
//                   {/* Top row */}
//                   <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>

//                     {/* Avatar + Name + Badge */}
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                       <div style={{
//                         width: '42px', height: '42px', borderRadius: '50%',
//                         background: 'var(--primary)', color: '#fff',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         fontWeight: 800, fontSize: '14px', flexShrink: 0,
//                       }}>{initials}</div>
//                       <div>
//                         <div style={{ fontWeight: 700, fontSize: '15px' }}>{r.employeeName || r.name || 'Employee'}</div>
//                         <span style={{
//                           fontSize: '11px', fontWeight: 700,
//                           padding: '3px 10px', borderRadius: '20px',
//                           background: r.checkOut ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
//                           color: r.checkOut ? 'var(--success)' : 'var(--warning)',
//                         }}>
//                           {r.checkOut ? 'Present' : 'Checked In'}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Times */}
//                     <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
//                       <div style={{ textAlign: 'center' }}>
//                         <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Check In</div>
//                         <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)' }}>{fmtTime(r.checkIn)}</div>
//                       </div>
//                       <div style={{ fontSize: '16px', color: 'var(--text-muted)' }}>→</div>
//                       <div style={{ textAlign: 'center' }}>
//                         <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Check Out</div>
//                         <div style={{ fontSize: '18px', fontWeight: 800, color: r.checkOut ? 'var(--danger)' : 'var(--text-muted)' }}>
//                           {fmtTime(r.checkOut)}
//                         </div>
//                       </div>
//                       {hours && (
//                         <>
//                           <div style={{ fontSize: '16px', color: 'var(--text-muted)' }}>·</div>
//                           <div style={{ textAlign: 'center' }}>
//                             <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Hours</div>
//                             <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>{hours}</div>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   {/* Tasks */}
//                   {(r.todayTasks || r.updatedTasks) && (
//                     <div style={{
//                       marginTop: '14px', paddingTop: '14px',
//                       borderTop: '1px solid var(--border)',
//                       display: 'grid',
//                       gridTemplateColumns: r.todayTasks && r.updatedTasks ? '1fr 1fr' : '1fr',
//                       gap: '16px',
//                     }}>
//                       {r.todayTasks && (
//                         <div>
//                           <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
//                             📝 Today's Tasks
//                           </div>
//                           <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
//                             {r.todayTasks}
//                           </div>
//                         </div>
//                       )}
//                       {r.updatedTasks && (
//                         <div>
//                           <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
//                             ✅ Work Done
//                           </div>
//                           <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
//                             {r.updatedTasks}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }













import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// ✅ IST-safe local date string helper
const getLocalDateString = (date = new Date()) => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate   = new Date(date.getTime() + istOffset);
  const yyyy = istDate.getUTCFullYear();
  const mm   = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(istDate.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function EmployeeAttendance() {
  const { user } = useAuth();

  // ✅ liveTime for clock (updates every second)
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ✅ currentTime derived from liveTime — always fresh, never editable
  const liveHH = String(liveTime.getHours()).padStart(2, '0');
  const liveMM = String(liveTime.getMinutes()).padStart(2, '0');
  const liveSS = String(liveTime.getSeconds()).padStart(2, '0');
  const currentTime = `${liveHH}:${liveMM}`; // used for check-in/out submission

  const [toast, setToast] = useState(null);
  const [checkInLoading, setCheckInLoading]   = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  const [ciName, setCiName]     = useState(user?.name || '');
  const [ciTasks, setCiTasks]   = useState('');
  const [ciErrors, setCiErrors] = useState({});

  const [coName, setCoName]     = useState(user?.name || '');
  const [coTasks, setCoTasks]   = useState('');
  const [coErrors, setCoErrors] = useState({});

  // ✅ ciTime and coTime states REMOVED — time is auto-captured at submit time

  const [records, setRecords]               = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTodayRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year  = today.getFullYear();

      const res  = await api.get('/attendance/my', { params: { month, year } });
      const data = res.data || [];
      const todayStr = getLocalDateString(today);

      setRecords(data.filter(r => {
        if (!r.date) return false;
        const recordDate = new Date(r.date);
        const recordIST  = getLocalDateString(recordDate);
        return recordIST === todayStr;
      }));
    } catch (err) {
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayRecords();
    // ✅ No setCiTime / setCoTime here anymore — time is derived from liveTime
  }, [fetchTodayRecords]);

  const validateCheckIn = () => {
    const errs = {};
    if (!ciName.trim())  errs.name  = 'Name is required';
    if (!ciTasks.trim()) errs.tasks = "Today's tasks are required";
    setCiErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateCheckOut = () => {
    const errs = {};
    if (!coName.trim())  errs.name  = 'Name is required';
    if (!coTasks.trim()) errs.tasks = 'Updated tasks are required';
    setCoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckIn = async () => {
    if (!validateCheckIn()) return;
    setCheckInLoading(true);
    try {
      const todayStr = getLocalDateString(); // ✅ IST-safe
      // ✅ currentTime captured at the exact moment of button click — not from any input field
      const capturedTime = currentTime;
      const checkInISO   = new Date(`${todayStr}T${capturedTime}:00`).toISOString();

      await api.post('/attendance/checkin', {
        employeeName: ciName.trim(),
        checkIn: checkInISO,
        todayTasks: ciTasks.trim(),
      });
      showToast(`Check-in marked for ${ciName} at ${capturedTime}`);
      setCiTasks('');
      setCiErrors({});
      fetchTodayRecords();
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed. Try again.', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!validateCheckOut()) return;
    setCheckOutLoading(true);
    try {
      const todayStr = getLocalDateString(); // ✅ IST-safe
      // ✅ currentTime captured at the exact moment of button click — not from any input field
      const capturedTime  = currentTime;
      const checkOutISO   = new Date(`${todayStr}T${capturedTime}:00`).toISOString();

      await api.post('/attendance/checkout', {
        employeeName: coName.trim(),
        checkOut: checkOutISO,
        updatedTasks: coTasks.trim(),
      });
      showToast(`Check-out marked for ${coName} at ${capturedTime}`);
      setCoTasks('');
      setCoErrors({});
      fetchTodayRecords();
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-out failed. Try again.', 'error');
    } finally {
      setCheckOutLoading(false);
    }
  };

  const fmtTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

  const calcHours = (r) => {
    if (r?.checkIn && r?.checkOut) {
      const diff = (new Date(r.checkOut) - new Date(r.checkIn)) / 3600000;
      return `${diff.toFixed(1)}h`;
    }
    return null;
  };

  /* ── shared mini styles ── */
  const inputStyle = (hasErr) => ({
    width: '100%',
    padding: '10px 13px',
    border: `1px solid ${hasErr ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: '8px',
    fontSize: '14px',
    background: 'var(--bg)',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  });

  // ✅ Style for read-only time display field
  const readOnlyTimeStyle = {
    width: '100%',
    padding: '10px 13px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'var(--bg-muted, #f3f4f6)',
    color: 'var(--text-muted)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    cursor: 'not-allowed',
    userSelect: 'none',
    fontWeight: 600,
    letterSpacing: '0.05em',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const errStyle = { fontSize: '12px', color: 'var(--danger)', marginTop: '4px' };

  return (
    <div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'error' ? 'var(--danger)' : 'var(--success)',
          color: '#fff', padding: '13px 20px', borderRadius: '10px',
          fontSize: '14px', fontWeight: 500, maxWidth: '340px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Attendance</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Mark your daily check-in and check-out
          </p>
        </div>
      </div>

      {/* ── Info Bar ── */}
      <div className="card" style={{
        borderLeft: '3px solid var(--primary)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0',
        marginBottom: '24px',
        padding: '20px 24px',
      }}>
        {/* Day */}
        <div style={{ borderRight: '1px solid var(--border)', paddingRight: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Day</div>
          <div style={{ fontSize: '20px', fontWeight: 800 }}>{DAYS_FULL[liveTime.getDay()]}</div>
        </div>
        {/* Date */}
        <div style={{ borderRight: '1px solid var(--border)', paddingLeft: '20px', paddingRight: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Date</div>
          <div style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1 }}>{String(liveTime.getDate()).padStart(2, '0')}</div>
        </div>
        {/* Month / Year */}
        <div style={{ borderRight: '1px solid var(--border)', paddingLeft: '20px', paddingRight: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Month / Year</div>
          <div style={{ fontSize: '20px', fontWeight: 800 }}>{MONTHS[liveTime.getMonth()]}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{liveTime.getFullYear()}</div>
        </div>
        {/* Live Clock */}
        <div style={{ paddingLeft: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Current Time</div>
          <div style={{ fontSize: '30px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {liveHH}:{liveMM}
            <span style={{ fontSize: '18px', color: 'var(--accent)', marginLeft: '3px' }}>:{liveSS}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {liveTime.toLocaleDateString('en-IN')} IST
          </div>
        </div>
      </div>

      {/* ── Check In + Check Out Forms ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

        {/* CHECK IN */}
        <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0,
            }}>✅</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Check In</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mark your arrival time</div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Employee Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={ciName}
              onChange={e => { setCiName(e.target.value); setCiErrors(p => ({ ...p, name: '' })); }}
              style={inputStyle(ciErrors.name)}
            />
            {ciErrors.name && <div style={errStyle}>{ciErrors.name}</div>}
          </div>

          {/* ✅ FIXED: Read-only time display — auto-captured from live clock */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>
              Check-In Time
              <span style={{
                marginLeft: '8px',
                fontSize: '10px',
                fontWeight: 600,
                background: 'rgba(16,185,129,0.15)',
                color: 'var(--success)',
                padding: '2px 8px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>Auto-captured</span>
            </label>
            <div style={readOnlyTimeStyle}>
              🕐 {currentTime} <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>(recorded at submit)</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Time is automatically recorded and cannot be changed.
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Today's Tasks <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              placeholder={'What will you work on today?\ne.g. Fix login bug, Review PR #42...'}
              value={ciTasks}
              onChange={e => { setCiTasks(e.target.value); setCiErrors(p => ({ ...p, tasks: '' })); }}
              rows={5}
              style={{ ...inputStyle(ciErrors.tasks), resize: 'vertical', lineHeight: 1.6 }}
            />
            {ciErrors.tasks && <div style={errStyle}>{ciErrors.tasks}</div>}
          </div>

          <button
            onClick={handleCheckIn}
            disabled={checkInLoading}
            className="btn btn-primary"
            style={{
              width: '100%', padding: '12px',
              background: 'var(--success)',
              fontSize: '15px', fontWeight: 700,
              opacity: checkInLoading ? 0.7 : 1,
              cursor: checkInLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {checkInLoading ? 'Saving...' : '✅ Mark Check-In'}
          </button>
        </div>

        {/* CHECK OUT */}
        <div className="card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', flexShrink: 0,
            }}>🏁</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Check Out</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mark your departure time</div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Employee Name <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={coName}
              onChange={e => { setCoName(e.target.value); setCoErrors(p => ({ ...p, name: '' })); }}
              style={inputStyle(coErrors.name)}
            />
            {coErrors.name && <div style={errStyle}>{coErrors.name}</div>}
          </div>

          {/* ✅ FIXED: Read-only time display — auto-captured from live clock */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>
              Check-Out Time
              <span style={{
                marginLeft: '8px',
                fontSize: '10px',
                fontWeight: 600,
                background: 'rgba(239,68,68,0.15)',
                color: 'var(--danger)',
                padding: '2px 8px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>Auto-captured</span>
            </label>
            <div style={readOnlyTimeStyle}>
              🕐 {currentTime} <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>(recorded at submit)</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Time is automatically recorded and cannot be changed.
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Updated Tasks / Work Done <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              placeholder={'What did you complete today?\ne.g. Fixed login bug ✓, Reviewed PR #42 ✓...'}
              value={coTasks}
              onChange={e => { setCoTasks(e.target.value); setCoErrors(p => ({ ...p, tasks: '' })); }}
              rows={5}
              style={{ ...inputStyle(coErrors.tasks), resize: 'vertical', lineHeight: 1.6 }}
            />
            {coErrors.tasks && <div style={errStyle}>{coErrors.tasks}</div>}
          </div>

          <button
            onClick={handleCheckOut}
            disabled={checkOutLoading}
            className="btn btn-danger"
            style={{
              width: '100%', padding: '12px',
              fontSize: '15px', fontWeight: 700,
              opacity: checkOutLoading ? 0.7 : 1,
              cursor: checkOutLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {checkOutLoading ? 'Saving...' : '🏁 Mark Check-Out'}
          </button>
        </div>
      </div>

      {/* ── Today's Records ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>📋 Today's Attendance Records</h3>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '20px',
            background: 'rgba(99,102,241,0.15)',
            color: 'var(--primary)',
          }}>
            {records.length} {records.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {loadingRecords ? (
          <div className="loading"><div className="spinner" /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p>No records yet for today</p>
            <span>Mark your check-in above to get started.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {records.map((r, i) => {
              const hours    = calcHours(r);
              const initials = (r.employeeName || r.name || 'E')
                .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

              return (
                <div key={i} style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>

                    {/* Avatar + Name + Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: 'var(--primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '14px', flexShrink: 0,
                      }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{r.employeeName || r.name || 'Employee'}</div>
                        <span style={{
                          fontSize: '11px', fontWeight: 700,
                          padding: '3px 10px', borderRadius: '20px',
                          background: r.checkOut ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                          color: r.checkOut ? 'var(--success)' : 'var(--warning)',
                        }}>
                          {r.checkOut ? 'Present' : 'Checked In'}
                        </span>
                      </div>
                    </div>

                    {/* Times */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Check In</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)' }}>{fmtTime(r.checkIn)}</div>
                      </div>
                      <div style={{ fontSize: '16px', color: 'var(--text-muted)' }}>→</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Check Out</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: r.checkOut ? 'var(--danger)' : 'var(--text-muted)' }}>
                          {fmtTime(r.checkOut)}
                        </div>
                      </div>
                      {hours && (
                        <>
                          <div style={{ fontSize: '16px', color: 'var(--text-muted)' }}>·</div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Hours</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent)' }}>{hours}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  {(r.todayTasks || r.updatedTasks) && (
                    <div style={{
                      marginTop: '14px', paddingTop: '14px',
                      borderTop: '1px solid var(--border)',
                      display: 'grid',
                      gridTemplateColumns: r.todayTasks && r.updatedTasks ? '1fr 1fr' : '1fr',
                      gap: '16px',
                    }}>
                      {r.todayTasks && (
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                            📝 Today's Tasks
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {r.todayTasks}
                          </div>
                        </div>
                      )}
                      {r.updatedTasks && (
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                            ✅ Work Done
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {r.updatedTasks}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}