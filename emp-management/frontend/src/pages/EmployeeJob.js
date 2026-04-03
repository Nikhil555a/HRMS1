
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TYPE_COLOR = {
  'Full-time':  { bg: '#10b98118', color: '#10b981', border: '#10b98133' },
  'Part-time':  { bg: '#6366f118', color: '#6366f1', border: '#6366f133' },
  'Contract':   { bg: '#f59e0b18', color: '#f59e0b', border: '#f59e0b33' },
  'Internship': { bg: '#8b5cf618', color: '#8b5cf6', border: '#8b5cf633' },
  'Remote':     { bg: '#06b6d418', color: '#06b6d4', border: '#06b6d433' },
};

const STAGE_COLOR = {
  'Applied':             { bg: '#6366f118', color: '#6366f1' },
  'Screening':           { bg: '#f59e0b18', color: '#f59e0b' },
  'Interview Scheduled': { bg: '#06b6d418', color: '#06b6d4' },
  'Interviewed':         { bg: '#8b5cf618', color: '#8b5cf6' },
  'Offer Sent':          { bg: '#10b98118', color: '#10b981' },
  'Hired':               { bg: '#10b98130', color: '#10b981' },
  'Rejected':            { bg: '#ef444418', color: '#ef4444' },
};

const PIPELINE = ['Applied', 'Screening', 'Interview Scheduled', 'Interviewed', 'Offer Sent', 'Hired'];

export default function EmployeeJobs() {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState('browse');
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyJob, setApplyJob] = useState(null);

  useEffect(() => {
    api.get('/hiring/jobs', { params: { status: 'Active', limit: 100 } })
      .then(r => {
        const list = r.data.jobs || [];
        setJobs(list);
        if (list.length > 0) setSelectedJob(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeMainTab === 'myapps') {
      setAppsLoading(true);
      api.get('/hiring/candidates/my/applications')
        .then(r => setMyApps(r.data || []))
        .catch(console.error)
        .finally(() => setAppsLoading(false));
    }
  }, [activeMainTab]);

  const filtered = jobs.filter(j => {
    const s = search.toLowerCase();
    return (!search || j.title?.toLowerCase().includes(s) || j.department?.toLowerCase().includes(s) || j.location?.toLowerCase().includes(s))
      && (!filterType || j.jobType === filterType);
  });

  const daysAgo = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 86400000);
    return d === 0 ? 'Today' : d === 1 ? '1 day ago' : `${d} days ago`;
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>Job Openings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Explore open positions and track your applications
        </p>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-2)', padding: '5px', borderRadius: '12px', border: '1px solid var(--border)', width: 'fit-content' }}>
        {[{ key: 'browse', label: `💼 Browse Jobs (${jobs.length})` }, { key: 'myapps', label: '📋 My Applications' }].map(t => (
          <button key={t.key} onClick={() => setActiveMainTab(t.key)} style={{
            padding: '8px 18px', borderRadius: '8px', border: 'none',
            background: activeMainTab === t.key ? '#6366f1' : 'transparent',
            color: activeMainTab === t.key ? '#fff' : 'var(--text-muted)',
            fontWeight: activeMainTab === t.key ? 700 : 500, fontSize: '13px', cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── BROWSE TAB ── */}
      {activeMainTab === 'browse' && (
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, department, location..." style={{ paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ minWidth: '140px' }}>
              <option value="">All Types</option>
              {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => <option key={t}>{t}</option>)}
            </select>
            {(search || filterType) && <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterType(''); }}>Clear</button>}
          </div>

          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💼</div>
              <p style={{ fontWeight: 700 }}>No job openings found</p>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Check back later</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '16px', alignItems: 'start' }}>

              {/* Left list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '4px' }}>
                {filtered.map(job => {
                  const tc = TYPE_COLOR[job.jobType] || TYPE_COLOR['Full-time'];
                  return (
                    <div key={job._id} onClick={() => setSelectedJob(job)} style={{
                      padding: '16px', borderRadius: '12px', cursor: 'pointer',
                      background: 'var(--bg-2)',
                      border: selectedJob?._id === job._id ? '2px solid #6366f1' : '1px solid var(--border)',
                      boxShadow: selectedJob?._id === job._id ? '0 0 0 3px #6366f122' : 'none',
                      transition: 'all 0.15s',
                    }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>💼</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{job.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.department} · {job.location}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>{job.jobType}</span>
                        {job.experienceRequired && <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{job.experienceRequired}</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>{daysAgo(job.createdAt)}</span>
                        {job.salaryRange?.min > 0 && <span style={{ fontWeight: 600, color: '#6366f1' }}>₹{(job.salaryRange.min / 100000).toFixed(1)}L–₹{(job.salaryRange.max / 100000).toFixed(1)}L</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right detail */}
              {selectedJob && (
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', position: 'sticky', top: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>💼</div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px' }}>{selectedJob.title}</h2>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedJob.department} · {selectedJob.location}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Posted {daysAgo(selectedJob.createdAt)}
                        {selectedJob.applicationDeadline && <> · Deadline: {new Date(selectedJob.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {(() => { const t = TYPE_COLOR[selectedJob.jobType] || TYPE_COLOR['Full-time']; return <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: t.bg, color: t.color, border: `1px solid ${t.border}` }}>⏱ {selectedJob.jobType}</span>; })()}
                    {selectedJob.experienceRequired && <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: '#f59e0b11', color: '#f59e0b', border: '1px solid #f59e0b33' }}>💼 {selectedJob.experienceRequired}</span>}
                    {selectedJob.openings > 0 && <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: '#10b98111', color: '#10b981', border: '1px solid #10b98133' }}>👥 {selectedJob.openings} Opening{selectedJob.openings > 1 ? 's' : ''}</span>}
                    {selectedJob.salaryRange?.min > 0 && <span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: '#6366f111', color: '#6366f1', border: '1px solid #6366f133' }}>💰 ₹{(selectedJob.salaryRange.min / 100000).toFixed(1)}L–₹{(selectedJob.salaryRange.max / 100000).toFixed(1)}L/yr</span>}
                  </div>

                  {/* Apply buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {selectedJob.platforms?.filter(p => p.url)?.map(p => (
                      <button key={p._id} onClick={() => window.open(p.url, '_blank')} style={{
                        padding: '11px 20px', borderRadius: '10px', border: 'none',
                        background: p.name?.toLowerCase().includes('linkedin') ? '#0077b5' : p.name?.toLowerCase().includes('naukri') ? '#ff7555' : '#6366f1',
                        color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        Apply on {p.name}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </button>
                    ))}
                    <button onClick={() => { setApplyJob(selectedJob); setShowApplyModal(true); }} style={{
                      padding: '11px 24px', borderRadius: '10px', border: 'none',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
                      boxShadow: '0 4px 14px #6366f144',
                    }}>
                      ✉️ Apply Now
                    </button>
                  </div>

                  <hr style={{ border: 'none', borderTop: '0.5px solid var(--border)', margin: '0 0 20px' }} />

                  <Sec title="About This Role"><p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text-muted)', margin: 0, whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p></Sec>
                  {selectedJob.requirements?.length > 0 && <Sec title="Requirements"><ul style={{ margin: 0, paddingLeft: '18px' }}>{selectedJob.requirements.map((r, i) => <li key={i} style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '4px' }}>{r}</li>)}</ul></Sec>}
                  {selectedJob.skills?.length > 0 && <Sec title="Skills Required"><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{selectedJob.skills.map(s => <span key={s} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: '#6366f111', color: '#6366f1', border: '1px solid #6366f133' }}>{s}</span>)}</div></Sec>}
                  {selectedJob.benefits?.length > 0 && <Sec title="Benefits"><ul style={{ margin: 0, paddingLeft: '18px' }}>{selectedJob.benefits.map((b, i) => <li key={i} style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '4px' }}>✅ {b}</li>)}</ul></Sec>}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── MY APPLICATIONS TAB ── */}
      {activeMainTab === 'myapps' && (
        <div>
          {appsLoading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: 'auto' }} /></div>
          ) : myApps.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontWeight: 700, fontSize: '16px' }}>No applications yet</p>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Apply to jobs and track your status here</span>
              <br />
              <button onClick={() => setActiveMainTab('browse')} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Browse Jobs →</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 4px' }}>{myApps.length} application{myApps.length !== 1 ? 's' : ''} submitted</p>
              {myApps.map(app => {
                const sc = STAGE_COLOR[app.stage] || STAGE_COLOR['Applied'];
                const idx = PIPELINE.indexOf(app.stage);
                const pct = app.stage === 'Rejected' ? 100 : idx >= 0 ? ((idx + 1) / PIPELINE.length) * 100 : 10;
                const barColor = app.stage === 'Rejected' ? '#ef4444' : app.stage === 'Hired' ? '#10b981' : '#6366f1';
                return (
                  <div key={app._id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💼</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px' }}>{app.job?.title || 'Job'}</span>
                          <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: sc.bg, color: sc.color }}>{app.stage}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{app.job?.department} · {app.job?.location} · {app.job?.jobType}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Applied {daysAgo(app.createdAt)} · Source: {app.source}</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                        <span>Applied</span>
                        <span style={{ fontWeight: 600, color: barColor }}>{app.stage === 'Rejected' ? '❌ Rejected' : app.stage === 'Hired' ? '✅ Hired!' : '⏳ In Progress'}</span>
                        <span>Hired</span>
                      </div>
                      <div style={{ height: 6, borderRadius: '10px', background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '10px', background: barColor, width: `${pct}%`, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && applyJob && (
        <ApplyModal job={applyJob} user={user}
          onClose={() => { setShowApplyModal(false); setApplyJob(null); }}
          onSuccess={() => { setShowApplyModal(false); setApplyJob(null); setActiveMainTab('myapps'); }}
        />
      )}
    </div>
  );
}

function Sec({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>{title}</div>
      {children}
    </div>
  );
}

function ApplyModal({ job, user, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', coverLetter: '' });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name',        form.name);
      fd.append('email',       form.email);
      fd.append('phone',       form.phone);
      fd.append('coverLetter', form.coverLetter);
      fd.append('job',         job._id);
      fd.append('source',      'Internal');
      if (resume) fd.append('resume', resume);

      // ✅ Real API call — auth token auto sent via api utility
      await api.post('/hiring/candidates', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>

        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px' }}>Apply for Position</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{job.title} · {job.department}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div style={{ padding: '24px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Application Submitted!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
                Your application for <strong>{job.title}</strong> has been saved in the system. HR will review it soon.
              </p>
              <button onClick={onSuccess} style={{ marginTop: '20px', padding: '12px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                View My Applications →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#ef444418', color: '#ef4444', border: '1px solid #ef444433', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[['name', 'Full Name *', 'text', 'Your full name', true], ['email', 'Email *', 'email', 'your@email.com', true], ['phone', 'Phone *', 'text', '+91 9999999999', true]].map(([f, l, t, ph, req]) => (
                  <div key={f}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>{l}</label>
                    <input type={t} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} required={req} placeholder={ph} style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Resume / CV</label>
                  <div onClick={() => document.getElementById('apply-res').click()} style={{ border: `2px dashed ${resume ? '#10b981' : 'var(--border)'}`, borderRadius: '10px', padding: '18px', textAlign: 'center', cursor: 'pointer', background: resume ? '#10b98108' : 'transparent' }}>
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{resume ? '✅' : '📄'}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: resume ? '#10b981' : 'var(--text-muted)' }}>{resume ? resume.name : 'Click to upload (or we use your profile resume)'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>PDF, DOC, DOCX</div>
                  </div>
                  <input id="apply-res" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setResume(e.target.files[0])} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Cover Letter (optional)</label>
                  <textarea value={form.coverLetter} onChange={e => setForm(p => ({ ...p, coverLetter: e.target.value }))} placeholder="Why are you a great fit?" rows={4} style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, boxShadow: '0 4px 16px #6366f144' }}>
                  {loading ? 'Submitting…' : 'Submit Application →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}