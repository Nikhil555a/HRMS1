
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const now = new Date();

  // Live clock
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [toast, setToast] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  // Check In Form
  const [ciName, setCiName] = useState(user?.name || '');
  const [ciTime, setCiTime] = useState('');
  const [ciTasks, setCiTasks] = useState('');
  const [ciErrors, setCiErrors] = useState({});

  // Check Out Form
  const [coName, setCoName] = useState(user?.name || '');
  const [coTime, setCoTime] = useState('');
  const [coTasks, setCoTasks] = useState('');
  const [coErrors, setCoErrors] = useState({});

  // Records
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  useEffect(() => {
    fetchTodayRecords();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setCiTime(`${h}:${m}`);
    setCoTime(`${h}:${m}`);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTodayRecords = async () => {
    setLoadingRecords(true);
    try {
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const res = await api.get('/attendance/my', { params: { month, year } });
      const data = res.data || [];
      const todayStr = now.toISOString().split('T')[0];
      setRecords(data.filter(r => r.date?.startsWith(todayStr)));
    } catch {
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const validateCheckIn = () => {
    const errs = {};
    if (!ciName.trim()) errs.name = 'Name is required';
    if (!ciTime) errs.time = 'Time is required';
    if (!ciTasks.trim()) errs.tasks = "Today's tasks are required";
    setCiErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateCheckOut = () => {
    const errs = {};
    if (!coName.trim()) errs.name = 'Name is required';
    if (!coTime) errs.time = 'Time is required';
    if (!coTasks.trim()) errs.tasks = 'Updated tasks are required';
    setCoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckIn = async () => {
    if (!validateCheckIn()) return;
    setCheckInLoading(true);
    try {
      const todayStr = now.toISOString().split('T')[0];
      const checkInISO = new Date(`${todayStr}T${ciTime}:00`).toISOString();
      await api.post('/attendance/checkin', {
        employeeName: ciName.trim(),
        checkIn: checkInISO,
        todayTasks: ciTasks.trim(),
      });
      showToast(`Check-in marked for ${ciName} at ${ciTime}`);
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
      const todayStr = now.toISOString().split('T')[0];
      const checkOutISO = new Date(`${todayStr}T${coTime}:00`).toISOString();
      await api.post('/attendance/checkout', {
        employeeName: coName.trim(),
        checkOut: checkOutISO,
        updatedTasks: coTasks.trim(),
      });
      showToast(`Check-out marked for ${coName} at ${coTime}`);
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

  const liveHH = String(liveTime.getHours()).padStart(2, '0');
  const liveMM = String(liveTime.getMinutes()).padStart(2, '0');
  const liveSS = String(liveTime.getSeconds()).padStart(2, '0');

  const card = {
    background: 'var(--color-background-primary)',
    border: '0.5px solid var(--color-border-tertiary)',
    borderRadius: '16px',
    padding: '24px',
  };

  const inputBase = (hasErr) => ({
    width: '100%',
    padding: '11px 14px',
    border: `0.5px solid ${hasErr ? '#dc2626' : 'var(--color-border-tertiary)'}`,
    borderRadius: '10px',
    fontSize: '14px',
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    boxSizing: 'border-box',
  });

  const label = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const errMsg = { fontSize: '12px', color: '#dc2626', marginTop: '4px' };

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)', maxWidth: '1060px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'error' ? '#7f1d1d' : '#064e3b',
          color: '#fff', padding: '13px 20px', borderRadius: '12px',
          fontSize: '14px', fontWeight: 500, maxWidth: '340px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>{toast.type === 'error' ? '❌' : '✅'}</span>
          {toast.msg}
        </div>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Employee Attendance</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Manually mark your daily check-in and check-out
        </p>
      </div>

      {/* ── TOP INFO BAR ── */}
      <div style={{
        borderRadius: '16px',
        background: '#1e1b4b',
        padding: '20px 28px',
        marginBottom: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        {/* Day */}
        <div style={{ borderRight: '0.5px solid #3730a3', paddingRight: '16px' }}>
          <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Day</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{DAYS_FULL[now.getDay()]}</div>
        </div>
        {/* Date */}
        <div style={{ borderRight: '0.5px solid #3730a3', paddingRight: '16px' }}>
          <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Date</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{String(now.getDate()).padStart(2, '0')}</div>
        </div>
        {/* Month / Year */}
        <div style={{ borderRight: '0.5px solid #3730a3', paddingRight: '16px' }}>
          <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Month / Year</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>{MONTHS[now.getMonth()]}</div>
          <div style={{ fontSize: '14px', color: '#a5b4fc', fontWeight: 500 }}>{now.getFullYear()}</div>
        </div>
        {/* Live Clock */}
        <div>
          <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>Current Time</div>
          <div style={{
            fontSize: '32px', fontWeight: 800, color: '#fff',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {liveHH}:{liveMM}
            <span style={{ fontSize: '18px', color: '#818cf8', marginLeft: '3px' }}>:{liveSS}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#a5b4fc', marginTop: '2px' }}>
            {now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>
      </div>

      {/* ── CHECK IN + CHECK OUT FORMS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

        {/* CHECK IN */}
        <div style={{ ...card, borderTop: '3px solid #059669' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: '#d1fae5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px', flexShrink: 0,
            }}>✅</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '17px' }}>Check In</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Mark your arrival time</div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Employee Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={ciName}
              onChange={e => { setCiName(e.target.value); setCiErrors(p => ({ ...p, name: '' })); }}
              style={inputBase(ciErrors.name)}
            />
            {ciErrors.name && <div style={errMsg}>{ciErrors.name}</div>}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Check-In Time <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="time"
              value={ciTime}
              onChange={e => { setCiTime(e.target.value); setCiErrors(p => ({ ...p, time: '' })); }}
              style={inputBase(ciErrors.time)}
            />
            {ciErrors.time && <div style={errMsg}>{ciErrors.time}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Today's Tasks <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea
              placeholder={'What will you work on today?\ne.g. Fix login bug, Review PR #42, Client meeting at 3pm...'}
              value={ciTasks}
              onChange={e => { setCiTasks(e.target.value); setCiErrors(p => ({ ...p, tasks: '' })); }}
              rows={5}
              style={{ ...inputBase(ciErrors.tasks), resize: 'vertical', lineHeight: 1.6 }}
            />
            {ciErrors.tasks && <div style={errMsg}>{ciErrors.tasks}</div>}
          </div>

          <button
            onClick={handleCheckIn}
            disabled={checkInLoading}
            style={{
              width: '100%', padding: '13px',
              background: checkInLoading ? '#6ee7b7' : '#059669',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 700,
              cursor: checkInLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {checkInLoading ? 'Saving...' : '✅ Mark Check-In'}
          </button>
        </div>

        {/* CHECK OUT */}
        <div style={{ ...card, borderTop: '3px solid #dc2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: '#fee2e2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px', flexShrink: 0,
            }}>🏁</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '17px' }}>Check Out</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Mark your departure time</div>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Employee Name <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={coName}
              onChange={e => { setCoName(e.target.value); setCoErrors(p => ({ ...p, name: '' })); }}
              style={inputBase(coErrors.name)}
            />
            {coErrors.name && <div style={errMsg}>{coErrors.name}</div>}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={label}>Check-Out Time <span style={{ color: '#dc2626' }}>*</span></label>
            <input
              type="time"
              value={coTime}
              onChange={e => { setCoTime(e.target.value); setCoErrors(p => ({ ...p, time: '' })); }}
              style={inputBase(coErrors.time)}
            />
            {coErrors.time && <div style={errMsg}>{coErrors.time}</div>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={label}>Updated Tasks / Work Done <span style={{ color: '#dc2626' }}>*</span></label>
            <textarea
              placeholder={'What did you complete today?\ne.g. Fixed login bug ✓, Reviewed PR #42 ✓\nPending: API integration...'}
              value={coTasks}
              onChange={e => { setCoTasks(e.target.value); setCoErrors(p => ({ ...p, tasks: '' })); }}
              rows={5}
              style={{ ...inputBase(coErrors.tasks), resize: 'vertical', lineHeight: 1.6 }}
            />
            {coErrors.tasks && <div style={errMsg}>{coErrors.tasks}</div>}
          </div>

          <button
            onClick={handleCheckOut}
            disabled={checkOutLoading}
            style={{
              width: '100%', padding: '13px',
              background: checkOutLoading ? '#fca5a5' : '#dc2626',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 700,
              cursor: checkOutLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {checkOutLoading ? 'Saving...' : '🏁 Mark Check-Out'}
          </button>
        </div>
      </div>

      {/* ── TODAY'S RECORDS ── */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>📋 Today's Attendance Records</div>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '20px', background: '#e0e7ff', color: '#3730a3',
          }}>
            {records.length} {records.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {loadingRecords ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
            Loading...
          </div>
        ) : records.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--color-text-tertiary)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>No records yet for today</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>Mark your check-in above to get started.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {records.map((r, i) => {
              const hours = calcHours(r);
              const initials = (r.employeeName || r.name || 'E').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div key={i} style={{
                  background: 'var(--color-background-secondary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: '14px', padding: '18px 20px',
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    {/* Name + Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: '#c7d2fe', color: '#3730a3',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '15px', flexShrink: 0,
                      }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{r.employeeName || r.name || 'Employee'}</div>
                        <span style={{
                          fontSize: '11px', fontWeight: 700,
                          padding: '3px 10px', borderRadius: '20px',
                          background: r.checkOut ? '#d1fae5' : '#fef3c7',
                          color: r.checkOut ? '#065f46' : '#92400e',
                        }}>
                          {r.checkOut ? 'Present' : 'Checked In'}
                        </span>
                      </div>
                    </div>

                    {/* Times */}
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Check In</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>{fmtTime(r.checkIn)}</div>
                      </div>
                      <div style={{ fontSize: '16px', color: 'var(--color-text-tertiary)' }}>→</div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Check Out</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: r.checkOut ? '#dc2626' : 'var(--color-text-tertiary)' }}>
                          {fmtTime(r.checkOut)}
                        </div>
                      </div>
                      {hours && (
                        <>
                          <div style={{ fontSize: '16px', color: 'var(--color-text-tertiary)' }}>·</div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Hours</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#4f46e5' }}>{hours}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  {(r.todayTasks || r.updatedTasks) && (
                    <div style={{
                      marginTop: '14px', paddingTop: '14px',
                      borderTop: '0.5px solid var(--color-border-tertiary)',
                      display: 'grid',
                      gridTemplateColumns: r.todayTasks && r.updatedTasks ? '1fr 1fr' : '1fr',
                      gap: '16px',
                    }}>
                      {r.todayTasks && (
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                            📝 Today's Tasks
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {r.todayTasks}
                          </div>
                        </div>
                      )}
                      {r.updatedTasks && (
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                            ✅ Work Done
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
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