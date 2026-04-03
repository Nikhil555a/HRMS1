import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import EmployeeForm from '../components/employees/EmployeeForm';

const statusColors = { Active: 'success', Inactive: 'muted', 'On Leave': 'warning', Terminated: 'danger', Resigned: 'danger' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (filterDept) params.department = filterDept;
    if (filterStatus) params.status = filterStatus;
    api.get('/employees', { params })
      .then(r => { setEmployees(r.data.employees); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page, search, filterDept, filterStatus]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { api.get('/departments').then(r => setDepartments(r.data)); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this employee?')) return;
    try { await api.delete(`/employees/${id}`); toast.success('Employee deleted'); fetchEmployees(); }
    catch (err) { toast.error('Error deleting employee'); }
  };

  const handleStatusChange = async (id, status, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/employees/${id}/status`, { status });
      toast.success('Status updated'); fetchEmployees();
    } catch (err) { toast.error('Error updating status'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Employees</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{total} total employees</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEmp(null); setShowModal(true); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Employee
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input placeholder="Search name, ID, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }} style={{ minWidth: '160px' }}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ minWidth: '140px' }}>
          <option value="">All Status</option>
          {['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'].map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || filterDept || filterStatus) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterDept(''); setFilterStatus(''); }}>Clear</button>
        )}
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" /></div> : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th><th>ID</th><th>Department</th><th>Designation</th>
                    <th>Phone</th><th>Joining Date</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/employees/${emp._id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {emp.profilePhoto
                            ? <img src={`/${emp.profilePhoto}`} alt="" className="emp-avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                            : <div className="emp-avatar" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{emp.firstName} {emp.lastName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--accent)' }}>{emp.employeeId}</td>
                      <td>{emp.department?.name || '—'}</td>
                      <td style={{ fontSize: '13px' }}>{emp.designation}</td>
                      <td style={{ fontSize: '13px' }}>{emp.phone}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <select className="badge" value={emp.status}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '3px 6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: statusColors[emp.status] === 'success' ? 'var(--success)' : statusColors[emp.status] === 'warning' ? 'var(--warning)' : statusColors[emp.status] === 'danger' ? 'var(--danger)' : 'var(--text-muted)' }}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleStatusChange(emp._id, e.target.value, e)}>
                          {['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setEditEmp(emp); setShowModal(true); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={e => handleDelete(emp._id, e)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {employees.length === 0 && (
              <div className="empty-state"><p>No employees found</p><span>Try adjusting your filters</span></div>
            )}
            {pages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                <span className="page-info">Page {page} of {pages}</span>
                <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <EmployeeForm
          employee={editEmp}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchEmployees(); }}
        />
      )}
    </div>
  );
}
