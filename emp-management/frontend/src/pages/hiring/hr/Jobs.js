
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';
import { fmtDate, fmtMoney, PLATFORMS } from '../../../utils/helpers';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const JOB_STATUSES = ['Draft', 'Active', 'Paused', 'Closed', 'Filled'];

const priorityColor = { Low: 'gray', Medium: 'blue', High: 'amber', Urgent: 'red' };
const statusColor = { Draft: 'gray', Active: 'green', Paused: 'amber', Closed: 'red', Filled: 'teal' };

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');

  const [hrs, setHrs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ NEW — departments state
  const [departments, setDepartments] = useState([]);

  const initForm = {
    title: '', department: '', location: '', jobType: 'Full-time',
    experienceRequired: '', description: '', requirements: [], skills: [],
    benefits: [], openings: 1, priority: 'Medium', status: 'Active',
    applicationDeadline: '', salaryMin: '', salaryMax: '',
    postedBy: ''
  };
  const [form, setForm] = useState(initForm);
  const [platForm, setPlatForm] = useState({ name: '', url: '' });

  // ✅ NEW — fetch departments
  useEffect(() => {
    api.get('/departments')
      .then(r => setDepartments(r.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(user);
      if (user.role === 'super_admin') {
        api.get('/hiring/jobs/hrs').then(r => setHrs(r.data)).catch(console.error);
      }
    } catch {}
  }, []);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterStatus) params.status = filterStatus;
    api.get('/hiring/jobs', { params })
      .then(r => { setJobs(r.data.jobs); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, filterStatus]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setEditJob(null); setForm(initForm); setSkillInput(''); setReqInput(''); setShowModal(true); };

  const openEdit = (j) => {
    setEditJob(j);
    setForm({
      title: j.title, department: j.department, location: j.location,
      jobType: j.jobType, experienceRequired: j.experienceRequired || '',
      description: j.description, requirements: j.requirements || [],
      skills: j.skills || [], benefits: j.benefits || [],
      openings: j.openings, priority: j.priority, status: j.status,
      applicationDeadline: j.applicationDeadline ? j.applicationDeadline.split('T')[0] : '',
      salaryMin: j.salaryRange?.min || '', salaryMax: j.salaryRange?.max || '',
      postedBy: j.postedBy?._id || j.postedBy || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        salaryRange: { min: form.salaryMin ? Number(form.salaryMin) : 0, max: form.salaryMax ? Number(form.salaryMax) : 0 }
      };
      if (!payload.postedBy) delete payload.postedBy;
      if (editJob) { await api.put(`/hiring/jobs/${editJob._id}`, payload); toast.success('Job updated!'); }
      else { await api.post('/hiring/jobs', payload); toast.success('Job posted!'); }
      setShowModal(false); fetchJobs();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleAddPlatform = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/hiring/jobs/${selectedJob._id}/platforms`, { ...platForm, postedDate: new Date() });
      toast.success('Platform added!'); setShowPlatformModal(false); fetchJobs();
    } catch { toast.error('Error adding platform'); }
  };

  const handleRemovePlatform = async (jobId, platId) => {
    try { await api.delete(`/hiring/jobs/${jobId}/platforms/${platId}`); toast.success('Removed'); fetchJobs(); }
    catch { toast.error('Error'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await api.put(`/hiring/jobs/${id}`, { status }); toast.success('Status updated'); fetchJobs(); }
    catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try { await api.delete(`/hiring/jobs/${id}`); toast.success('Job deleted'); fetchJobs(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const addTag = (field, input, setInput) => {
    if (input.trim()) { set(field, [...(form[field] || []), input.trim()]); setInput(''); }
  };
  const removeTag = (field, val) => set(field, form[field].filter(x => x !== val));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Job Postings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{total} jobs</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Post New Job
        </button>
      </div>

      <div className="filter-bar">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: '130px' }}>
          <option value="">All Status</option>
          {JOB_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || filterStatus) && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); }}>Clear</button>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? <div className="loading"><div className="spin" /></div> : jobs.length === 0 ? (
          <div className="card"><div className="empty"><div className="empty-icon">💼</div><p>No jobs yet</p><span>Post your first job opening</span></div></div>
        ) : jobs.map(job => (
          <div key={job._id} className="card" style={{ borderLeft: `3px solid var(--${priorityColor[job.priority] === 'gray' ? 'border' : (job.priority === 'Urgent' ? 'danger' : job.priority === 'High' ? 'accent' : 'primary')})` }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{job.title}</h3>
                  <span className={`badge badge-${statusColor[job.status]}`}>{job.status}</span>
                  <span className={`badge badge-${priorityColor[job.priority]}`}>{job.priority}</span>
                  {job.candidateCount > 0 && <span className="badge badge-blue">{job.candidateCount} candidates</span>}
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <span>🏢 {job.department}</span>
                  <span>📍 {job.location}</span>
                  <span>⏱ {job.jobType}</span>
                  {job.experienceRequired && <span>💼 {job.experienceRequired}</span>}
                  {job.salaryRange?.min > 0 && <span>💰 {fmtMoney(job.salaryRange.min)} – {fmtMoney(job.salaryRange.max)}</span>}
                  <span>👤 {job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                  <span>📅 Posted {fmtDate(job.createdAt)}</span>
                </div>
                {job.skills?.length > 0 && (
                  <div className="skills-wrap">
                    {job.skills.map(s => <span key={s} className="skill-pill">{s}</span>)}
                  </div>
                )}
                {job.platforms?.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Posted on:</span>
                    {job.platforms.map(p => (
                      <span key={p._id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px' }}>
                        {p.name}
                        {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '10px' }}>↗</a>}
                        <button onClick={() => handleRemovePlatform(job._id, p._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: '0 2px' }}>×</button>
                      </span>
                    ))}
                    <button className="btn btn-ghost btn-xs" onClick={() => { setSelectedJob(job); setPlatForm({ name: '', url: '' }); setShowPlatformModal(true); }}>+ Platform</button>
                  </div>
                )}
                {job.platforms?.length === 0 && (
                  <button className="btn btn-ghost btn-xs" style={{ marginTop: '8px' }} onClick={() => { setSelectedJob(job); setPlatForm({ name: '', url: '' }); setShowPlatformModal(true); }}>+ Add Platform</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                <select className="btn btn-ghost btn-sm" style={{ padding: '5px 8px', cursor: 'pointer' }} value={job.status} onChange={e => handleStatusChange(job._id, e.target.value)}>
                  {JOB_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(job)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-xl">
            <div className="modal-hdr">
              <span className="modal-title">{editJob ? 'Edit Job' : 'Post New Job'}</span>
              <button className="close-btn" onClick={() => setShowModal(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="sec-div"><span>Job Details</span></div>
                <div className="form-grid">
                  <div className="fg full"><label>Job Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Senior React Developer" /></div>

                  {/* ✅ UPDATED — Department dropdown from API */}
                  <div className="fg">
                    <label>Department *</label>
                    <select
                      value={form.department}
                      onChange={e => set('department', e.target.value)}
                      required
                    >
                      <option value="">— Select Department —</option>
                      {departments.map(d => (
                        <option key={d._id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="fg"><label>Location *</label><input value={form.location} onChange={e => set('location', e.target.value)} required placeholder="Bangalore / Remote" /></div>
                  <div className="fg"><label>Job Type</label><select value={form.jobType} onChange={e => set('jobType', e.target.value)}>{JOB_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div className="fg"><label>Experience Required</label><input value={form.experienceRequired} onChange={e => set('experienceRequired', e.target.value)} placeholder="2-5 years" /></div>
                  <div className="fg"><label>Openings</label><input type="number" min="1" value={form.openings} onChange={e => set('openings', e.target.value)} /></div>
                  <div className="fg"><label>Priority</label><select value={form.priority} onChange={e => set('priority', e.target.value)}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
                  <div className="fg"><label>Status</label><select value={form.status} onChange={e => set('status', e.target.value)}>{JOB_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                  <div className="fg"><label>Min Salary (₹)</label><input type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} placeholder="1200000" /></div>
                  <div className="fg"><label>Max Salary (₹)</label><input type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} placeholder="2000000" /></div>
                  <div className="fg"><label>Application Deadline</label><input type="date" value={form.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)} /></div>

                  {/* HR Dropdown sirf super_admin ko dikhega */}
                  {currentUser?.role === 'super_admin' && (
                    <div className="fg">
                      <label>
                        Assign to HR
                        {!editJob && <span style={{ color: 'var(--danger)', marginLeft: '3px' }}>*</span>}
                      </label>
                      <select
                        value={form.postedBy}
                        onChange={e => set('postedBy', e.target.value)}
                        required={!editJob}
                      >
                        <option value="">— Select HR —</option>
                        {hrs.map(hr => (
                          <option key={hr._id} value={hr._id}>
                            {hr.name} ({hr.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="fg full"><label>Job Description *</label><textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={4} placeholder="Describe the role, responsibilities..." /></div>
                </div>
                <div className="sec-div"><span>Skills & Requirements</span></div>
                <div className="form-grid">
                  <div className="fg full">
                    <label>Skills</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('skills', skillInput, setSkillInput))} placeholder="Add skill..." />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => addTag('skills', skillInput, setSkillInput)}>Add</button>
                    </div>
                    <div className="skills-wrap" style={{ marginTop: '8px' }}>
                      {form.skills.map(s => <span key={s} className="skill-pill" style={{ display: 'inline-flex', gap: '4px', cursor: 'default' }}>{s} <button type="button" onClick={() => removeTag('skills', s)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button></span>)}
                    </div>
                  </div>
                  <div className="fg full">
                    <label>Requirements</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input value={reqInput} onChange={e => setReqInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('requirements', reqInput, setReqInput))} placeholder="Add requirement..." />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => addTag('requirements', reqInput, setReqInput)}>Add</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {form.requirements.map(r => <span key={r} style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', borderRadius: '5px', padding: '3px 9px', fontSize: '12px', display: 'inline-flex', gap: '4px' }}>{r} <button type="button" onClick={() => removeTag('requirements', r)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button></span>)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editJob ? 'Update Job' : 'Post Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform Modal */}
      {showPlatformModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPlatformModal(false)}>
          <div className="modal modal-sm">
            <div className="modal-hdr">
              <span className="modal-title">Add Job Platform</span>
              <button className="close-btn" onClick={() => setShowPlatformModal(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <form onSubmit={handleAddPlatform}>
              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="fg"><label>Platform *</label>
                    <select value={platForm.name} onChange={e => setPlatForm({ ...platForm, name: e.target.value })} required>
                      <option value="">Select Platform</option>
                      {[...PLATFORMS, 'Internshala', 'AngelList', 'Glassdoor', 'Hirist', 'TimesJobs'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>Job URL</label><input value={platForm.url} onChange={e => setPlatForm({ ...platForm, url: e.target.value })} placeholder="https://linkedin.com/jobs/123" /></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowPlatformModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Platform</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
