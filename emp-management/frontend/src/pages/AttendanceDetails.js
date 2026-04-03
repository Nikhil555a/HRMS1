
// sahi hai ye 

import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

// ============================================================
// 🎉 INDIAN GOVERNMENT HOLIDAYS — Dynamic by Year
// National + Major Religious Festivals (Gazetted Holidays)
// ============================================================
function getIndianHolidays(year) {
  // Fixed national holidays
  const fixed = {
    [`${year}-01-26`]: { name: 'Republic Day',      type: 'national', icon: '🇮🇳' },
    [`${year}-08-15`]: { name: 'Independence Day',  type: 'national', icon: '🇮🇳' },
    [`${year}-10-02`]: { name: 'Gandhi Jayanti',    type: 'national', icon: '🕊️'  },
    [`${year}-04-14`]: { name: 'Ambedkar Jayanti',  type: 'national', icon: '📜'  },
    [`${year}-11-14`]: { name: "Children's Day",    type: 'national', icon: '👶'  },
    [`${year}-12-25`]: { name: 'Christmas',         type: 'festival', icon: '🎄'  },
    [`${year}-01-01`]: { name: "New Year's Day",    type: 'festival', icon: '🎆'  },
  };

  // Year-specific floating holidays
  const floating = {
    2024: {
      '2024-01-14': { name: 'Makar Sankranti',              type: 'festival', icon: '🪁' },
      '2024-01-22': { name: 'Ram Mandir Prana Pratishtha',  type: 'national', icon: '🛕' },
      '2024-02-14': { name: 'Maha Shivratri',               type: 'festival', icon: '🛕' },
      '2024-03-25': { name: 'Holi',                         type: 'festival', icon: '🎨' },
      '2024-03-29': { name: 'Good Friday',                  type: 'festival', icon: '✝️' },
      '2024-04-09': { name: 'Ram Navami',                   type: 'festival', icon: '🛕' },
      '2024-04-14': { name: 'Mahavir Jayanti',              type: 'festival', icon: '☮️' },
      '2024-04-17': { name: 'Eid ul-Fitr',                  type: 'festival', icon: '🕌' },
      '2024-05-23': { name: 'Buddha Purnima',               type: 'festival', icon: '☸️' },
      '2024-06-17': { name: 'Eid ul-Adha',                  type: 'festival', icon: '🕌' },
      '2024-07-17': { name: 'Muharram',                     type: 'festival', icon: '🕌' },
      '2024-08-19': { name: 'Janmashtami',                  type: 'festival', icon: '🪗' },
      '2024-09-16': { name: 'Milad-un-Nabi',                type: 'festival', icon: '🕌' },
      '2024-10-12': { name: 'Dussehra',                     type: 'festival', icon: '🏹' },
      '2024-11-01': { name: 'Diwali',                       type: 'festival', icon: '🪔' },
      '2024-11-02': { name: 'Govardhan Puja',               type: 'festival', icon: '🪔' },
      '2024-11-15': { name: 'Guru Nanak Jayanti',           type: 'festival', icon: '🙏' },
    },
    2025: {
      '2025-01-14': { name: 'Makar Sankranti',   type: 'festival', icon: '🪁' },
      '2025-02-26': { name: 'Maha Shivratri',    type: 'festival', icon: '🛕' },
      '2025-03-14': { name: 'Holi',              type: 'festival', icon: '🎨' },
      '2025-03-31': { name: 'Eid ul-Fitr',       type: 'festival', icon: '🕌' },
      '2025-04-06': { name: 'Ram Navami',        type: 'festival', icon: '🛕' },
      '2025-04-10': { name: 'Mahavir Jayanti',   type: 'festival', icon: '☮️' },
      '2025-04-18': { name: 'Good Friday',       type: 'festival', icon: '✝️' },
      '2025-05-12': { name: 'Buddha Purnima',    type: 'festival', icon: '☸️' },
      '2025-06-07': { name: 'Eid ul-Adha',       type: 'festival', icon: '🕌' },
      '2025-07-06': { name: 'Muharram',          type: 'festival', icon: '🕌' },
      '2025-08-16': { name: 'Janmashtami',       type: 'festival', icon: '🪗' },
      '2025-09-05': { name: 'Milad-un-Nabi',     type: 'festival', icon: '🕌' },
      '2025-10-02': { name: 'Gandhi Jayanti',    type: 'national', icon: '🕊️' },
      '2025-10-20': { name: 'Diwali',            type: 'festival', icon: '🪔' },
      '2025-10-21': { name: 'Govardhan Puja',    type: 'festival', icon: '🪔' },
      '2025-10-23': { name: 'Dussehra',          type: 'festival', icon: '🏹' },
      '2025-11-05': { name: 'Guru Nanak Jayanti',type: 'festival', icon: '🙏' },
    },
    2026: {
      '2026-01-14': { name: 'Makar Sankranti',   type: 'festival', icon: '🪁' },
      '2026-02-15': { name: 'Maha Shivratri',    type: 'festival', icon: '🛕' },
      '2026-03-20': { name: 'Eid ul-Fitr',       type: 'festival', icon: '🕌' },
      '2026-03-21': { name: 'Holi',              type: 'festival', icon: '🎨' },
      '2026-03-27': { name: 'Ram Navami',        type: 'festival', icon: '🛕' },
      '2026-04-03': { name: 'Good Friday',       type: 'festival', icon: '✝️' },
      '2026-04-28': { name: 'Mahavir Jayanti',   type: 'festival', icon: '☮️' },
      '2026-05-27': { name: 'Eid ul-Adha',       type: 'festival', icon: '🕌' },
      '2026-05-31': { name: 'Buddha Purnima',    type: 'festival', icon: '☸️' },
      '2026-06-26': { name: 'Muharram',          type: 'festival', icon: '🕌' },
      '2026-08-05': { name: 'Janmashtami',       type: 'festival', icon: '🪗' },
      '2026-08-25': { name: 'Milad-un-Nabi',     type: 'festival', icon: '🕌' },
      '2026-10-08': { name: 'Diwali',            type: 'festival', icon: '🪔' },
      '2026-10-09': { name: 'Govardhan Puja',    type: 'festival', icon: '🪔' },
      '2026-10-25': { name: 'Guru Nanak Jayanti',type: 'festival', icon: '🙏' },
    },
  };

  return { ...fixed, ...(floating[year] || {}) };
}

// ── Company-specific overrides ─────────────────────────────
const COMPANY_HOLIDAYS = {
  // '2025-07-04': { name: 'Company Foundation Day', type: 'company', icon: '🏢' },
};

// ── In-memory cache ────────────────────────────────────────
const holidayCache = {};

// ── Status config ──────────────────────────────────────────
const STATUS_CONFIG = {
  Present:          { color: '#10b981', bg: '#d1fae5', label: 'P',   short: 'Present'       },
  Absent:           { color: '#ef4444', bg: '#fee2e2', label: 'A',   short: 'Absent'        },
  'Half Day':       { color: '#f59e0b', bg: '#fef3c7', label: 'H',   short: 'Half Day'      },
  Late:             { color: '#f59e0b', bg: '#fef3c7', label: 'L',   short: 'Late'          },
  'On Leave':       { color: '#6366f1', bg: '#ede9fe', label: 'OL',  short: 'Leave'         },
  Holiday:          { color: '#0ea5e9', bg: '#e0f2fe', label: 'HO',  short: 'Holiday'       },
  'Work From Home': { color: '#22d3ee', bg: '#cffafe', label: 'WFH', short: 'Work From Home'},
};

const HOLIDAY_TYPE_STYLE = {
  national: { color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd', label: 'National' },
  festival: { color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', label: 'Festival' },
  company:  { color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc', label: 'Company'  },
};

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Utilities ──────────────────────────────────────────────
function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function isSunday(d)   { return d.getDay() === 0; }
function isSaturday(d) { return d.getDay() === 6; }
function getDaysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

function isWeekend(d, satOff) {
  return d.getDay() === 0 || (d.getDay() === 6 && satOff);
}

function getWorkingDays(year, month, holidays, satOff) {
  const total = getDaysInMonth(year, month);
  let count = 0;
  for (let d = 1; d <= total; d++) {
    const obj = new Date(year, month - 1, d);
    if (!isWeekend(obj, satOff) && !holidays[toDateKey(obj)]) count++;
  }
  return count;
}

// ── Fetch holidays (local data + backend enrichment) ───────
async function fetchHolidaysForYear(year) {
  const key = String(year);
  if (holidayCache[key]) return holidayCache[key];

  const map = { ...COMPANY_HOLIDAYS, ...getIndianHolidays(year) };

  try {
    const res = await fetch(`/api/holidays?year=${year}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.holidays?.length) {
        data.holidays.forEach(h => {
          const type = (h.primary_type || h.type || '').toLowerCase();
          if (type.includes('national') || type.includes('religious') || type.includes('observance')) {
            const dk = h.date.iso.substring(0, 10);
            if (!map[dk]) {
              map[dk] = {
                name: h.name,
                type: type.includes('national') ? 'national' : 'festival',
                icon: '📅',
              };
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Backend holiday fetch failed, using local data:', err);
  }

  holidayCache[key] = map;
  return map;
}

// ── Sub-components ─────────────────────────────────────────
function HolidayChip({ holiday }) {
  if (!holiday) return null;
  const s = HOLIDAY_TYPE_STYLE[holiday.type] || HOLIDAY_TYPE_STYLE.festival;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '8px', fontWeight: 700,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: '4px', padding: '1px 4px',
      letterSpacing: '0.03em', textTransform: 'uppercase',
    }}>
      {holiday.icon} {s.label}
    </span>
  );
}

function StatCard({ label, value, color, sub, highlight }) {
  return (
    <div style={{
      background: highlight ? `${color}11` : 'var(--color-background-secondary)',
      borderRadius: '12px', padding: '14px 12px',
      border: highlight ? `1.5px solid ${color}44` : '0.5px solid var(--color-border-tertiary)',
    }}>
      <div style={{ fontSize: '24px', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.5px' }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '5px', fontWeight: 500 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AttendanceDetail({ employee, onClose }) {
  const now = new Date();
  const [month, setMonth]                     = useState(now.getMonth() + 1);
  const [year,  setYear]                      = useState(now.getFullYear());
  const [records, setRecords]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedDay, setSelectedDay]         = useState(null);
  const [allHolidays, setAllHolidays]         = useState(() => ({
    ...COMPANY_HOLIDAYS, ...getIndianHolidays(now.getFullYear()),
  }));
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [satOff, setSatOff]                   = useState(false);
  const [activeTab, setActiveTab]             = useState('calendar');

  // Load holidays
  useEffect(() => {
    setHolidaysLoading(true);
    fetchHolidaysForYear(year)
      .then(map => setAllHolidays(map))
      .finally(() => setHolidaysLoading(false));
  }, [year]);

  // Load records
  useEffect(() => {
    if (!employee?._id) return;
    setLoading(true);
    api.get(`/attendance/summary/${employee._id}`, { params: { month, year } })
      .then(r => setRecords(r.data.records || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [employee, month, year]);

  const attendanceMap = useMemo(() => {
    const map = {};
    records.forEach(r => { if (r.date) map[toDateKey(new Date(r.date))] = r; });
    return map;
  }, [records]);

  const daysInMonth    = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const workingDays    = getWorkingDays(year, month, allHolidays, satOff);
  const today          = toDateKey(new Date());

  const stats = useMemo(() => ({
    present:    records.filter(r => r.status === 'Present').length,
    absent:     records.filter(r => r.status === 'Absent').length,
    leave:      records.filter(r => r.status === 'On Leave').length,
    halfDay:    records.filter(r => r.status === 'Half Day').length,
    late:       records.filter(r => r.status === 'Late').length,
    wfh:        records.filter(r => r.status === 'Work From Home').length,
    totalHours: records.reduce((s, r) => s + (r.workHours || 0), 0),
  }), [records]);

  const effectiveDays = stats.present + stats.wfh + stats.late + stats.halfDay * 0.5;
  const attendancePct = workingDays > 0 ? Math.round((effectiveDays / workingDays) * 100) : 0;
  const pctColor      = attendancePct >= 85 ? '#10b981' : attendancePct >= 75 ? '#f59e0b' : '#ef4444';

  // Calendar cells
  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push({ empty: true, key: `e${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const obj     = new Date(year, month - 1, d);
      const dk      = toDateKey(obj);
      const record  = attendanceMap[dk];
      const sun     = isSunday(obj);
      const sat     = isSaturday(obj);
      const satHol  = sat && satOff;
      const satWork = sat && !satOff;
      const holiday = allHolidays[dk] || null;
      const isToday = dk === today;
      const future  = obj > new Date();
      cells.push({ d, dk, obj, record, sun, sat, satHol, satWork, holiday, isToday, future, key: dk });
    }
    return cells;
  }, [year, month, daysInMonth, firstDayOfWeek, attendanceMap, allHolidays, satOff, today]);

  // Holidays this month for the holidays tab
  const monthHolidays = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2,'0')}`;
    return Object.entries(allHolidays)
      .filter(([dk]) => dk.startsWith(prefix))
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([dk, h]) => ({ dk, ...h }));
  }, [allHolidays, year, month]);

  // Cell coloring
  function getCellBg(cell) {
    if (cell.holiday) {
      const s = HOLIDAY_TYPE_STYLE[cell.holiday.type] || HOLIDAY_TYPE_STYLE.festival;
      return { bg: s.bg, color: s.color };
    }
    if (cell.sun)    return { bg: '#fff1f0', color: '#cf1322' };
    if (cell.satHol) return { bg: '#fff2f0', color: '#f43f5e' };
    if (cell.satWork) {
      if (cell.record) {
        const cfg = STATUS_CONFIG[cell.record.status] || {};
        return { bg: cfg.bg, color: cfg.color, satBorder: true };
      }
      if (cell.future) return { bg: '#f0f9ff', color: '#7dd3fc', satBorder: true };
      return { bg: '#fef2f2', color: '#ef4444', satBorder: true };
    }
    if (cell.record) {
      const cfg = STATUS_CONFIG[cell.record.status] || {};
      return { bg: cfg.bg || '#f3f4f6', color: cfg.color || '#374151' };
    }
    if (cell.future) return { bg: 'var(--color-background-primary)', color: 'var(--color-text-tertiary)' };
    return { bg: '#fef2f2', color: '#ef4444' };
  }

  function getCellBadge(cell) {
    if (cell.holiday)  return null;
    if (cell.sun)      return { text: 'OFF', color: '#cf1322' };
    if (cell.satHol)   return { text: 'OFF', color: '#f43f5e' };
    if (cell.satWork) {
      if (cell.record)  return { text: STATUS_CONFIG[cell.record.status]?.label || '?', color: STATUS_CONFIG[cell.record.status]?.color };
      if (!cell.future) return { text: '?', color: '#ef4444' };
      return null;
    }
    if (cell.record)   return { text: STATUS_CONFIG[cell.record.status]?.label || '?', color: STATUS_CONFIG[cell.record.status]?.color };
    if (!cell.future)  return { text: '?', color: '#ef4444' };
    return null;
  }

  function getDayHeaderStyle(day) {
    if (day === 'Sun') return { color: '#cf1322', fontWeight: 700 };
    if (day === 'Sat') return satOff
      ? { color: '#f43f5e', fontWeight: 700 }
      : { color: '#1d4ed8', fontWeight: 700 };
    return { color: 'var(--color-text-secondary)', fontWeight: 600 };
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1);
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{
        maxWidth: '900px', width: '100%',
        maxHeight: '94vh', overflowY: 'auto',
        borderRadius: '16px',
      }}>

        {/* ── HEADER ───────────────────────────────────── */}
        <div className="modal-header" style={{ padding: '16px 20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 46, height: 46, borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '16px', color: '#fff',
              boxShadow: '0 2px 8px #6366f144',
            }}>
              {employee?.firstName?.[0]}{employee?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>
                {employee?.firstName} {employee?.lastName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                {employee?.employeeId} · {employee?.department?.name || 'No Department'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <button onClick={prevMonth} className="btn btn-secondary btn-sm">‹</button>
            <div style={{
              fontWeight: 700, fontSize: '14px',
              minWidth: '130px', textAlign: 'center',
              background: 'var(--color-background-secondary)',
              padding: '6px 12px', borderRadius: '8px',
              border: '0.5px solid var(--color-border-tertiary)',
            }}>
              {MONTHS[month - 1]} {year}
              {holidaysLoading && (
                <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', display: 'block', fontWeight: 400 }}>
                  Syncing holidays…
                </span>
              )}
            </div>
            <button onClick={nextMonth} className="btn btn-secondary btn-sm">›</button>
            <button onClick={onClose} className="modal-close" style={{ marginLeft: '4px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── POLICY BAR ───────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
          padding: '10px 20px',
          background: 'var(--color-background-secondary)',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          borderTop: '0.5px solid var(--color-border-tertiary)',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Saturday Policy:
          </span>
          {[
            { val: false, icon: '💼', label: 'Working', activeBg: '#dbeafe', ac: '#1d4ed8', ab: '#93c5fd' },
            { val: true,  icon: '🏖️', label: 'Holiday', activeBg: '#ffe4e6', ac: '#be123c', ab: '#fda4af' },
          ].map(opt => (
            <button
              key={String(opt.val)}
              onClick={() => setSatOff(opt.val)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 14px', borderRadius: '20px', fontSize: '12px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
                border: `1.5px solid ${satOff === opt.val ? opt.ab : 'var(--color-border-tertiary)'}`,
                background: satOff === opt.val ? opt.activeBg : 'transparent',
                color: satOff === opt.val ? opt.ac : 'var(--color-text-secondary)',
              }}
            >
              {opt.icon} Saturday {opt.label}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700,
              padding: '4px 12px', borderRadius: '20px',
              background: '#f0fdf4', color: '#15803d',
              border: '1px solid #bbf7d0',
            }}>
              📅 {workingDays} working days
            </span>
            {monthHolidays.length > 0 && (
              <span
                onClick={() => setActiveTab(t => t === 'holidays' ? 'calendar' : 'holidays')}
                style={{
                  fontSize: '11px', fontWeight: 700,
                  padding: '4px 12px', borderRadius: '20px',
                  background: '#ede9fe', color: '#7c3aed',
                  border: '1px solid #c4b5fd', cursor: 'pointer',
                }}
              >
                🎉 {monthHolidays.length} holiday{monthHolidays.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* ── TABS ─────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          padding: '0 20px',
        }}>
          {[
            { id: 'calendar', label: '📅 Calendar' },
            { id: 'holidays', label: `🎉 Holidays (${monthHolidays.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px', fontSize: '12px', fontWeight: 600,
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
                color: activeTab === tab.id ? '#6366f1' : 'var(--color-text-secondary)',
                marginBottom: '-0.5px', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BODY ─────────────────────────────────────── */}
        <div className="modal-body" style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div className="spinner" />
            </div>
          ) : (
            <>
              {/* STAT CARDS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '10px', marginBottom: '20px',
              }}>
                <StatCard label="Working Days" value={workingDays}       color="#6b7280" sub={satOff ? 'Mon–Fri only' : 'Mon–Sat'} />
                <StatCard label="Present"      value={stats.present}     color="#10b981" />
                <StatCard label="Absent"       value={stats.absent}      color="#ef4444" />
                <StatCard label="On Leave"     value={stats.leave}       color="#6366f1" />
                <StatCard label="Half Day"     value={stats.halfDay}     color="#f59e0b" />
                <StatCard label="Late"         value={stats.late}        color="#f59e0b" />
                <StatCard label="WFH"          value={stats.wfh}         color="#22d3ee" />
                <StatCard label="Attendance"   value={`${attendancePct}%`} color={pctColor} sub="of working days" highlight />
              </div>

              {/* PROGRESS BAR */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '12px', marginBottom: '6px',
                }}>
                  <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Attendance Rate</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {attendancePct < 75 && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700,
                        background: '#fef2f2', color: '#ef4444',
                        padding: '2px 8px', borderRadius: '10px',
                        border: '1px solid #fecaca',
                      }}>⚠️ Below minimum</span>
                    )}
                    <span style={{ fontWeight: 700, color: pctColor, fontSize: '14px' }}>{attendancePct}%</span>
                  </div>
                </div>
                <div style={{
                  height: '10px', borderRadius: '5px', overflow: 'hidden',
                  background: 'var(--color-background-secondary)', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', left: '75%', top: 0, bottom: 0,
                    width: '1.5px', background: '#d1d5db', zIndex: 1,
                  }} />
                  <div style={{
                    height: '100%', width: `${attendancePct}%`,
                    background: `linear-gradient(90deg, ${pctColor}99, ${pctColor})`,
                    borderRadius: '5px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '4px',
                }}>
                  <span>0%</span><span style={{ color: '#9ca3af' }}>▲ 75% min</span><span>100%</span>
                </div>
              </div>

              {/* ═══════ CALENDAR TAB ═══════ */}
              {activeTab === 'calendar' && (
                <>
                  <div style={{
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: '14px', overflow: 'hidden',
                    marginBottom: '16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    {/* Day headers */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                      background: 'var(--color-background-secondary)',
                      borderBottom: '0.5px solid var(--color-border-tertiary)',
                    }}>
                      {DAYS.map(day => (
                        <div key={day} style={{
                          textAlign: 'center', padding: '10px 4px 8px',
                          fontSize: '11px', ...getDayHeaderStyle(day),
                        }}>
                          {day}
                          {day === 'Sun' && (
                            <div style={{
                              fontSize: '7px', fontWeight: 700,
                              background: '#fff1f0', color: '#cf1322',
                              borderRadius: '3px', padding: '1px 3px',
                              marginTop: '2px', display: 'inline-block',
                            }}>OFF</div>
                          )}
                          {day === 'Sat' && (
                            <div style={{
                              fontSize: '7px', fontWeight: 700,
                              background: satOff ? '#fff2f0' : '#dbeafe',
                              color: satOff ? '#f43f5e' : '#1d4ed8',
                              borderRadius: '3px', padding: '1px 3px',
                              marginTop: '2px', display: 'inline-block',
                            }}>
                              {satOff ? 'OFF' : 'WORK'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Grid */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '1px', background: 'var(--color-border-tertiary)',
                    }}>
                      {calendarCells.map(cell => {
                        if (cell.empty) return (
                          <div key={cell.key} style={{
                            background: 'var(--color-background-primary)', minHeight: '72px',
                          }} />
                        );

                        const { bg, color, satBorder } = getCellBg(cell);
                        const badge = getCellBadge(cell);

                        return (
                          <div
                            key={cell.key}
                            onClick={() => setSelectedDay(cell)}
                            style={{
                              background: bg || 'var(--color-background-primary)',
                              minHeight: '72px', padding: '6px 5px',
                              cursor: 'pointer', position: 'relative',
                              transition: 'filter 0.15s',
                              borderLeft: satBorder ? '3px solid #3b82f6' : undefined,
                            }}
                            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.92)'}
                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                          >
                            {/* Date + badge row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                fontSize: '12px', fontWeight: cell.isToday ? 700 : 500,
                                color: cell.isToday ? '#fff' : color,
                                background: cell.isToday ? '#6366f1' : 'transparent',
                                borderRadius: '50%', width: 20, height: 20,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: cell.isToday ? '0 0 0 2px #6366f144' : 'none',
                              }}>
                                {cell.d}
                              </span>
                              {badge && (
                                <span style={{ fontSize: '9px', fontWeight: 700, color: badge.color, letterSpacing: '0.02em' }}>
                                  {badge.text}
                                </span>
                              )}
                            </div>

                            {/* Holiday info */}
                            {cell.holiday && (
                              <div style={{ marginTop: '3px' }}>
                                <HolidayChip holiday={cell.holiday} />
                                <div style={{
                                  fontSize: '8.5px', marginTop: '2px', color, lineHeight: 1.25,
                                  fontWeight: 500, overflow: 'hidden', display: '-webkit-box',
                                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                }}>
                                  {cell.holiday.icon} {cell.holiday.name}
                                </div>
                              </div>
                            )}

                            {/* Day type labels */}
                            {!cell.holiday && cell.sun && (
                              <div style={{ fontSize: '8.5px', marginTop: '3px', color: '#cf1322', fontWeight: 600 }}>
                                Sunday Off
                              </div>
                            )}
                            {!cell.holiday && cell.satHol && (
                              <div style={{ fontSize: '8.5px', marginTop: '3px', color: '#f43f5e', fontWeight: 600 }}>
                                Sat Holiday
                              </div>
                            )}
                            {!cell.holiday && cell.satWork && (
                              <div style={{ fontSize: '8.5px', marginTop: '3px', color: '#1d4ed8', fontWeight: 600 }}>
                                Sat Working
                              </div>
                            )}

                            {/* Check-in */}
                            {cell.record?.checkIn && (
                              <div style={{ fontSize: '9px', marginTop: '2px', color, fontFamily: 'monospace', fontWeight: 600 }}>
                                ↑ {new Date(cell.record.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}

                            {/* Work hours */}
                            {cell.record?.workHours > 0 && (
                              <div style={{ fontSize: '8.5px', marginTop: '1px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                                {cell.record.workHours.toFixed(1)}h
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '8px 14px',
                    padding: '12px 14px', borderRadius: '10px',
                    background: 'var(--color-background-secondary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    marginBottom: '16px',
                  }}>
                    {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                      <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '2px', display: 'inline-block', background: cfg.bg, border: `1.5px solid ${cfg.color}` }} />
                        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                          <b>{cfg.label}</b> {status}
                        </span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '2px', display: 'inline-block', background: '#fff1f0', border: '1.5px solid #cf1322' }} />
                      <span style={{ fontSize: '10px', color: '#cf1322', fontWeight: 700 }}>Sunday Off</span>
                    </div>
                    {satOff ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '2px', display: 'inline-block', background: '#fff2f0', border: '1.5px solid #f43f5e' }} />
                        <span style={{ fontSize: '10px', color: '#f43f5e', fontWeight: 700 }}>Saturday Off</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '2px', display: 'inline-block', background: '#eff6ff', border: '1.5px solid #3b82f6', borderLeft: '3px solid #3b82f6' }} />
                        <span style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: 700 }}>Saturday Working</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '2px', display: 'inline-block', background: '#dbeafe', border: '1.5px solid #3b82f6' }} />
                      <span style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: 700 }}>🇮🇳 National Holiday</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '2px', display: 'inline-block', background: '#ede9fe', border: '1.5px solid #7c3aed' }} />
                      <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 700 }}>🎉 Festival Holiday</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '2px', display: 'inline-block', background: '#fef2f2', border: '1.5px solid #ef4444' }} />
                      <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>? Not Marked</span>
                    </div>
                  </div>
                </>
              )}

              {/* ═══════ HOLIDAYS TAB ═══════ */}
              {activeTab === 'holidays' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    Holidays in {MONTHS[month - 1]} {year}
                  </div>
                  {monthHolidays.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                      No holidays this month 🎉
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {monthHolidays.map(h => {
                        const obj     = new Date(h.dk);
                        const dayName = DAYS[obj.getDay()];
                        const ts      = HOLIDAY_TYPE_STYLE[h.type] || HOLIDAY_TYPE_STYLE.festival;
                        return (
                          <div key={h.dk} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '12px 14px', borderRadius: '10px',
                            background: ts.bg, border: `1px solid ${ts.border}`,
                          }}>
                            <div style={{ fontSize: '24px', lineHeight: 1, minWidth: '32px', textAlign: 'center' }}>
                              {h.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '13px', color: ts.color }}>{h.name}</div>
                              <div style={{ fontSize: '11px', color: `${ts.color}99`, marginTop: '2px' }}>
                                {dayName}, {obj.getDate()} {MONTHS[obj.getMonth()]} {year}
                              </div>
                            </div>
                            <HolidayChip holiday={h} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{
                    marginTop: '16px', padding: '12px 14px', borderRadius: '10px',
                    background: 'var(--color-background-secondary)',
                    border: '0.5px solid var(--color-border-tertiary)',
                    fontSize: '12px', color: 'var(--color-text-secondary)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span>Total holidays in {year}:</span>
                    <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                      {Object.keys(allHolidays).filter(dk => dk.startsWith(String(year))).length} days
                    </span>
                  </div>
                </div>
              )}

              {/* MONTHLY SUMMARY */}
              {stats.totalHours > 0 && (
                <div style={{
                  background: 'var(--color-background-secondary)',
                  borderRadius: '12px', padding: '14px',
                  border: '0.5px solid var(--color-border-tertiary)',
                  marginTop: '4px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                    📊 Monthly Summary
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { label: 'Total Hours',  value: `${stats.totalHours.toFixed(1)}h` },
                      { label: 'Avg / Day',    value: stats.present > 0 ? `${(stats.totalHours/stats.present).toFixed(1)}h` : '0h' },
                      { label: 'Total Leaves', value: `${stats.leave} days` },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{s.label}</div>
                        <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '3px' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── DAY DETAIL POPUP ─────────────────────────── */}
      {selectedDay && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setSelectedDay(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '340px', width: '100%', borderRadius: '14px' }}>

            <div className="modal-header" style={{ padding: '14px 16px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>
                  {selectedDay.obj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                {selectedDay.holiday && (
                  <div style={{ marginTop: '4px' }}>
                    <HolidayChip holiday={selectedDay.holiday} />
                  </div>
                )}
              </div>
              <button className="modal-close" onClick={() => setSelectedDay(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body" style={{ padding: '16px' }}>
              {selectedDay.holiday ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '44px', lineHeight: 1, marginBottom: '12px' }}>
                    {selectedDay.holiday.icon}
                  </div>
                  <div style={{
                    fontWeight: 800, fontSize: '15px',
                    color: (HOLIDAY_TYPE_STYLE[selectedDay.holiday.type] || HOLIDAY_TYPE_STYLE.festival).color,
                    marginBottom: '8px',
                  }}>
                    {selectedDay.holiday.name}
                  </div>
                  <HolidayChip holiday={selectedDay.holiday} />
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '10px' }}>
                    This day is not counted in working days
                  </div>
                </div>
              ) : selectedDay.sun ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '44px', marginBottom: '10px' }}>🔴</div>
                  <div style={{ fontWeight: 700, color: '#cf1322', fontSize: '14px' }}>Sunday — Weekly Off</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                    Not counted in working days
                  </div>
                </div>
              ) : selectedDay.satHol ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '44px', marginBottom: '10px' }}>🏖️</div>
                  <div style={{ fontWeight: 700, color: '#f43f5e', fontSize: '14px' }}>Saturday — Weekly Off</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                    Policy: Saturday Holiday is active
                  </div>
                </div>
              ) : selectedDay.satWork && !selectedDay.record ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '44px', marginBottom: '10px' }}>💼</div>
                  <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '14px' }}>Saturday — Working Day</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                    No attendance record found
                  </div>
                </div>
              ) : selectedDay.record ? (
                <div>
                  {(() => {
                    const cfg = STATUS_CONFIG[selectedDay.record.status];
                    return cfg && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: cfg.bg, color: cfg.color,
                        borderRadius: '8px', padding: '6px 12px',
                        fontWeight: 700, fontSize: '13px', marginBottom: '12px',
                        border: `1px solid ${cfg.color}44`,
                      }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                        {selectedDay.record.status}
                      </div>
                    );
                  })()}

                  {[
                    ['Check In',     selectedDay.record.checkIn
                      ? new Date(selectedDay.record.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null],
                    ['Check Out',    selectedDay.record.checkOut
                      ? new Date(selectedDay.record.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null],
                    ['Work Hours',   selectedDay.record.workHours > 0 ? `${selectedDay.record.workHours.toFixed(1)}h` : null],
                    ['Leave Type',   selectedDay.record.leaveType   || null],
                    ['Leave Reason', selectedDay.record.leaveReason || null],
                    ['Notes',        selectedDay.record.notes       || null],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 0', borderBottom: '0.5px solid var(--color-border-tertiary)', fontSize: '13px',
                    }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                    No attendance record for this day
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}













