import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', description: '', location: '', budget: '' });

  const fetchDepts = () => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepts(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', code: '', description: '', location: '', budget: '' }); setShowModal(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, code: d.code, description: d.description || '', location: d.location || '', budget: d.budget || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/departments/${editing._id}`, form);
        toast.success('Department updated!');
      } else {
        await api.post('/departments', form);
        toast.success('Department created!');
      }
      setShowModal(false);
      fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted');
      fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete department');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Departments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{departments.length} departments</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Department
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {departments.map(dept => (
          <div key={dept._id} className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{dept.name}</h3>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'var(--accent)', background: 'rgba(34,211,238,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{dept.code}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(dept)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dept._id)}>Del</button>
              </div>
            </div>
            {dept.description && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>{dept.description}</p>}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>👥 </span>
                <strong>{dept.employeeCount || 0}</strong> employees
              </div>
              {dept.location && <div style={{ fontSize: '13px' }}><span style={{ color: 'var(--text-muted)' }}>📍 </span>{dept.location}</div>}
              {dept.budget > 0 && <div style={{ fontSize: '13px' }}><span style={{ color: 'var(--text-muted)' }}>💰 </span>₹{Number(dept.budget).toLocaleString()}</div>}
            </div>
            {dept.manager && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}>
                Manager: <strong style={{ color: 'var(--text)' }}>{dept.manager.firstName} {dept.manager.lastName}</strong>
              </div>
            )}
          </div>
        ))}
        {departments.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <p>No departments yet</p>
            <span>Click "Add Department" to create one</span>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Department' : 'New Department'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Department Name *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Engineering" />
                  </div>
                  <div className="form-group">
                    <label>Department Code *</label>
                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. ENG" maxLength={10} />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Floor 3, Building A" />
                  </div>
                  <div className="form-group">
                    <label>Budget (₹)</label>
                    <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="0" />
                  </div>
                  <div className="form-group full">
                    <label>Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this department..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'} Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
