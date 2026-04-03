import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/api';

const PERM_LABELS = {
  canPostJobs:          { label: 'Post & Manage Jobs',  icon: '💼' },
  canViewAllCandidates: { label: 'View All Candidates', icon: '👥' },
  canManageDocuments:   { label: 'Manage Documents',    icon: '📂' },
  canSendOffers:        { label: 'Send Offer Letters',  icon: '📨' },
};

const STAGE_COLOR = {
  Applied:                '#6b7280',
  Screening:              '#6b7280',
  Shortlisted:            '#3b82f6',
  'Interview Scheduled':  '#8b5cf6',
  'Interview In Progress':'#f59e0b',
  'Technical Round':      '#f59e0b',
  'HR Round':             '#f59e0b',
  'Final Round':          '#f59e0b',
  Selected:               '#10b981',
  'Offer Sent':           '#0ea5e9',
  'Offer Accepted':       '#10b981',
  'Offer Rejected':       '#ef4444',
  Joined:                 '#10b981',
  Rejected:               '#ef4444',
  'On Hold':              '#f59e0b',
  Withdrawn:              '#6b7280',
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const fmtTime = (d) => d
  ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  : '';

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const AV_COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const avColor = (name = '') => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];

export default function HRProfile() {
  const { user } = useAuth();
  const [profile, setProfile]       = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('overview');
  const [search, setSearch]         = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/auth/me'),
      api.get('/candidates?limit=200'),
    ])
      .then(([pRes, cRes]) => {
        setProfile(pRes.data);
        // candidates array support karo chahe pagination ho ya na ho
        const cList = Array.isArray(cRes.data)
          ? cRes.data
          : (cRes.data?.candidates || []);
        setCandidates(cList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" />
    </div>
  );

  if (!profile) return null;

  // ── Sab interviews candidates ke andar se nikalo ──
  const allInterviews = candidates.flatMap(c =>
    (c.interviews || []).map(iv => ({ ...iv, candidate: c }))
  );

  // ── Stats ──
  const stats = {
    total:      candidates.length,
    active:     candidates.filter(c =>
      !['Rejected', 'Offer Accepted', 'Selected', 'Joined', 'Withdrawn'].includes(c.stage)
    ).length,
    hired:      candidates.filter(c =>
      ['Offer Accepted', 'Selected', 'Joined'].includes(c.stage)
    ).length,
    rejected:   candidates.filter(c => c.stage === 'Rejected').length,
    interviews: allInterviews.length,
    scheduled:  allInterviews.filter(i => i.status === 'Scheduled').length,
    completed:  allInterviews.filter(i => i.status === 'Completed').length,
  };

  const permissions  = profile.permissions || {};
  const activePerms  = Object.entries(PERM_LABELS).filter(([k]) => permissions[k]);

  // ── Pipeline breakdown ──
  const pipeline = candidates.reduce((acc, c) => {
    acc[c.stage] = (acc[c.stage] || 0) + 1;
    return acc;
  }, {});

  // ── Upcoming interviews (next 7 days) ──
  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcoming = allInterviews
    .filter(i => {
      if (i.status !== 'Scheduled') return false;
      const d = new Date(i.scheduledAt || i.date);
      return d > now && d < in7;
    })
    .sort((a, b) => new Date(a.scheduledAt || a.date) - new Date(b.scheduledAt || b.date))
    .slice(0, 5);

  // ── Search filter for candidates tab ──
  const filteredCandidates = candidates.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.jobTitle?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Search filter for interviews tab ──
  const filteredInterviews = allInterviews.filter(i =>
    i.candidate?.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.round?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* ── Profile Header ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
        {/* Banner */}
        <div style={{
          height: '80px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)',
        }} />

        {/* Info row */}
        <div style={{ padding: '0 24px 22px', marginTop: '-34px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '18px',
              background: avColor(profile.name),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '24px', color: '#fff',
              border: '4px solid var(--bg-card)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              flexShrink: 0,
            }}>
              {initials(profile.name)}
            </div>

            <div style={{ flex: 1, paddingBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontWeight: 800, fontSize: '20px', margin: 0 }}>{profile.name}</h2>

                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  background: profile.role === 'super_admin' ? '#6366f115' : '#10b98115',
                  color: profile.role === 'super_admin' ? '#6366f1' : '#10b981',
                  border: `1px solid ${profile.role === 'super_admin' ? '#6366f133' : '#10b98133'}`,
                }}>
                  {profile.role === 'super_admin' ? '👑 Super Admin' : '🧑‍💼 HR Manager'}
                </span>

                {profile.isActive !== false && (
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    background: '#10b98115', color: '#10b981', border: '1px solid #10b98133',
                  }}>● Active</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>✉️ {profile.email}</span>
                {profile.phone && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {profile.phone}</span>
                )}
                {profile.department && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🏢 {profile.department}</span>
                )}
              </div>
            </div>

            <div style={{ paddingBottom: '4px', textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Member since</div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{fmtDate(profile.createdAt)}</div>
              {profile.lastLogin && (
                <>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Last login</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{fmtDate(profile.lastLogin)}</div>
                </>
              )}
            </div>
          </div>

          {/* Permissions chips */}
          {activePerms.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
              {activePerms.map(([k, { label, icon }]) => (
                <span key={k} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                  background: '#6366f115', color: '#6366f1', border: '1px solid #6366f133',
                }}>
                  {icon} {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '12px', marginBottom: '20px',
      }}>
        {[
          { label: 'Total Candidates', value: stats.total,      color: '#6366f1', icon: '👥' },
          { label: 'Active Pipeline',  value: stats.active,     color: '#3b82f6', icon: '🔄' },
          { label: 'Hired',            value: stats.hired,      color: '#10b981', icon: '✅' },
          { label: 'Rejected',         value: stats.rejected,   color: '#ef4444', icon: '❌' },
          { label: 'Total Interviews', value: stats.interviews, color: '#8b5cf6', icon: '📅' },
          { label: 'Scheduled',        value: stats.scheduled,  color: '#f59e0b', icon: '⏰' },
          { label: 'Completed',        value: stats.completed,  color: '#0ea5e9', icon: '🎯' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
        {[
          { id: 'overview',   label: '📊 Overview' },
          { id: 'candidates', label: `👥 Candidates (${stats.total})` },
          { id: 'interviews', label: `📅 Interviews (${stats.interviews})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearch(''); }}
            style={{
              padding: '10px 18px', fontSize: '12px', fontWeight: 600,
              background: 'transparent', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === tab.id ? '#6366f1' : 'var(--text-muted)',
              transition: 'all 0.15s', marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════
          TAB 1 — OVERVIEW
      ════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Candidate Pipeline */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>📊 Candidate Pipeline</div>
            {Object.entries(pipeline).length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '20px 0' }}>
                No candidates yet
              </div>
            ) : Object.entries(pipeline).map(([stage, count]) => (
              <div key={stage} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{stage}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: STAGE_COLOR[stage] || '#6b7280' }}>{count}</span>
                </div>
                <div style={{ height: '5px', borderRadius: '3px', background: 'var(--bg-2)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round((count / candidates.length) * 100)}%`,
                    background: STAGE_COLOR[stage] || '#6b7280',
                    borderRadius: '3px', transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Interview Status + Upcoming */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>📅 Interview Status</div>
            {[
              { label: 'Scheduled', count: stats.scheduled,  color: '#8b5cf6' },
              { label: 'Completed', count: stats.completed,  color: '#10b981' },
              { label: 'Cancelled', count: allInterviews.filter(i => i.status === 'Cancelled').length, color: '#ef4444' },
              { label: 'No Show',   count: allInterviews.filter(i => i.status === 'No Show').length,   color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: '14px', color: s.color }}>{s.count}</span>
              </div>
            ))}

            {/* Upcoming */}
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                ⏰ Upcoming (next 7 days)
              </div>
              {upcoming.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                  No upcoming interviews
                </div>
              ) : upcoming.map((iv, idx) => (
                <div key={idx} style={{
                  padding: '8px 10px', borderRadius: '8px',
                  background: 'var(--bg-2)', marginBottom: '6px',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>{iv.candidate?.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {iv.round || 'Interview'} · {fmtDate(iv.scheduledAt || iv.date)} {fmtTime(iv.scheduledAt || iv.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Card */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>🔐 My Permissions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {Object.entries(PERM_LABELS).map(([key, { label, icon }]) => {
                const granted = !!permissions[key];
                return (
                  <div key={key} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '8px',
                    background: granted ? '#10b98108' : '#ef444408',
                    border: `1px solid ${granted ? '#10b98122' : '#ef444422'}`,
                  }}>
                    <span style={{ fontSize: '16px' }}>{icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 500, flex: 1 }}>{label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: granted ? '#10b981' : '#ef4444' }}>
                      {granted ? '✓' : '✗'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB 2 — CANDIDATES
      ════════════════════════════════════════════ */}
      {activeTab === 'candidates' && (
        <div>
          {/* Search */}
          <div style={{ marginBottom: '14px' }}>
            <input
              placeholder="🔍 Search candidates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text)', fontSize: '13px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredCandidates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {search ? 'No candidates match your search' : 'No candidates assigned yet'}
                </p>
              </div>
            ) : filteredCandidates.map(c => (
              <div key={c._id} className="card" style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '10px',
                  background: avColor(c.name), color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '14px', flexShrink: 0,
                }}>
                  {initials(c.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {c.email}
                    {c.jobTitle && ` · ${c.jobTitle}`}
                    {c.job?.title && ` · ${c.job.title}`}
                  </div>
                </div>

                {/* Interview count badge */}
                {c.interviews?.length > 0 && (
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                    background: '#8b5cf615', color: '#8b5cf6', border: '1px solid #8b5cf633',
                  }}>
                    📅 {c.interviews.length} interview{c.interviews.length > 1 ? 's' : ''}
                  </span>
                )}

                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                  background: `${STAGE_COLOR[c.stage] || '#6b7280'}15`,
                  color: STAGE_COLOR[c.stage] || '#6b7280',
                  border: `1px solid ${STAGE_COLOR[c.stage] || '#6b7280'}33`,
                }}>
                  {c.stage}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'right' }}>
                  {fmtDate(c.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          TAB 3 — INTERVIEWS
      ════════════════════════════════════════════ */}
      {activeTab === 'interviews' && (
        <div>
          {/* Search */}
          <div style={{ marginBottom: '14px' }}>
            <input
              placeholder="🔍 Search by candidate or round..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text)', fontSize: '13px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredInterviews.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {search ? 'No interviews match your search' : 'No interviews scheduled yet'}
                </p>
              </div>
            ) : filteredInterviews.map((iv, idx) => {
              const sc = {
                Scheduled: '#8b5cf6', Completed: '#10b981',
                Cancelled: '#ef4444', 'No Show': '#f59e0b',
              }[iv.status] || '#6b7280';

              return (
                <div key={idx} className="card" style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderLeft: `3px solid ${sc}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{iv.candidate?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {iv.candidate?.job?.title || iv.candidate?.jobTitle || 'N/A'} · {iv.round || 'Interview'}
                      {iv.mode && ` · ${iv.mode}`}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      📅 {fmtDate(iv.scheduledAt || iv.date)} {fmtTime(iv.scheduledAt || iv.date)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      background: `${sc}15`, color: sc, border: `1px solid ${sc}33`,
                    }}>
                      {iv.status}
                    </span>
                    {iv.rating && (
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>
                        {'⭐'.repeat(iv.rating)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
