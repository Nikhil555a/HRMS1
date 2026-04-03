
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AttendanceDetail from './AttendanceDetails';

const STATUS_COLORS = {
  Present: 'success', Absent: 'danger', 'Half Day': 'warning',
  Late: 'warning', 'On Leave': 'info', Holiday: 'primary', 'Work From Home': 'success'
};

const GOOGLE_FORMS = {
  checkIn:  'https://docs.google.com/forms/d/e/1FAIpQLScyMwBg4JxsNsg2NLMVH1o7RtCh0DI0GDMBhdV6cOb02QA2pA/viewform?usp=sharing&ouid=106611396295852976779',
  checkOut: 'https://docs.google.com/forms/d/e/1FAIpQLScNx8C6n2tVXSqGEh4I2xAFj37KfzzWgbeFwpIDuvtQHLH2hw/viewform?usp=sharing&ouid=106611396295852976779',
};

// ── Helper: compare two dates (ignoring time) ──────────────────────────────
// FIX: robust date comparison — handles timezone issues
const isSameLocalDate = (isoString, localDateString) => {
  if (!isoString) return false;
  const d = new Date(isoString);
  // localDateString is already YYYY-MM-DD in local time
  const local = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return local === localDateString;
};

// ── Check In Modal ─────────────────────────────────────────────────────────
function CheckInModal({ employees, onClose, onSuccess }) {
  const [selectedEmp, setSelectedEmp]   = useState('');
  const [checkInTime, setCheckInTime]   = useState(new Date().toTimeString().substring(0, 5));
  const [todayTasks,  setTodayTasks]    = useState('');
  const [step,        setStep]          = useState(1);
  const [loading,     setLoading]       = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleProceed = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return toast.error('Please select an employee');
    if (!checkInTime)  return toast.error('Please enter check-in time');

    setLoading(true);
    try {
      await api.post('/attendance/manual', {
        employee: selectedEmp,
        date:     today,
        status:   'Present',
        checkIn:  `${today}T${checkInTime}:00`,
        notes:    todayTasks ? `Tasks: ${todayTasks}` : '',
      });
      toast.success('Check-in marked successfully!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking check-in');
    } finally {
      setLoading(false);
    }
  };

  const emp = employees.find(e => e._id === selectedEmp);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal checkin-modal" style={{ maxWidth: '480px', width: '100%', borderRadius: '20px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '24px', position: 'relative' }}>
          <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: '#fff', opacity: 0.8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🟢</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>
                Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}! 👋
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginTop: '2px' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
            {['Mark Attendance', 'Fill Google Form'].map((label, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: step > i + 1 ? '#fff' : step === i + 1 ? '#fff' : 'rgba(255,255,255,0.3)',
                    color: step > i + 1 ? '#10b981' : step === i + 1 ? '#10b981' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700,
                  }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '11px', color: step === i + 1 ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: step === i + 1 ? 700 : 400 }}>
                    {label}
                  </span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {step === 1 ? (
            <form onSubmit={handleProceed}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Employee *
                  </label>
                  <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} required style={{ width: '100%' }}>
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Check-In Time *
                  </label>
                  <input type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} required style={{ width: '100%' }} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Today's Tasks
                  </label>
                  <textarea
                    value={todayTasks} onChange={e => setTodayTasks(e.target.value)}
                    placeholder="What are you working on today?..." rows={3}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                    💡 You'll also fill this in the Google Form in the next step
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#a7f3d0' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  {loading
                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Marking...</>
                    : <>✅ Mark Check-In & Continue</>
                  }
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '20px',
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', margin: '0 auto 16px',
              }}>✅</div>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>Check-In Marked!</div>
              {emp && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                  <b>{emp.firstName} {emp.lastName}</b> checked in at <b>{checkInTime}</b>
                </div>
              )}
              <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#15803d', marginBottom: '8px' }}>📋 Step 2: Fill Google Form</div>
                <div style={{ fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
                  Please fill in your name, check-in time, and today's tasks in the Google Form.
                </div>
              </div>
              <a href={GOOGLE_FORMS.checkIn} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
                  color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
                  textDecoration: 'none', marginBottom: '10px',
                }}
                onClick={() => setTimeout(onSuccess, 500)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                Open Check-In Google Form
              </a>
              <button onClick={onSuccess} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--color-border-tertiary)', borderRadius: '10px', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
                Skip & Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Check Out Modal ────────────────────────────────────────────────────────
function CheckOutModal({ employees, onClose, onSuccess }) {
  const [selectedEmp,   setSelectedEmp]   = useState('');
  const [checkOutTime,  setCheckOutTime]  = useState(new Date().toTimeString().substring(0, 5));
  const [todayUpdates,  setTodayUpdates]  = useState('');
  const [step,          setStep]          = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [todayRecord,   setTodayRecord]   = useState(null);
  const [fetching,      setFetching]      = useState(false);

  // FIX: Get today's date in LOCAL timezone as YYYY-MM-DD
  const getTodayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const today = getTodayLocal();

  // useEffect(() => {
  //   if (!selectedEmp) { setTodayRecord(null); return; }
  //   setFetching(true);

  //   const month = new Date().getMonth() + 1;
  //   const year  = new Date().getFullYear();

  //   // FIX: Fetch attendance records for the selected employee for current month
  //   api.get('/attendance', { params: { employee: selectedEmp, month, year } })
  //     .then(res => {
  //       const records = Array.isArray(res.data) ? res.data : (res.data?.records || []);

  //       // FIX: Use robust local-date comparison instead of string startsWith
  //       // Backend stores dates as midnight UTC; we compare by local date parts
  //       const rec = records.find(r => {
  //         if (!r.date) return false;
  //         return isSameLocalDate(r.date, today);
  //       });

  //       setTodayRecord(rec || null);
  //     })
  //     .catch(() => setTodayRecord(null))
  //     .finally(() => setFetching(false));
  // }, [selectedEmp]);
 useEffect(() => {
  const today = getTodayLocal(); // 👈 move inside useEffect
  if (!selectedEmp) { setTodayRecord(null); return; }
  setFetching(true);

  const month = today.getMonth() + 1;
  const year  = today.getFullYear();

  api.get('/attendance', { params: { employee: selectedEmp, month, year } })
    .then(res => {
      const records = Array.isArray(res.data) ? res.data : (res.data?.records || []);
      const rec = records.find(r => r.date && isSameLocalDate(r.date, today));
      setTodayRecord(rec || null);
    })
    .catch(() => setTodayRecord(null))
    .finally(() => setFetching(false));
}, [selectedEmp]); // ✅ warning gone



  const handleProceed = async (e) => {
    e.preventDefault();
    if (!selectedEmp)  return toast.error('Please select an employee');
    if (!todayRecord)  return toast.error('No check-in found for today. Please mark check-in first.');
    if (!checkOutTime) return toast.error('Please enter check-out time');

    if (todayRecord.checkOut) {
      return toast.error('This employee has already checked out today.');
    }

    setLoading(true);
    try {
      const checkIn  = todayRecord.checkIn;
      const checkOut = `${today}T${checkOutTime}:00`;
      const workHrs  = checkIn
        ? Math.max(0, (new Date(checkOut) - new Date(checkIn)) / 3600000)
        : 0;

      await api.put(`/attendance/${todayRecord._id}`, {
        checkOut,
        workHours: parseFloat(workHrs.toFixed(2)),
        notes: [todayRecord.notes, todayUpdates ? `Updates: ${todayUpdates}` : ''].filter(Boolean).join(' | '),
      });

      toast.success('Check-out marked successfully!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking check-out');
    } finally {
      setLoading(false);
    }
  };

  const emp = employees.find(e => e._id === selectedEmp);

  const fmtCheckInTime = todayRecord?.checkIn
    ? new Date(todayRecord.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px', width: '100%', borderRadius: '20px', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '24px', position: 'relative' }}>
          <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', color: '#fff', opacity: 0.8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px' }}>🌅</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '18px' }}>Good Work Today! 💪</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginTop: '2px' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
            {['Mark Check-Out', 'Fill Google Form'].map((label, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: step > i + 1 ? '#fff' : step === i + 1 ? '#fff' : 'rgba(255,255,255,0.3)',
                    color: step > i + 1 ? '#f59e0b' : step === i + 1 ? '#f59e0b' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700,
                  }}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '11px', color: step === i + 1 ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: step === i + 1 ? 700 : 400 }}>
                    {label}
                  </span>
                </div>
                {i < 1 && <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="modal-body" style={{ padding: '24px' }}>
          {step === 1 ? (
            <form onSubmit={handleProceed}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Employee *
                  </label>
                  <select value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)} required style={{ width: '100%' }}>
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                    ))}
                  </select>
                </div>

                {/* Status card after employee selected */}
                {selectedEmp && (
                  <div style={{
                    padding: '12px 14px', borderRadius: '10px',
                    background: fetching ? '#f9fafb' : todayRecord?.checkOut ? '#fef9c3' : todayRecord ? '#f0fdf4' : '#fef2f2',
                    border: `1.5px solid ${fetching ? '#e5e7eb' : todayRecord?.checkOut ? '#fde047' : todayRecord ? '#86efac' : '#fecaca'}`,
                    fontSize: '12px',
                  }}>
                    {fetching ? (
                      <span style={{ color: 'var(--color-text-tertiary)' }}>🔍 Checking today's record...</span>
                    ) : todayRecord?.checkOut ? (
                      <>
                        <div style={{ fontWeight: 700, color: '#854d0e', marginBottom: '4px' }}>⚠️ Already checked out</div>
                        <div style={{ color: '#713f12' }}>
                          Checked in: <b>{fmtCheckInTime}</b> &nbsp;·&nbsp;
                          Checked out: <b>{new Date(todayRecord.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</b>
                        </div>
                      </>
                    ) : todayRecord ? (
                      <>
                        <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>✅ Check-in found</div>
                        <div style={{ color: '#166534' }}>
                          Checked in at: <b>{fmtCheckInTime}</b>
                          {todayRecord.notes && <> &nbsp;·&nbsp; {todayRecord.notes}</>}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>❌ No check-in found for today</div>
                        <div style={{ color: '#b91c1c' }}>Please mark check-in first before checkout.</div>
                      </>
                    )}
                  </div>
                )}

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Check-Out Time *
                  </label>
                  <input type="time" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} required style={{ width: '100%' }} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                    Today's Updates
                  </label>
                  <textarea
                    value={todayUpdates} onChange={e => setTodayUpdates(e.target.value)}
                    placeholder="What did you accomplish today?..." rows={3}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                    💡 You'll also fill this in the Google Form in the next step
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !todayRecord || !!todayRecord?.checkOut}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading || !todayRecord || todayRecord?.checkOut ? '#fde68a' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    fontWeight: 700, fontSize: '14px',
                    cursor: loading || !todayRecord || todayRecord?.checkOut ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {loading
                    ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Marking...</>
                    : <>🌅 Mark Check-Out & Continue</>
                  }
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '20px',
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', margin: '0 auto 16px',
              }}>🌅</div>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px' }}>Check-Out Marked!</div>
              {emp && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                  <b>{emp.firstName} {emp.lastName}</b> checked out at <b>{checkOutTime}</b>
                </div>
              )}
              <div style={{ background: '#fffbeb', border: '1.5px solid #fcd34d', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400e', marginBottom: '8px' }}>📋 Step 2: Fill Google Form</div>
                <div style={{ fontSize: '12px', color: '#78350f', lineHeight: 1.6 }}>
                  Please fill in your name, check-out time, and today's updates in the Google Form.
                </div>
              </div>
              <a href={GOOGLE_FORMS.checkOut} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
                  color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '14px',
                  textDecoration: 'none', marginBottom: '10px',
                }}
                onClick={() => setTimeout(onSuccess, 500)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                Open Check-Out Google Form
              </a>
              <button onClick={onSuccess} style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--color-border-tertiary)', borderRadius: '10px', color: 'var(--color-text-secondary)', fontSize: '13px', cursor: 'pointer' }}>
                Skip & Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Attendance Component ──────────────────────────────────────────────
export default function Attendance() {
  const [records,          setRecords]          = useState([]);
  const [employees,        setEmployees]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [showModal,        setShowModal]        = useState(false);
  const [showCheckIn,      setShowCheckIn]      = useState(false);
  const [showCheckOut,     setShowCheckOut]     = useState(false);
  const [editRecord,       setEditRecord]       = useState(null);
  const [summary,          setSummary]          = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const now = new Date();
  const [month,        setMonth]        = useState(now.getMonth() + 1);
  const [year,         setYear]         = useState(now.getFullYear());
  const [filterEmp,    setFilterEmp]    = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [form, setForm] = useState({
    employee: '', date: new Date().toISOString().split('T')[0],
    status: 'Present', checkIn: '', checkOut: '',
    leaveType: '', leaveReason: '', notes: ''
  });

  const fetchRecords = useCallback(() => {
    setLoading(true);
    const params = { month, year };
    if (filterEmp)    params.employee = filterEmp;
    if (filterStatus) params.status   = filterStatus;

    api.get('/attendance', { params })
      .then(r => setRecords(Array.isArray(r.data) ? r.data : (r.data?.records || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [month, year, filterEmp, filterStatus]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  useEffect(() => {
    api.get('/employees?limit=200')
      .then(r => setEmployees(r.data?.employees || r.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (filterEmp) {
      api.get(`/attendance/summary/${filterEmp}`, { params: { month, year } })
        .then(r => setSummary(r.data?.summary || r.data))
        .catch(() => setSummary(null));
    } else {
      setSummary(null);
    }
  }, [filterEmp, month, year]);

  const openAdd = () => {
    setEditRecord(null);
    setForm({ employee: '', date: new Date().toISOString().split('T')[0], status: 'Present', checkIn: '', checkOut: '', leaveType: '', leaveReason: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (rec) => {
    setEditRecord(rec);
    setForm({
      employee:    rec.employee?._id || '',
      date:        rec.date?.split('T')[0] || '',
      status:      rec.status,
      checkIn:     rec.checkIn  ? new Date(rec.checkIn).toTimeString().substring(0, 5)  : '',
      checkOut:    rec.checkOut ? new Date(rec.checkOut).toTimeString().substring(0, 5) : '',
      leaveType:   rec.leaveType   || '',
      leaveReason: rec.leaveReason || '',
      notes:       rec.notes       || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.checkIn)  payload.checkIn  = `${payload.date}T${payload.checkIn}:00`;
      if (payload.checkOut) payload.checkOut = `${payload.date}T${payload.checkOut}:00`;

      if (editRecord) {
        await api.put(`/attendance/${editRecord._id}`, payload);
        toast.success('Record updated!');
      } else {
        await api.post('/attendance', payload);
        toast.success('Attendance marked!');
      }
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Attendance</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {records.length} records for {months[month - 1]} {year}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCheckIn(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Check In
          </button>
          <button
            onClick={() => setShowCheckOut(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Check Out
          </button>
          <button className="btn btn-secondary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Manual Entry
          </button>
        </div>
      </div>

      {/* ── SUMMARY CARDS ── */}
      {summary && (
        <div className="stats-grid" style={{ marginBottom: '20px' }}>
          {[
            ['Present',     summary.present,                        '#10b981'],
            ['Absent',      summary.absent,                         '#ef4444'],
            ['On Leave',    summary.onLeave,                        '#f59e0b'],
            ['Half Day',    summary.halfDay,                        '#f59e0b'],
            ['WFH',         summary.wfh,                           '#22d3ee'],
            ['Total Hours', `${(summary.totalWorkHours||0).toFixed(1)}h`, '#6366f1'],
          ].map(([l, v, c]) => (
            <div key={l} className="stat-card">
              <div>
                <div className="stat-value" style={{ color: c, fontSize: '24px' }}>{v}</div>
                <div className="stat-label">{l}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FILTERS ── */}
      <div className="filters-bar">
        <select value={month} onChange={e => setMonth(Number(e.target.value))}>
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} style={{ minWidth: '200px' }}>
          <option value="">All Employees</option>
          {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Present','Absent','Half Day','Late','On Leave','Holiday','Work From Home'].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {(filterEmp || filterStatus) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilterEmp(''); setFilterStatus(''); setSummary(null); }}>
            Clear
          </button>
        )}
      </div>

      {/* ── TABLE ── */}
      <div className="card">
        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>Date</th><th>Status</th>
                  <th>Check In</th><th>Check Out</th><th>Hours</th>
                  <th>Leave Type</th><th>Notes</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => (
                  <tr key={rec._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                        onClick={() => setSelectedEmployee(rec.employee)}
                        title="Click to view month-wise attendance"
                      >
                        <div className="emp-avatar" style={{ width: 30, height: 30, fontSize: '11px' }}>
                          {rec.employee?.firstName?.[0]}{rec.employee?.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-info)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                            {rec.employee?.firstName} {rec.employee?.lastName}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rec.employee?.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {rec.date ? new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td><span className={`badge badge-${STATUS_COLORS[rec.status] || 'muted'}`}>{rec.status}</span></td>
                    <td style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                      {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                      {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td style={{ fontSize: '13px' }}>{rec.workHours > 0 ? `${rec.workHours.toFixed(1)}h` : '—'}</td>
                    <td style={{ fontSize: '13px' }}>{rec.leaveType || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rec.notes || '—'}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(rec)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && (
              <div className="empty-state">
                <p>No attendance records</p>
                <span>Mark attendance to see records here</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {selectedEmployee && <AttendanceDetail employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}

      {showCheckIn && (
        <CheckInModal
          employees={employees}
          onClose={() => setShowCheckIn(false)}
          onSuccess={() => { setShowCheckIn(false); fetchRecords(); }}
        />
      )}

      {showCheckOut && (
        <CheckOutModal
          employees={employees}
          onClose={() => setShowCheckOut(false)}
          onSuccess={() => { setShowCheckOut(false); fetchRecords(); }}
        />
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editRecord ? 'Edit Attendance' : 'Mark Attendance'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Employee *</label>
                    <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} required>
                      <option value="">Select Employee</option>
                      {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      {['Present','Absent','Half Day','Late','On Leave','Holiday','Work From Home'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Check In Time</label>
                    <input type="time" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Check Out Time</label>
                    <input type="time" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} />
                  </div>
                  {form.status === 'On Leave' && (
                    <>
                      <div className="form-group">
                        <label>Leave Type</label>
                        <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                          <option value="">Select</option>
                          {['Casual','Sick','Annual','Maternity','Paternity','Unpaid','Other'].map(t => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Leave Reason</label>
                        <input value={form.leaveReason} onChange={e => setForm({ ...form, leaveReason: e.target.value })} placeholder="Reason for leave" />
                      </div>
                    </>
                  )}
                  <div className="form-group full">
                    <label>Notes</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editRecord ? 'Update' : 'Mark Attendance'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}