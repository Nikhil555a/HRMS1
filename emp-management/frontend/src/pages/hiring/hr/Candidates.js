import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { stageColor, platformColor, fmtDate, STAGES, PLATFORMS, initials, avColor } from '../../../utils/helpers';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const navigate = useNavigate();

  const initForm = { name: '', email: '', phone: '', alternatePhone: '', currentLocation: '', currentCompany: '', currentDesignation: '', totalExperience: '', relevantExperience: '', currentCTC: '', expectedCTC: '', noticePeriod: '', skills: [], job: '', stage: 'Applied', notes: '', 'source.platform': 'LinkedIn', 'source.platformUrl': '', 'source.referredBy': '' };
  const [form, setForm] = useState(initForm);
  const [resume, setResume] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (search) params.search = search;
    if (filterStage) params.stage = filterStage;
    if (filterPlatform) params.platform = filterPlatform;
    if (filterJob) params.job = filterJob;
    api.get('/hiring/candidates', { params }).then(r => { setCandidates(r.data.candidates); setTotal(r.data.total); setPages(r.data.pages); }).catch(console.error).finally(() => setLoading(false));
  }, [page, search, filterStage, filterPlatform, filterJob]);

  useEffect(() => { fetch(); }, [fetch]);
  useEffect(() => { api.get('/hiring/jobs?limit=100').then(r => setJobs(r.data.jobs || [])); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      const source = { platform: form['source.platform'], platformUrl: form['source.platformUrl'], referredBy: form['source.referredBy'] };
      Object.keys(form).forEach(k => {
        if (k.startsWith('source.')) return;
        if (k === 'skills') fd.append('skills', form.skills.join(','));
        else if (form[k] !== '') fd.append(k, form[k]);
      });
      fd.append('source', JSON.stringify(source));
      if (resume) fd.append('resume', resume);
      await api.post('/hiring/candidates', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Candidate added!'); setShowModal(false); setForm(initForm); setResume(null); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error adding candidate'); }
  };

  const QUICK_STAGES = ['Applied', 'Screening', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Sent', 'Rejected'];
  const stageCounts = QUICK_STAGES.map(s => ({ stage: s, count: candidates.filter(c => c.stage === s).length }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Candidates</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{total} total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(initForm); setResume(null); setSkillInput(''); setShowModal(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Candidate
        </button>
      </div>

      {/* Pipeline bar */}
      <div className="pipeline" style={{ marginBottom: '20px' }}>
        <div className={`pipeline-stage ${filterStage === '' ? 'active' : ''}`} onClick={() => setFilterStage('')}>
          <div className="ps-count">{total}</div><div className="ps-label">All</div>
        </div>
        {QUICK_STAGES.map(s => (
          <div key={s} className={`pipeline-stage ${filterStage === s ? 'active' : ''}`} onClick={() => setFilterStage(filterStage === s ? '' : s)}>
            <div className="ps-count">{candidates.filter(c => c.stage === s).length}</div>
            <div className="ps-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {/* <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, company..." />
        </div> */}
        <select value={filterStage} onChange={e => { setFilterStage(e.target.value); setPage(1); }} style={{ minWidth: '160px' }}>
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterPlatform} onChange={e => { setFilterPlatform(e.target.value); setPage(1); }} style={{ minWidth: '140px' }}>
          <option value="">All Platforms</option>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={filterJob} onChange={e => { setFilterJob(e.target.value); setPage(1); }} style={{ minWidth: '160px' }}>
          <option value="">All Jobs</option>
          {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
        {(search || filterStage || filterPlatform || filterJob) && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStage(''); setFilterPlatform(''); setFilterJob(''); }}>Clear</button>}
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spin" /></div> : (
          <>
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>Candidate</th><th>Applied For</th><th>Source</th><th>Experience</th><th>CTC</th><th>Notice</th><th>Stage</th><th>Added</th></tr></thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c._id} onClick={() => navigate(`/hiring/candidates/${c._id}`)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="av" style={{ background: avColor(c.name), color: 'white', fontSize: '12px', width: 32, height: 32 }}>{initials(c.name)}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '12px' }}>{c.job?.title || '—'}<br /><span style={{ color: 'var(--text-muted)' }}>{c.job?.department}</span></td>
                      <td>{c.source?.platform ? <span className={`badge ${platformColor(c.source.platform)}`}>{c.source.platform}</span> : '—'}</td>
                      <td style={{ fontSize: '12px' }}>{c.totalExperience || '—'}</td>
                      <td style={{ fontSize: '12px' }}>{c.expectedCTC ? `₹${Number(c.expectedCTC).toLocaleString('en-IN')}` : '—'}</td>
                      <td style={{ fontSize: '12px' }}>{c.noticePeriod || '—'}</td>
                      <td><span className={`badge ${stageColor(c.stage)}`}>{c.stage}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fmtDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {candidates.length === 0 && <div className="empty"><div className="empty-icon">👥</div><p>No candidates found</p></div>}
            </div>
            {pages > 1 && (
              <div className="pag">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                <span className="pag-info">Page {page} of {pages}</span>
                <button className="pag-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Candidate Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-xl">
            <div className="modal-hdr">
              <span className="modal-title">Add Candidate</span>
              <button className="close-btn" onClick={() => setShowModal(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="sec-div"><span>Basic Info</span></div>
                <div className="form-grid">
                  <div className="fg"><label>Full Name *</label><input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Arjun Kumar" /></div>
                  <div className="fg"><label>Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                  <div className="fg"><label>Phone *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
                  <div className="fg"><label>Alt Phone</label><input value={form.alternatePhone} onChange={e => set('alternatePhone', e.target.value)} /></div>
                  <div className="fg"><label>Current Location</label><input value={form.currentLocation} onChange={e => set('currentLocation', e.target.value)} placeholder="Bangalore" /></div>
                  <div className="fg"><label>Job Applied For</label>
                    <select value={form.job} onChange={e => set('job', e.target.value)}>
                      <option value="">Select Job</option>
                      {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="sec-div"><span>Professional</span></div>
                <div className="form-grid">
                  <div className="fg"><label>Current Company</label><input value={form.currentCompany} onChange={e => set('currentCompany', e.target.value)} /></div>
                  <div className="fg"><label>Current Designation</label><input value={form.currentDesignation} onChange={e => set('currentDesignation', e.target.value)} /></div>
                  <div className="fg"><label>Total Experience</label><input value={form.totalExperience} onChange={e => set('totalExperience', e.target.value)} placeholder="3 years" /></div>
                  <div className="fg"><label>Relevant Experience</label><input value={form.relevantExperience} onChange={e => set('relevantExperience', e.target.value)} placeholder="2 years" /></div>
                  <div className="fg"><label>Current CTC (₹)</label><input type="number" value={form.currentCTC} onChange={e => set('currentCTC', e.target.value)} /></div>
                  <div className="fg"><label>Expected CTC (₹)</label><input type="number" value={form.expectedCTC} onChange={e => set('expectedCTC', e.target.value)} /></div>
                  <div className="fg"><label>Notice Period</label><input value={form.noticePeriod} onChange={e => set('noticePeriod', e.target.value)} placeholder="30 days" /></div>
                  <div className="fg"><label>Initial Stage</label>
                    <select value={form.stage} onChange={e => set('stage', e.target.value)}>
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="fg full">
                    <label>Skills</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), skillInput.trim() && (set('skills', [...form.skills, skillInput.trim()]), setSkillInput('')))} placeholder="Add skill and press Enter" />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => skillInput.trim() && (set('skills', [...form.skills, skillInput.trim()]), setSkillInput(''))}>Add</button>
                    </div>
                    <div className="skills-wrap" style={{ marginTop: '8px' }}>
                      {form.skills.map(s => <span key={s} className="skill-pill" style={{ display: 'inline-flex', gap: '4px' }}>{s} <button type="button" onClick={() => set('skills', form.skills.filter(x => x !== s))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button></span>)}
                    </div>
                  </div>
                </div>
                <div className="sec-div"><span>Source & Resume</span></div>
                <div className="form-grid">
                  <div className="fg"><label>Platform *</label>
                    <select value={form['source.platform']} onChange={e => set('source.platform', e.target.value)}>
                      {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>Profile URL</label><input value={form['source.platformUrl']} onChange={e => set('source.platformUrl', e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
                  {form['source.platform'] === 'Referral' && <div className="fg"><label>Referred By</label><input value={form['source.referredBy']} onChange={e => set('source.referredBy', e.target.value)} /></div>}
                  <div className="fg full">
                    <label>Resume / CV</label>
                    <div className="upload-zone" onClick={() => document.getElementById('resumeUpload').click()}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <p>{resume ? resume.name : 'Click to upload resume (PDF/DOC)'}</p>
                      <span className="sub">Max 10MB</span>
                    </div>
                    <input id="resumeUpload" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setResume(e.target.files[0])} />
                  </div>
                  <div className="fg full"><label>Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Initial screening notes..." /></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
