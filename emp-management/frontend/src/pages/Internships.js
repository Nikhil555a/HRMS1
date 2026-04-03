import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const STATUS_COLORS = { Active: 'success', Completed: 'info', Terminated: 'danger', Extended: 'warning' };

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editIntern, setEditIntern] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const initForm = {
    internId: '', firstName: '', lastName: '', email: '', phone: '',
    college: '', degree: '', department: '', mentor: '',
    project: '', stipend: '', startDate: '', endDate: '',
    status: 'Active', skills: [], performance: '', offerLetter: false, notes: ''
  };
  const [form, setForm] = useState(initForm);

  const fetchInternships = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterDept) params.department = filterDept;
    if (search) params.search = search;
    api.get('/internships', { params })
      .then(r => setInternships(r.data))
      .catch(console.error).finally(() => setLoading(false));
  }, [filterStatus, filterDept, search]);

  useEffect(() => { fetchInternships(); }, [fetchInternships]);
  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data));
    api.get('/employees?limit=200').then(r => setEmployees(r.data.employees));
  }, []);

  const openAdd = () => {
    setEditIntern(null);
    setForm(initForm);
    setSkillInput('');
    setShowModal(true);
  };
  const openEdit = (intern) => {
    setEditIntern(intern);
    setForm({
      internId: intern.internId, firstName: intern.firstName, lastName: intern.lastName,
      email: intern.email, phone: intern.phone, college: intern.college || '',
      degree: intern.degree || '', department: intern.department?._id || '',
      mentor: intern.mentor?._id || '', project: intern.project || '',
      stipend: intern.stipend || '', startDate: intern.startDate?.split('T')[0] || '',
      endDate: intern.endDate?.split('T')[0] || '', status: intern.status,
      skills: intern.skills || [], performance: intern.performance || '',
      offerLetter: intern.offerLetter || false, notes: intern.notes || ''
    });
    setShowModal(true);
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      set('skills', [...form.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (k === 'skills') fd.append('skills', form.skills.join(','));
        else if (form[k] !== '' && form[k] !== null) fd.append(k, form[k]);
      });
      if (editIntern) {
        await api.put(`/internships/${editIntern._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Internship updated!');
      } else {
        await api.post('/internships', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Internship added!');
      }
      setShowModal(false); fetchInternships();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/internships/${id}/status`, { status });
      toast.success('Status updated'); fetchInternships();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this internship record?')) return;
    try { await api.delete(`/internships/${id}`); toast.success('Deleted'); fetchInternships(); }
    catch { toast.error('Error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Internships</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{internships.length} internship records</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Internship
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[['Active', 'success', '#10b981'], ['Completed', 'info', '#22d3ee'], ['Extended', 'warning', '#f59e0b'], ['Terminated', 'danger', '#ef4444']].map(([s, , c]) => (
          <div key={s} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}>
            <div>
              <div className="stat-value" style={{ color: c, fontSize: '24px' }}>{internships.filter(i => i.status === s).length}</div>
              <div className="stat-label">{s}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search intern name, ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {['Active', 'Completed', 'Terminated', 'Extended'].map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || filterStatus || filterDept) && <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterDept(''); }}>Clear</button>}
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Intern</th><th>ID</th><th>Department</th><th>Mentor</th><th>Period</th><th>Stipend</th><th>Performance</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {internships.map(intern => (
                  <tr key={intern._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="emp-avatar" style={{ width: 32, height: 32, fontSize: '11px', background: 'var(--accent)', color: '#0f172a' }}>{intern.firstName?.[0]}{intern.lastName?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{intern.firstName} {intern.lastName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{intern.college || intern.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--accent)' }}>{intern.internId}</td>
                    <td style={{ fontSize: '13px' }}>{intern.department?.name || '—'}</td>
                    <td style={{ fontSize: '13px' }}>{intern.mentor ? `${intern.mentor.firstName} ${intern.mentor.lastName}` : '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {intern.startDate ? new Date(intern.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      <br />→ {intern.endDate ? new Date(intern.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ fontSize: '13px' }}>{intern.stipend > 0 ? `₹${Number(intern.stipend).toLocaleString()}` : '—'}</td>
                    <td>{intern.performance ? <span className={`badge badge-${intern.performance === 'Excellent' ? 'success' : intern.performance === 'Good' ? 'info' : intern.performance === 'Average' ? 'warning' : 'danger'}`}>{intern.performance}</span> : '—'}</td>
                    <td>
                      <select value={intern.status} onChange={e => handleStatusChange(intern._id, e.target.value)}
                        className={`badge badge-${STATUS_COLORS[intern.status]}`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {['Active', 'Completed', 'Terminated', 'Extended'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(intern)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(intern._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {internships.length === 0 && <div className="empty-state"><p>No internship records found</p></div>}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">{editIntern ? 'Edit Internship' : 'Add Internship'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="section-divider"><span>Basic Info</span></div>
                <div className="form-grid">
                  <div className="form-group"><label>Intern ID *</label><input value={form.internId} onChange={e => set('internId', e.target.value)} required placeholder="INT001" /></div>
                  <div className="form-group"><label>Department *</label>
                    <select value={form.department} onChange={e => set('department', e.target.value)} required>
                      <option value="">Select</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>First Name *</label><input value={form.firstName} onChange={e => set('firstName', e.target.value)} required /></div>
                  <div className="form-group"><label>Last Name *</label><input value={form.lastName} onChange={e => set('lastName', e.target.value)} required /></div>
                  <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
                  <div className="form-group"><label>Phone *</label><input value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
                  <div className="form-group"><label>College</label><input value={form.college} onChange={e => set('college', e.target.value)} placeholder="IIT / NIT / Other" /></div>
                  <div className="form-group"><label>Degree</label><input value={form.degree} onChange={e => set('degree', e.target.value)} placeholder="B.Tech / MCA" /></div>
                </div>
                <div className="section-divider"><span>Internship Details</span></div>
                <div className="form-grid">
                  <div className="form-group"><label>Mentor</label>
                    <select value={form.mentor} onChange={e => set('mentor', e.target.value)}>
                      <option value="">Select Mentor</option>
                      {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Project</label><input value={form.project} onChange={e => set('project', e.target.value)} placeholder="Project name" /></div>
                  <div className="form-group"><label>Stipend (₹/month)</label><input type="number" value={form.stipend} onChange={e => set('stipend', e.target.value)} /></div>
                  <div className="form-group"><label>Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)}>
                      {['Active', 'Completed', 'Terminated', 'Extended'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Start Date *</label><input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required /></div>
                  <div className="form-group"><label>End Date *</label><input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required /></div>
                  <div className="form-group"><label>Performance</label>
                    <select value={form.performance} onChange={e => set('performance', e.target.value)}>
                      <option value="">Not Rated</option>
                      {['Excellent', 'Good', 'Average', 'Poor'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <label style={{ flexDirection: 'row', gap: '8px', alignItems: 'center', display: 'flex', marginTop: '24px' }}>
                      <input type="checkbox" checked={form.offerLetter} onChange={e => set('offerLetter', e.target.checked)} />
                      Offer Letter Issued
                    </label>
                  </div>
                </div>
                <div className="section-divider"><span>Skills</span></div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add skill and press Enter" style={{ flex: 1 }} />
                    <button type="button" className="btn btn-secondary" onClick={addSkill}>Add</button>
                  </div>
                  <div className="skills-wrap" style={{ marginTop: '10px' }}>
                    {form.skills.map(s => (
                      <span key={s} className="skill-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {s}<button type="button" onClick={() => set('skills', form.skills.filter(x => x !== s))} style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer' }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group full">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editIntern ? 'Update' : 'Add Internship'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
