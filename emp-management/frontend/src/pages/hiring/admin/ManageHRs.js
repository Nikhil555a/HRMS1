
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
// import api from '../utils/api';
import api from "../../../utils/api"
import { fmtDate, avColor, initials } from '../../../utils/helpers';

export default function ManageHRs() {
  const [hrs, setHrs]               = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [editHR, setEditHR]         = useState(null);
  const [pwdHR, setPwdHR]           = useState(null);
  const [newPwd, setNewPwd]         = useState('');
  const [search, setSearch]         = useState('');

  const initForm = {
    name: '', email: '', password: '', phone: '', department: '',
    permissions: {
      canPostJobs: true,
      canViewAllCandidates: false,
      canManageDocuments: true,
      canSendOffers: false,
    },
  };
  const [form, setForm] = useState(initForm);

  const loadHRs = () => {
    setLoading(true);
    api.get('/admin/hrs')
      .then(r => setHrs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadHRs(); }, []);

  const set     = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPerm = (k, v) => setForm(f => ({ ...f, permissions: { ...f.permissions, [k]: v } }));

  const openAdd  = () => { setEditHR(null); setForm(initForm); setShowModal(true); };
  const openEdit = (hr) => {
    setEditHR(hr);
    setForm({
      name: hr.name, email: hr.email, password: '',
      phone: hr.phone || '', department: hr.department || '',
      permissions: hr.permissions || initForm.permissions,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editHR && !payload.password) delete payload.password;
      if (editHR) {
        await api.put(`/admin/hrs/${editHR._id}`, payload);
        toast.success('HR updated successfully!');
      } else {
        await api.post('/admin/hrs', payload);
        toast.success('HR created successfully!');
      }
      setShowModal(false);
      loadHRs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const toggleActive = async (id) => {
    try {
      await api.patch(`/admin/hrs/${id}/toggle`);
      toast.success('HR status updated');
      loadHRs();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const resetPwd = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await api.put(`/admin/hrs/${pwdHR._id}/reset-password`, { newPassword: newPwd });
      toast.success('Password reset successfully!');
      setShowPwdModal(false);
      setNewPwd('');
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const deleteHR = async (id) => {
    if (!window.confirm('Are you sure you want to delete this HR? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/hrs/${id}`);
      toast.success('HR deleted');
      loadHRs();
    } catch {
      toast.error('Failed to delete HR');
    }
  };

  const filteredHRs = hrs.filter(hr =>
    hr.name.toLowerCase().includes(search.toLowerCase()) ||
    hr.email.toLowerCase().includes(search.toLowerCase()) ||
    (hr.department || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Manage HRs</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            {hrs.length} HR members · {hrs.filter(h => h.isActive).length} active
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            placeholder="Search HRs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '13px', width: '200px' }}
          />
          <button className="btn btn-primary" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add HR
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px', marginBottom: '20px',
      }}>
        {[
          { label: 'Total HRs',    value: hrs.length,                                color: '#6366f1' },
          { label: 'Active',       value: hrs.filter(h => h.isActive).length,        color: '#10b981' },
          { label: 'Inactive',     value: hrs.filter(h => !h.isActive).length,       color: '#ef4444' },
          { label: 'Total Hired',  value: hrs.reduce((s, h) => s + (h.stats?.hired || 0), 0), color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--color-background-secondary)',
            borderRadius: '12px', padding: '14px',
            border: '0.5px solid var(--color-border-tertiary)',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* HR Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '14px' }}>
        {filteredHRs.map(hr => (
          <div key={hr._id} style={{
            background: 'var(--color-background-secondary)',
            borderRadius: '14px', padding: '18px',
            border: '0.5px solid var(--color-border-tertiary)',
            borderLeft: `4px solid ${hr.isActive ? '#10b981' : '#ef4444'}`,
            opacity: hr.isActive ? 1 : 0.7,
            transition: 'box-shadow 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
          >
            {/* Avatar + Info */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '12px',
                background: avColor(hr.name), color: 'white',
                fontSize: '16px', fontWeight: 700, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {initials(hr.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{hr.name}</h3>
                  <span style={{
                    padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                    background: hr.isActive ? '#10b98115' : '#ef444415',
                    color: hr.isActive ? '#10b981' : '#ef4444',
                    border: `1px solid ${hr.isActive ? '#10b98130' : '#ef444430'}`,
                  }}>
                    {hr.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '3px 0 0' }}>
                  {hr.email}
                </p>
                {hr.phone && (
                  <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>
                    📞 {hr.phone}
                  </p>
                )}
                {hr.department && (
                  <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>
                    🏢 {hr.department}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px', padding: '12px', borderRadius: '10px',
              background: 'var(--color-background-primary)', marginBottom: '12px',
            }}>
              {[
                { label: 'Jobs',       value: hr.stats?.jobsPosted || 0,           color: '#0ea5e9' },
                { label: 'Candidates', value: hr.stats?.candidatesHandled || 0,    color: '#8b5cf6' },
                { label: 'Hired',      value: hr.stats?.hired || 0,                color: '#10b981' },
                { label: 'Interviews', value: hr.stats?.interviewsConducted || 0,  color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', marginTop: '3px', fontWeight: 500 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Permissions */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {hr.permissions?.canPostJobs          && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#3b82f615', color: '#3b82f6', border: '1px solid #3b82f630' }}>💼 Post Jobs</span>}
              {hr.permissions?.canViewAllCandidates && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#8b5cf615', color: '#8b5cf6', border: '1px solid #8b5cf630' }}>👥 View All</span>}
              {hr.permissions?.canManageDocuments   && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#0ea5e915', color: '#0ea5e9', border: '1px solid #0ea5e930' }}>📂 Docs</span>}
              {hr.permissions?.canSendOffers        && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}>📨 Offers</span>}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(hr)} style={{ fontSize: '11px' }}>
                ✏️ Edit
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setPwdHR(hr); setNewPwd(''); setShowPwdModal(true); }} style={{ fontSize: '11px' }}>
                🔑 Reset Pwd
              </button>
              <button
                className={`btn btn-sm ${hr.isActive ? 'btn-danger' : 'btn-success'}`}
                onClick={() => toggleActive(hr._id)}
                style={{ fontSize: '11px' }}
              >
                {hr.isActive ? '⛔ Deactivate' : '✅ Activate'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteHR(hr._id)} style={{ fontSize: '11px' }}>
                🗑️ Delete
              </button>
            </div>

            {hr.lastLogin && (
              <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '10px' }}>
                Last login: {fmtDate(hr.lastLogin)}
              </p>
            )}
          </div>
        ))}

        {filteredHRs.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: '60px',
            background: 'var(--color-background-secondary)',
            borderRadius: '14px', border: '0.5px solid var(--color-border-tertiary)',
            color: 'var(--color-text-tertiary)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧑‍💼</div>
            <div style={{ fontWeight: 600 }}>{search ? 'No HRs match your search' : 'No HRs added yet'}</div>
            {!search && (
              <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: '16px' }}>
                Add First HR
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Add/Edit HR Modal ────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <span className="modal-title">{editHR ? `Edit — ${editHR.name}` : 'Add New HR'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  HR INFORMATION
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                      Full Name *
                    </label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Priya Sharma" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                      Email Address *
                    </label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="priya@company.com" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                      {editHR ? 'New Password (blank = keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      required={!editHR}
                      placeholder={editHR ? 'Leave blank to keep current' : 'Min 6 characters'}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                      Phone
                    </label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                      Department
                    </label>
                    <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="Technology / Marketing / HR" />
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', margin: '18px 0 12px', letterSpacing: '0.05em' }}>
                  PERMISSIONS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    ['canPostJobs',          '💼 Post & Manage Jobs'],
                    ['canViewAllCandidates', '👥 View All Candidates'],
                    ['canManageDocuments',   '📂 Manage Documents'],
                    ['canSendOffers',        '📨 Send Offer Letters'],
                  ].map(([key, label]) => (
                    <label key={key} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                      background: form.permissions[key] ? '#6366f10d' : 'var(--color-background-primary)',
                      border: `1px solid ${form.permissions[key] ? '#6366f133' : 'var(--color-border-tertiary)'}`,
                      fontSize: '12px', fontWeight: 500,
                      transition: 'all 0.15s',
                    }}>
                      <input
                        type="checkbox"
                        checked={form.permissions[key]}
                        onChange={e => setPerm(key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editHR ? 'Update HR' : 'Create HR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ─────────────────────────────── */}
      {showPwdModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPwdModal(false)}>
          <div className="modal" style={{ maxWidth: '360px' }}>
            <div className="modal-header">
              <span className="modal-title">🔑 Reset Password</span>
              <button className="modal-close" onClick={() => setShowPwdModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={resetPwd}>
              <div className="modal-body">
                <div style={{
                  padding: '10px 12px', borderRadius: '8px',
                  background: '#6366f10d', border: '1px solid #6366f122',
                  fontSize: '12px', marginBottom: '14px',
                }}>
                  Resetting password for: <strong>{pwdHR?.name}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowPwdModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
