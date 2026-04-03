
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

// NOTE: Expects GET /api/holidays?year=YYYY from your backend
// Holiday object: { _id, name, date, type, description, isOptional }

const HOLIDAY_TYPES = {
  'National Holiday':  { color: '#ef4444', bg: '#6c5eca59', icon: '🇮🇳', label: 'National' },
  'Festival':          { color: '#f59e0b', bg: '#f8d44249', icon: '🎉', label: 'Festival' },
  'Regional Holiday':  { color: '#10b981', bg: '#ecfdf5', icon: '🏞️', label: 'Regional' },
  'Company Holiday':   { color: '#6366f1', bg: '#eef2ff', icon: '🏢', label: 'Company' },
  'Optional':          { color: '#8b5cf6', bg: '#f5f3ff', icon: '✨', label: 'Optional' },
};

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const DEMO_HOLIDAYS_2026 = [
  { _id: '1',  name: 'Republic Day',              date: '2026-01-26', type: 'National Holiday', description: 'National celebration of the Constitution of India' },
  { _id: '2',  name: 'Holi',                       date: '2026-03-04', type: 'Festival',         description: 'Festival of Colors' },
  { _id: '3',  name: 'Eid-ul-Fitr (Ramzan Eid)',   date: '2026-03-21', type: 'Festival',         description: 'End of Ramadan (tentative)' },
  { _id: '4',  name: 'Good Friday',                date: '2026-04-03', type: 'National Holiday', description: 'Christian observance' },
  { _id: '5',  name: 'Eid-ul-Adha (Bakrid)',        date: '2026-05-27', type: 'Festival',         description: 'Islamic festival of sacrifice (tentative)' },
  { _id: '6',  name: 'Gandhi Jayanti',             date: '2026-10-02', type: 'National Holiday', description: 'Birthday of Mahatma Gandhi' },
  { _id: '7',  name: 'Independence Day',           date: '2026-08-15', type: 'National Holiday', description: "India's Independence Day" },
  { _id: '8',  name: 'Janmashtami',                date: '2026-09-04', type: 'Festival',         description: 'Birth of Lord Krishna' },
  { _id: '9',  name: 'Durga Puja – Maha Saptami', date: '2026-10-18', type: 'Festival',         description: 'Common Festive – Durga Puja day' },
  { _id: '10', name: 'Durga Puja – Maha Ashtami', date: '2026-10-19', type: 'Festival',         description: 'Common Festive – Durga Puja day' },
  { _id: '11', name: 'Durga Puja – Maha Navami',  date: '2026-10-20', type: 'Festival',         description: 'Common Festive – Durga Puja day' },
  { _id: '12', name: 'Dussehra (Vijayadashami)',   date: '2026-10-21', type: 'National Holiday', description: 'Victory of Good over Evil' },
  { _id: '13', name: 'Diwali (Deepavali)',         date: '2026-11-08', type: 'Festival',         description: 'Festival of Lights' },
  { _id: '14', name: 'Christmas Day',              date: '2026-12-25', type: 'National Holiday', description: 'Christmas Day' },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
const fmt = (dateStr, options) =>
  new Date(dateStr).toLocaleDateString('en-IN', options);

const getDayOfWeek = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'long' });

const isSunday = (dateStr) => new Date(dateStr).getDay() === 0;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EmployeeHolidays() {
  const [holidays, setHolidays]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [year, setYear]           = useState(new Date().getFullYear());
  const [filterType, setFilterType]   = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [view, setView]           = useState('list'); // 'list' | 'calendar'

  useEffect(() => { fetchHolidays(); }, [year]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await api.get('/holidays', { params: { year } });
      setHolidays(res.data || []);
    } catch {
      setHolidays(DEMO_HOLIDAYS_2026);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();

  const filtered = holidays
    .filter(h => !filterType  || h.type === filterType)
    .filter(h => !filterMonth || new Date(h.date).getMonth() === Number(filterMonth))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcoming = filtered.filter(h => new Date(h.date) >= today);
  const past     = filtered.filter(h => new Date(h.date) < today);

  const nextHoliday   = holidays.filter(h => new Date(h.date) >= today).sort((a,b) => new Date(a.date)-new Date(b.date))[0];
  const daysUntilNext = nextHoliday ? Math.ceil((new Date(nextHoliday.date) - today) / 86400000) : null;

  const totalDays     = holidays.length;
  const usedDays      = holidays.filter(h => new Date(h.date) < today).length;
  const remainingDays = holidays.filter(h => new Date(h.date) >= today).length;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth: '1060px' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            📅 Holiday Calendar
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px', margin: '4px 0 0' }}>
            Company &amp; national holidays for {year}
          </p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'var(--color-background-secondary)', borderRadius: '10px', padding: '3px', border: '0.5px solid var(--color-border-tertiary)' }}>
          {['list', 'calendar'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
              background: view === v ? 'var(--color-background-primary)' : 'transparent',
              color: view === v ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}>
              {v === 'list' ? '☰ List' : '▦ Month'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Next Holiday Banner ── */}
      {nextHoliday && (
        <div style={{
          marginBottom: '20px', borderRadius: '16px', overflow: 'hidden',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: '#fff', boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
        }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                ⏳ Next Upcoming Holiday
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.5px' }}>
                {HOLIDAY_TYPES[nextHoliday.type]?.icon || '🎉'} {nextHoliday.name}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>
                {getDayOfWeek(nextHoliday.date)} · {fmt(nextHoliday.date, { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {nextHoliday.description && (
                <div style={{ fontSize: '12px', opacity: 0.6 }}>{nextHoliday.description}</div>
              )}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                marginTop: '10px', padding: '4px 12px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.12)', fontSize: '11px', fontWeight: 600,
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                {HOLIDAY_TYPES[nextHoliday.type]?.label || nextHoliday.type}
              </div>
            </div>

            {/* Countdown */}
            <div style={{
              textAlign: 'center', minWidth: '110px',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
              borderRadius: '14px', padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: '44px', fontWeight: 900, lineHeight: 1, letterSpacing: '-2px' }}>{daysUntilNext}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {daysUntilNext === 1 ? 'day away' : 'days away'}
              </div>
            </div>
          </div>

          {/* Type legend strip */}
          <div style={{
            display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 24px', flexWrap: 'wrap', gap: '16px',
          }}>
            {Object.entries(HOLIDAY_TYPES).map(([type, info]) => {
              const count = holidays.filter(h => h.type === type).length;
              if (!count) return null;
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', opacity: 0.7 }}>
                  <span>{info.icon}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                  <span>{info.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Holidays', value: totalDays,     color: '#6366f1', bg: '#eef2ff', icon: '📅', sub: `in ${year}` },
          { label: 'Already Passed', value: usedDays,      color: '#94a3b8', bg: '#f8fafc', icon: '✔️', sub: 'holidays gone' },
          { label: 'Remaining',      value: remainingDays, color: '#10b981', bg: '#ecfdf5', icon: '🎉', sub: 'yet to come' },
        ].map(s => (
          <div key={s.label} className="card" style={{
            padding: '16px 18px', borderRadius: '14px',
            background: s.bg, border: `1px solid ${s.color}22`,
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: `${s.color}18`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px', flexShrink: 0,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px', fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{
        display: 'flex', gap: '10px', marginBottom: '20px',
        flexWrap: 'wrap', alignItems: 'center',
        padding: '12px 16px', borderRadius: '12px',
        background: 'var(--color-background-secondary)',
        border: '0.5px solid var(--color-border-tertiary)',
      }}>
        {/* Year nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-background-primary)', borderRadius: '8px', padding: '4px 6px', border: '0.5px solid var(--color-border-tertiary)' }}>
          <button onClick={() => setYear(y => y-1)} style={btnStyle}>‹</button>
          <span style={{ fontWeight: 700, fontSize: '14px', minWidth: '46px', textAlign: 'center' }}>{year}</span>
          <button onClick={() => setYear(y => y+1)} style={btnStyle}>›</button>
        </div>

        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={selectStyle}>
          <option value="">All Months</option>
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>

        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
          <option value="">All Types</option>
          {Object.keys(HOLIDAY_TYPES).map(t => <option key={t}>{t}</option>)}
        </select>

        {(filterType || filterMonth) && (
          <button onClick={() => { setFilterType(''); setFilterMonth(''); }} style={{
            padding: '7px 14px', borderRadius: '8px', border: 'none',
            background: '#ef444415', color: '#ef4444', fontWeight: 700,
            fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            ✕ Clear
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
          {filtered.length} holiday{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div className="spinner" style={{ margin: 'auto' }} />
        </div>
      ) : view === 'calendar' ? (
        <CalendarView holidays={filtered} year={year} filterMonth={filterMonth} />
      ) : (
        <>
          {upcoming.length > 0 && (
            <Section title="Upcoming Holidays" count={upcoming.length} dotColor="#10b981">
              {upcoming.map((h, i) => <HolidayRow key={h._id} holiday={h} upcoming index={i} />)}
            </Section>
          )}

          {past.length > 0 && (
            <Section title="Past Holidays" count={past.length} dotColor="#94a3b8" style={{ marginTop: '16px' }}>
              {[...past].reverse().map((h, i) => <HolidayRow key={h._id} holiday={h} index={i} />)}
            </Section>
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--color-text-tertiary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>No holidays found</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Try changing the filters above</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────
function Section({ title, count, dotColor, children, style }) {
  return (
    <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', ...style }}>
      <div style={{
        padding: '14px 18px 12px', display: 'flex', alignItems: 'center', gap: '8px',
        borderBottom: '1px solid var(--color-border-tertiary)',
        background: 'var(--color-background-secondary)',
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '13px' }}>{title}</span>
        <span style={{
          marginLeft: '4px', padding: '2px 8px', borderRadius: '20px',
          background: `${dotColor}18`, color: dotColor, fontSize: '11px', fontWeight: 700,
        }}>{count}</span>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Holiday Row ──────────────────────────────────────────────────────────────
function HolidayRow({ holiday, upcoming, index }) {
  const typeInfo = HOLIDAY_TYPES[holiday.type] || { color: '#6366f1', bg: '#eef2ff', icon: '📅', label: 'Other' };
  const dateObj  = new Date(holiday.date);
  const sun      = isSunday(holiday.date);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '10px 12px', borderRadius: '12px',
      background: upcoming ? typeInfo.bg : 'transparent',
      border: `1px solid ${upcoming ? typeInfo.color + '28' : 'var(--color-border-tertiary)'}`,
      opacity: upcoming ? 1 : 0.6,
      transition: 'all 0.15s',
    }}>
      {/* Date chip */}
      <div style={{
        width: 48, height: 52, borderRadius: '10px', flexShrink: 0,
        background: upcoming ? typeInfo.color : '#94a3b8',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: '#fff', boxShadow: upcoming ? `0 4px 12px ${typeInfo.color}40` : 'none',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 900, lineHeight: 1 }}>{dateObj.getDate()}</div>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.85 }}>
          {fmt(holiday.date, { month: 'short' })}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '16px' }}>{typeInfo.icon}</span>
          <span style={{ fontWeight: 700, fontSize: '14px' }}>{holiday.name}</span>
          {sun && (
            <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', fontWeight: 700 }}>
              Sunday
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>{getDayOfWeek(holiday.date)}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{fmt(holiday.date, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
        {holiday.description && (
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px', opacity: 0.8 }}>
            {holiday.description}
          </div>
        )}
      </div>

      {/* Badge */}
      <div style={{
        padding: '5px 11px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
        background: `${typeInfo.color}15`, color: typeInfo.color,
        border: `1px solid ${typeInfo.color}35`, whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {typeInfo.icon} {typeInfo.label}
      </div>
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ holidays, year, filterMonth }) {
  const monthsToShow = filterMonth !== '' ? [Number(filterMonth)] : MONTHS.map((_, i) => i);
  const holidayMap   = {};
  holidays.forEach(h => { holidayMap[h.date] = h; });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
      {monthsToShow.map(mi => <MonthGrid key={mi} year={year} month={mi} holidayMap={holidayMap} />)}
    </div>
  );
}

function MonthGrid({ year, month, holidayMap }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card" style={{ borderRadius: '14px', overflow: 'hidden', padding: 0 }}>
      <div style={{
        padding: '12px 14px', fontWeight: 700, fontSize: '13px',
        background: 'var(--color-background-secondary)',
        borderBottom: '1px solid var(--color-border-tertiary)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>{MONTHS[month]}</span>
        <span style={{ fontWeight: 400, fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{year}</span>
      </div>
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--color-text-tertiary)', padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} />;
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const holiday = holidayMap[dateStr];
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const typeInfo = holiday ? (HOLIDAY_TYPES[holiday.type] || { color: '#6366f1' }) : null;

            return (
              <div key={day} title={holiday?.name || ''} style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', fontSize: '11px', fontWeight: holiday ? 700 : 400, position: 'relative',
                background: holiday ? typeInfo.color : isToday ? 'var(--color-background-secondary)' : 'transparent',
                color: holiday ? '#fff' : isToday ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                border: isToday && !holiday ? '1.5px solid var(--color-border-secondary)' : 'none',
                cursor: holiday ? 'default' : 'default',
                boxShadow: holiday ? `0 2px 8px ${typeInfo.color}40` : 'none',
              }}>
                {day}
              </div>
            );
          })}
        </div>

        {/* Legend for this month */}
        {Object.values(holidayMap).filter(h => new Date(h.date).getMonth() === month && new Date(h.date).getFullYear() === year).length > 0 && (
          <div style={{ marginTop: '10px', borderTop: '1px solid var(--color-border-tertiary)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Object.values(holidayMap)
              .filter(h => new Date(h.date).getMonth() === month && new Date(h.date).getFullYear() === year)
              .sort((a,b) => new Date(a.date)-new Date(b.date))
              .map(h => {
                const ti = HOLIDAY_TYPES[h.type] || { color: '#6366f1', icon: '📅' };
                return (
                  <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ti.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{new Date(h.date).getDate()}</span>
                    <span style={{ color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared Micro Styles ──────────────────────────────────────────────────────
const btnStyle = {
  padding: '5px 10px', borderRadius: '6px', border: 'none',
  background: 'transparent', cursor: 'pointer', fontSize: '16px',
  color: 'var(--color-text-secondary)', fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const selectStyle = {
  padding: '7px 12px', borderRadius: '8px',
  border: '0.5px solid var(--color-border-tertiary)',
  background: 'var(--color-background-primary)',
  fontSize: '12px', cursor: 'pointer', fontWeight: 500,
  color: 'var(--color-text-primary)',
};