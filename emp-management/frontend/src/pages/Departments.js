

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const DESC_LIMIT = 50;

/* ── Description Modal ── */
function DescriptionModal({ dept, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ zIndex: 1100 }}
    >
      <div className="modal" style={{ maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div>
            <span className="modal-title">{dept.name}</span>
            <div style={{
              fontFamily: 'Space Mono, monospace', fontSize: '11px',
              color: 'var(--accent)', background: 'rgba(34,211,238,0.1)',
              padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px'
            }}>{dept.code}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div
          className="modal-body"
          style={{ overflowY: 'auto', flex: 1, paddingTop: '12px' }}
        >
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
            {dept.description}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete Confirm Modal ── */
function DeleteModal({ dept, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <span className="modal-title">Delete Department</span>
          <button className="modal-close" onClick={onCancel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '15px', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>{dept?.name}</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ── Department Card ── */
function DeptCard({ dept, onEdit, onDelete, onShowDesc }) {
  const desc = dept.description || '';
  const isLong = desc.length > DESC_LIMIT;
  const preview = isLong ? desc.slice(0, DESC_LIMIT) + '…' : desc;

  return (
    <div
      className="card"
      style={{
        borderLeft: '3px solid var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        height: '200px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{dept.name}</h3>
          <span style={{
            fontFamily: 'Space Mono, monospace', fontSize: '11px',
            color: 'var(--accent)', background: 'rgba(34,211,238,0.1)',
            padding: '2px 8px', borderRadius: '4px'
          }}>{dept.code}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit(dept)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(dept)}>Del</button>
        </div>
      </div>

      {/* Description — fixed 2-line preview */}
      <div style={{ flex: 1, overflow: 'hidden', marginBottom: '8px' }}>
        {desc && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            {preview}
            {isLong && (
              <>
                {' '}
                <span
                  onClick={() => onShowDesc(dept)}
                  style={{
                    color: 'var(--accent)', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap'
                  }}
                >
                  Show more
                </span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Footer stats */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: 'auto' }}>
        <div style={{ fontSize: '13px' }}>
          <span>👥 </span>
          <strong>{dept.employeeCount || 0}</strong> employees
        </div>
        {dept.location && (
          <div style={{ fontSize: '13px' }}><span>📍 </span>{dept.location}</div>
        )}
        {dept.budget > 0 && (
          <div style={{ fontSize: '13px' }}><span>💰 </span>₹{Number(dept.budget).toLocaleString()}</div>
        )}
      </div>

      {dept.manager && (
        <div style={{
          marginTop: '8px', paddingTop: '8px',
          borderTop: '1px solid var(--border)',
          fontSize: '13px', color: 'var(--text-muted)'
        }}>
          Manager: <strong style={{ color: 'var(--text)' }}>{dept.manager.firstName} {dept.manager.lastName}</strong>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function Departments() {
  const [departments, setDepartments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [descTarget, setDescTarget]     = useState(null);   // for description popup
  const [form, setForm] = useState({ name: '', code: '', description: '', location: '', budget: '' });

  const fetchDepts = () => {
    api.get('/departments')
      .then(r => setDepartments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepts(); }, []);

  const openAdd  = () => {
    setEditing(null);
    setForm({ name: '', code: '', description: '', location: '', budget: '' });
    setShowModal(true);
  };
  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name, code: d.code, description: d.description || '', location: d.location || '', budget: d.budget || '' });
    setShowModal(true);
  };

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

  const confirmDelete = async () => {
    try {
      await api.delete(`/departments/${deleteTarget._id}`);
      toast.success('Department deleted');
      setDeleteTarget(null);
      fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete department');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Departments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{departments.length} departments</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Department
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
        {departments.map(dept => (
          <DeptCard
            key={dept._id}
            dept={dept}
            onEdit={openEdit}
            onDelete={d => setDeleteTarget(d)}
            onShowDesc={d => setDescTarget(d)}
          />
        ))}
        {departments.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <p>No departments yet</p>
            <span>Click "Add Department" to create one</span>
          </div>
        )}
      </div>

      {/* Description Popup Modal */}
      {descTarget && (
        <DescriptionModal
          dept={descTarget}
          onClose={() => setDescTarget(null)}
        />
      )}

      {/* Delete Confirm Popup */}
      {deleteTarget && (
        <DeleteModal
          dept={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Department' : 'New Department'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
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


















