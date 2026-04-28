

// sahi hai 

// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import api from "../../../utils/api";
// import { fmtDate, avColor, initials } from '../../../utils/helpers';

// /* ── Eye Icon SVG ── */
// const EyeIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
//     <circle cx="12" cy="12" r="3"/>
//   </svg>
// );
// const EyeOffIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//     <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
//     <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
//     <line x1="1" y1="1" x2="23" y2="23"/>
//   </svg>
// );

// const PwdToggleBtn = ({ show, onToggle }) => (
//   <button
//     type="button"
//     onClick={onToggle}
//     style={{
//       position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
//       background: 'none', border: 'none', cursor: 'pointer',
//       color: 'var(--color-text-tertiary)', padding: 0, lineHeight: 1,
//       display: 'flex', alignItems: 'center',
//     }}
//   >
//     {show ? <EyeOffIcon /> : <EyeIcon />}
//   </button>
// );

// /* ── Confirm Modal (Delete / Toggle) ── */
// function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = true }) {
//   if (!open) return null;
//   return (
//     <div
//       className="modal-overlay"
//       onClick={e => e.target === e.currentTarget && onCancel()}
//       style={{ zIndex: 1200 }}
//     >
//       <div className="modal" style={{ maxWidth: '400px' }}>
//         <div className="modal-header">
//           <span className="modal-title">{title}</span>
//           <button className="modal-close" onClick={onCancel}>
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
//               <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//             </svg>
//           </button>
//         </div>
//         <div className="modal-body">
//           <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
//             <div style={{
//               width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
//               background: danger ? '#ef444415' : '#f59e0b15',
//               border: `0.5px solid ${danger ? '#ef444430' : '#f59e0b30'}`,
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//             }}>
//               {danger ? (
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
//                   <polyline points="3 6 5 6 21 6"/>
//                   <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
//                   <path d="M10 11v6M14 11v6"/>
//                   <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
//                 </svg>
//               ) : (
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
//                   <circle cx="12" cy="12" r="10"/>
//                   <line x1="12" y1="8" x2="12" y2="12"/>
//                   <line x1="12" y1="16" x2="12.01" y2="16"/>
//                 </svg>
//               )}
//             </div>
//             <p style={{ fontSize: '14px', lineHeight: 1.65, margin: 0, paddingTop: '4px' }}>
//               {message}
//             </p>
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
//           <button
//             className="btn"
//             onClick={onConfirm}
//             style={{ background: danger ? '#ef4444' : '#f59e0b', color: 'white', border: 'none' }}
//           >
//             {danger ? 'Yes, Delete' : 'Yes, Proceed'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ── HR Card ── */
// function HRCard({ hr, onEdit, onDelete, onToggle, onResetPwd }) {
//   return (
//     <div
//       style={{
//         background: 'var(--color-background-secondary)',
//         borderRadius: '14px', padding: '18px',
//         border: '0.5px solid var(--color-border-tertiary)',
//         borderLeft: `4px solid ${hr.isActive ? '#10b981' : '#ef4444'}`,
//         opacity: hr.isActive ? 1 : 0.7,
//         transition: 'box-shadow 0.2s',
//         boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
//         display: 'flex', flexDirection: 'column',
//       }}
//       onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
//       onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
//     >
//       {/* Avatar + Info */}
//       <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
//         <div style={{
//           width: 48, height: 48, borderRadius: '12px',
//           background: avColor(hr.name), color: 'white',
//           fontSize: '16px', fontWeight: 700, flexShrink: 0,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}>
//           {initials(hr.name)}
//         </div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
//             <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{hr.name}</h3>
//             <span style={{
//               padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
//               background: hr.isActive ? '#10b98115' : '#ef444415',
//               color: hr.isActive ? '#10b981' : '#ef4444',
//               border: `1px solid ${hr.isActive ? '#10b98130' : '#ef444430'}`,
//             }}>
//               {hr.isActive ? '● Active' : '○ Inactive'}
//             </span>
//           </div>
//           <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//             {hr.email}
//           </p>
//           {hr.phone      && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>📞 {hr.phone}</p>}
//           {hr.department && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>🏢 {hr.department}</p>}
//         </div>
//       </div>

//       {/* Stats */}
//       <div style={{
//         display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
//         gap: '8px', padding: '12px', borderRadius: '10px',
//         background: 'var(--color-background-primary)', marginBottom: '12px',
//       }}>
//         {[
//           { label: 'Jobs',       value: hr.stats?.jobsPosted || 0,           color: '#0ea5e9' },
//           { label: 'Candidates', value: hr.stats?.candidatesHandled || 0,    color: '#8b5cf6' },
//           { label: 'Hired',      value: hr.stats?.hired || 0,                color: '#10b981' },
//           { label: 'Interviews', value: hr.stats?.interviewsConducted || 0,  color: '#f59e0b' },
//         ].map(s => (
//           <div key={s.label} style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
//             <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', marginTop: '3px', fontWeight: 500 }}>{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Permissions */}
//       <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
//         {hr.permissions?.canPostJobs          && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#3b82f615', color: '#3b82f6', border: '1px solid #3b82f630' }}>💼 Post Jobs</span>}
//         {hr.permissions?.canViewAllCandidates && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#8b5cf615', color: '#8b5cf6', border: '1px solid #8b5cf630' }}>👥 View All</span>}
//         {hr.permissions?.canManageDocuments   && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#0ea5e915', color: '#0ea5e9', border: '1px solid #0ea5e930' }}>📂 Docs</span>}
//         {hr.permissions?.canSendOffers        && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}>📨 Offers</span>}
//       </div>

//       {/* Action buttons */}
//       <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
//         <button className="btn btn-ghost btn-sm" onClick={() => onEdit(hr)} style={{ fontSize: '11px' }}>✏️ Edit</button>
//         <button className="btn btn-ghost btn-sm" onClick={() => onResetPwd(hr)} style={{ fontSize: '11px' }}>🔑 Reset Pwd</button>
//         <button
//           className={`btn btn-sm ${hr.isActive ? 'btn-danger' : 'btn-success'}`}
//           onClick={() => onToggle(hr)}
//           style={{ fontSize: '11px' }}
//         >
//           {hr.isActive ? '⛔ Deactivate' : '✅ Activate'}
//         </button>
//         <button className="btn btn-danger btn-sm" onClick={() => onDelete(hr)} style={{ fontSize: '11px' }}>🗑️ Delete</button>
//       </div>

//       {hr.lastLogin && (
//         <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '10px' }}>
//           Last login: {fmtDate(hr.lastLogin)}
//         </p>
//       )}
//     </div>
//   );
// }

// /* ── Main Component ── */
// export default function ManageHRs() {
//   const [hrs, setHrs]               = useState([]);
//   const [loading, setLoading]       = useState(true);
//   const [showModal, setShowModal]   = useState(false);
//   const [showPwdModal, setShowPwdModal] = useState(false);
//   const [editHR, setEditHR]         = useState(null);
//   const [pwdHR, setPwdHR]           = useState(null);
//   const [newPwd, setNewPwd]         = useState('');
//   const [search, setSearch]         = useState('');

//   // ── Password visibility states ──
//   const [showFormPwd, setShowFormPwd]   = useState(false);  // Add/Edit HR modal
//   const [showResetPwd, setShowResetPwd] = useState(false);  // Reset Password modal

//   const [confirm, setConfirm] = useState({
//     open: false, title: '', message: '', onConfirm: null, danger: true,
//   });
//   const openConfirm  = (title, message, onConfirm, danger = true) =>
//     setConfirm({ open: true, title, message, onConfirm, danger });
//   const closeConfirm = () => setConfirm(c => ({ ...c, open: false }));

//   const initForm = {
//     name: '', email: '', password: '', phone: '', department: '',
//     permissions: {
//       canPostJobs: true,
//       canViewAllCandidates: false,
//       canManageDocuments: true,
//       canSendOffers: false,
//     },
//   };
//   const [form, setForm] = useState(initForm);

//   const loadHRs = () => {
//     setLoading(true);
//     api.get('/admin/hrs')
//       .then(r => setHrs(r.data))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => { loadHRs(); }, []);

//   const set     = (k, v) => setForm(f => ({ ...f, [k]: v }));
//   const setPerm = (k, v) => setForm(f => ({ ...f, permissions: { ...f.permissions, [k]: v } }));

//   const openAdd = () => {
//     setEditHR(null);
//     setForm(initForm);
//     setShowFormPwd(false);   // reset visibility on open
//     setShowModal(true);
//   };
// // sahi bcrypt 
//   const openEdit = (hr) => {
//     setEditHR(hr);
//     setForm({
//       name: hr.name, email: hr.email, password: '',
//       phone: hr.phone || '', department: hr.department || '',
//       permissions: hr.permissions || initForm.permissions,
//     });
//     setShowFormPwd(false);   // reset visibility on open
//     setShowModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Frontend password validation
//     if (!editHR && form.password.length < 6) {
//       toast.error('Password must be at least 6 characters');
//       return;
//     }
//     if (editHR && form.password && form.password.length < 6) {
//       toast.error('New password must be at least 6 characters');
//       return;
//     }
//     try {
//       const payload = { ...form };
//       if (editHR && !payload.password) delete payload.password;
//       if (editHR) {
//         await api.put(`/admin/hrs/${editHR._id}`, payload);
//         toast.success('HR updated successfully!');
//       } else {
//         await api.post('/admin/hrs', payload);
//         toast.success('HR created successfully!');
//       }
//       setShowModal(false);
//       loadHRs();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Something went wrong');
//     }
//   };

//   const handleToggle = (hr) => {
//     openConfirm(
//       hr.isActive ? 'Deactivate HR?' : 'Activate HR?',
//       hr.isActive
//         ? <span>This will prevent <strong>{hr.name}</strong> from logging in. You can re-activate anytime.</span>
//         : <span><strong>{hr.name}</strong> will regain full access based on their permissions.</span>,
//       async () => {
//         closeConfirm();
//         try {
//           await api.patch(`/admin/hrs/${hr._id}/toggle`);
//           toast.success('HR status updated');
//           loadHRs();
//         } catch {
//           toast.error('Failed to update status');
//         }
//       },
//       hr.isActive,
//     );
//   };

//   const handleDelete = (hr) => {
//     openConfirm(
//       'Delete HR?',
//       <span>You are about to permanently delete <strong>{hr.name}</strong>. All associated data will be removed and this cannot be undone.</span>,
//       async () => {
//         closeConfirm();
//         try {
//           await api.delete(`/admin/hrs/${hr._id}`);
//           toast.success('HR deleted');
//           loadHRs();
//         } catch {
//           toast.error('Failed to delete HR');
//         }
//       },
//     );
//   };

//   const resetPwd = async (e) => {
//     e.preventDefault();
//     if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
//     try {
//       await api.put(`/admin/hrs/${pwdHR._id}/reset-password`, { newPassword: newPwd });
//       toast.success('Password reset successfully!');
//       setShowPwdModal(false);
//       setNewPwd('');
//       setShowResetPwd(false);
//     } catch {
//       toast.error('Failed to reset password');
//     }
//   };

//   const filteredHRs = hrs.filter(hr =>
//     hr.name.toLowerCase().includes(search.toLowerCase()) ||
//     hr.email.toLowerCase().includes(search.toLowerCase()) ||
//     (hr.department || '').toLowerCase().includes(search.toLowerCase())
//   );

//   if (loading) return (
//     <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
//       <div className="spinner" />
//     </div>
//   );

//   return (
//     <div>
//       {/* ── Modals ── */}
//       <ConfirmModal
//         open={confirm.open}
//         title={confirm.title}
//         message={confirm.message}
//         danger={confirm.danger}
//         onConfirm={confirm.onConfirm}
//         onCancel={closeConfirm}
//       />

//       {/* Header */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
//         <div>
//           <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Manage HRs</h1>
//           <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '2px' }}>
//             {hrs.length} HR members · {hrs.filter(h => h.isActive).length} active
//           </p>
//         </div>
//         <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//           <input
//             placeholder="Search HRs…"
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '13px', width: '200px' }}
//           />
//           <button className="btn btn-primary" onClick={openAdd}>
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
//               <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
//             </svg>
//             Add HR
//           </button>
//         </div>
//       </div>

//       {/* Summary stats */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
//         {[
//           { label: 'Total HRs',   value: hrs.length,                                          color: '#6366f1' },
//           { label: 'Active',      value: hrs.filter(h => h.isActive).length,                  color: '#10b981' },
//           { label: 'Inactive',    value: hrs.filter(h => !h.isActive).length,                 color: '#ef4444' },
//           { label: 'Total Hired', value: hrs.reduce((s, h) => s + (h.stats?.hired || 0), 0),  color: '#f59e0b' },
//         ].map(s => (
//           <div key={s.label} style={{ background: 'var(--color-background-secondary)', borderRadius: '12px', padding: '14px', border: '0.5px solid var(--color-border-tertiary)' }}>
//             <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
//             <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* HR Cards Grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
//         {filteredHRs.map(hr => (
//           <HRCard
//             key={hr._id}
//             hr={hr}
//             onEdit={openEdit}
//             onDelete={handleDelete}
//             onToggle={handleToggle}
//             onResetPwd={hr => { setPwdHR(hr); setNewPwd(''); setShowResetPwd(false); setShowPwdModal(true); }}
//           />
//         ))}

//         {filteredHRs.length === 0 && (
//           <div style={{
//             gridColumn: '1/-1', textAlign: 'center', padding: '60px',
//             background: 'var(--color-background-secondary)',
//             borderRadius: '14px', border: '0.5px solid var(--color-border-tertiary)',
//             color: 'var(--color-text-tertiary)',
//           }}>
//             <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧑‍💼</div>
//             <div style={{ fontWeight: 600 }}>{search ? 'No HRs match your search' : 'No HRs added yet'}</div>
//             {!search && (
//               <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: '16px' }}>
//                 Add First HR
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ══════════════════════════════════════
//           Add / Edit HR Modal
//       ══════════════════════════════════════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
//           <div className="modal" style={{ maxWidth: '520px' }}>
//             <div className="modal-header">
//               <span className="modal-title">{editHR ? `Edit — ${editHR.name}` : 'Add New HR'}</span>
//               <button className="modal-close" onClick={() => setShowModal(false)}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
//                   <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                 </svg>
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} noValidate>
//               <div className="modal-body">
//                 <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: '12px', letterSpacing: '0.05em' }}>
//                   HR INFORMATION
//                 </div>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

//                   {/* Full Name */}
//                   <div>
//                     <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>Full Name *</label>
//                     <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Priya Sharma" />
//                   </div>

//                   {/* Email */}
//                   <div>
//                     <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>Email Address *</label>
//                     <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="priya@company.com" />
//                   </div>

//                   {/* Password with show/hide */}
//                   <div>
//                     <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
//                       {editHR ? 'New Password (blank = keep current)' : 'Password *'}
//                     </label>
//                     <div style={{ position: 'relative' }}>
//                       <input
//                         type={showFormPwd ? 'text' : 'password'}
//                         value={form.password}
//                         onChange={e => set('password', e.target.value)}
//                         required={!editHR}
//                         placeholder={editHR ? 'Leave blank to keep current' : 'Min 6 characters'}
//                         style={{ paddingRight: '38px', width: '100%', boxSizing: 'border-box' }}
//                       />
//                       <PwdToggleBtn show={showFormPwd} onToggle={() => setShowFormPwd(s => !s)} />
//                     </div>
//                     {editHR && (
//                       <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
//                         Only fill this to change the password
//                       </span>
//                     )}
//                   </div>

//                   {/* Phone */}
//                   <div>
//                     <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>Phone</label>
//                     <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
//                   </div>

//                   {/* Department */}
//                   <div style={{ gridColumn: '1 / -1' }}>
//                     <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>Department</label>
//                     <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="Technology / Marketing / HR" />
//                   </div>
//                 </div>

//                 {/* Permissions */}
//                 <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', margin: '18px 0 12px', letterSpacing: '0.05em' }}>PERMISSIONS</div>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
//                   {[
//                     ['canPostJobs',          '💼 Post & Manage Jobs'],
//                     ['canViewAllCandidates', '👥 View All Candidates'],
//                     ['canManageDocuments',   '📂 Manage Documents'],
//                     ['canSendOffers',        '📨 Send Offer Letters'],
//                   ].map(([key, label]) => (
//                     <label key={key} style={{
//                       display: 'flex', alignItems: 'center', gap: '10px',
//                       padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
//                       background: form.permissions[key] ? '#6366f10d' : 'var(--color-background-primary)',
//                       border: `1px solid ${form.permissions[key] ? '#6366f133' : 'var(--color-border-tertiary)'}`,
//                       fontSize: '12px', fontWeight: 500, transition: 'all 0.15s',
//                     }}>
//                       <input type="checkbox" checked={form.permissions[key]} onChange={e => setPerm(key, e.target.checked)} />
//                       {label}
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="modal-footer" style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
//                 <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
//                   {editHR ? 'Update HR' : 'Create HR'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ══════════════════════════════════════
//           Reset Password Modal
//       ══════════════════════════════════════ */}
//       {showPwdModal && (
//         <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPwdModal(false)}>
//           <div className="modal" style={{ maxWidth: '360px' }}>
//             <div className="modal-header">
//               <span className="modal-title">🔑 Reset Password</span>
//               <button className="modal-close" onClick={() => setShowPwdModal(false)}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
//                   <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//                 </svg>
//               </button>
//             </div>
//             <form onSubmit={resetPwd} noValidate>
//               <div className="modal-body">
//                 <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#6366f10d', border: '1px solid #6366f122', fontSize: '12px', marginBottom: '14px' }}>
//                   Resetting password for: <strong>{pwdHR?.name}</strong>
//                 </div>
//                 <div>
//                   <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>New Password *</label>
//                   <div style={{ position: 'relative' }}>
//                     <input
//                       type={showResetPwd ? 'text' : 'password'}
//                       value={newPwd}
//                       onChange={e => setNewPwd(e.target.value)}
//                       placeholder="Minimum 6 characters"
//                       style={{ paddingRight: '38px', width: '100%', boxSizing: 'border-box' }}
//                     />
//                     <PwdToggleBtn show={showResetPwd} onToggle={() => setShowResetPwd(s => !s)} />
//                   </div>
//                   <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
//                     Minimum 6 characters required
//                   </span>
//                 </div>
//               </div>
//               <div className="modal-footer" style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
//                 <button type="button" className="btn btn-ghost" onClick={() => setShowPwdModal(false)}>Cancel</button>
//                 <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Reset Password</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





// bina hassed ke password ka logic

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from "../../../utils/api";
import { fmtDate, avColor, initials } from '../../../utils/helpers';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const PwdToggleBtn = ({ show, onToggle }) => (
  <button type="button" onClick={onToggle} style={{
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--color-text-tertiary)', padding: 0, lineHeight: 1,
    display: 'flex', alignItems: 'center',
  }}>
    {show ? <EyeOffIcon /> : <EyeIcon />}
  </button>
);

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()} style={{ zIndex: 1200 }}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onCancel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: danger ? '#ef444415' : '#f59e0b15',
              border: `0.5px solid ${danger ? '#ef444430' : '#f59e0b30'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {danger ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              )}
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.65, margin: 0, paddingTop: '4px' }}>{message}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={onConfirm}
            style={{ background: danger ? '#ef4444' : '#f59e0b', color: 'white', border: 'none' }}>
            {danger ? 'Yes, Delete' : 'Yes, Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}

function HRCard({ hr, onEdit, onDelete, onToggle, onResetPwd }) {
  return (
    <div
      style={{
        background: 'var(--color-background-secondary)',
        borderRadius: '14px', padding: '18px',
        border: '0.5px solid var(--color-border-tertiary)',
        borderLeft: `4px solid ${hr.isActive ? '#10b981' : '#ef4444'}`,
        opacity: hr.isActive ? 1 : 0.7,
        transition: 'box-shadow 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '12px',
          background: avColor(hr.name), color: 'white',
          fontSize: '16px', fontWeight: 700, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {initials(hr.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
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
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {hr.email}
          </p>
          {hr.phone      && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>📞 {hr.phone}</p>}
          {hr.department && <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>🏢 {hr.department}</p>}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px', padding: '12px', borderRadius: '10px',
        background: 'var(--color-background-primary)', marginBottom: '12px',
      }}>
        {[
          { label: 'Jobs',       value: hr.stats?.jobsPosted || 0,          color: '#0ea5e9' },
          { label: 'Candidates', value: hr.stats?.candidatesHandled || 0,   color: '#8b5cf6' },
          { label: 'Hired',      value: hr.stats?.hired || 0,               color: '#10b981' },
          { label: 'Interviews', value: hr.stats?.interviewsConducted || 0, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', marginTop: '3px', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '14px' }}>
        {hr.permissions?.canPostJobs          && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#3b82f615', color: '#3b82f6', border: '1px solid #3b82f630' }}>💼 Post Jobs</span>}
        {hr.permissions?.canViewAllCandidates && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#8b5cf615', color: '#8b5cf6', border: '1px solid #8b5cf630' }}>👥 View All</span>}
        {hr.permissions?.canManageDocuments   && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#0ea5e915', color: '#0ea5e9', border: '1px solid #0ea5e930' }}>📂 Docs</span>}
        {hr.permissions?.canSendOffers        && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, background: '#10b98115', color: '#10b981', border: '1px solid #10b98130' }}>📨 Offers</span>}
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(hr)} style={{ fontSize: '11px' }}>✏️ Edit</button>
        <button className="btn btn-ghost btn-sm" onClick={() => onResetPwd(hr)} style={{ fontSize: '11px' }}>🔑 Reset Pwd</button>
        <button className={`btn btn-sm ${hr.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => onToggle(hr)} style={{ fontSize: '11px' }}>
          {hr.isActive ? '⛔ Deactivate' : '✅ Activate'}
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(hr)} style={{ fontSize: '11px' }}>🗑️ Delete</button>
      </div>

      {hr.lastLogin && (
        <p style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '10px' }}>
          Last login: {fmtDate(hr.lastLogin)}
        </p>
      )}
    </div>
  );
}

export default function ManageHRs() {
  const [hrs, setHrs]                   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [editHR, setEditHR]             = useState(null);
  const [pwdHR, setPwdHR]               = useState(null);
  const [newPwd, setNewPwd]             = useState('');
  const [search, setSearch]             = useState('');
  const [showFormPwd, setShowFormPwd]   = useState(false);
  const [showResetPwd, setShowResetPwd] = useState(false);

  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', onConfirm: null, danger: true });
  const openConfirm  = (title, message, onConfirm, danger = true) =>
    setConfirm({ open: true, title, message, onConfirm, danger });
  const closeConfirm = () => setConfirm(c => ({ ...c, open: false }));

  const initForm = {
    name: '', email: '', password: '', phone: '', department: '',
    permissions: { canPostJobs: true, canViewAllCandidates: false, canManageDocuments: true, canSendOffers: false },
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

  const openAdd = () => {
    setEditHR(null);
    setForm(initForm);
    setShowFormPwd(false);
    setShowModal(true);
  };

  // ✅ FIXED: hr.password ab aayega kyunki toJSON mein delete nahi hai
  const openEdit = (hr) => {
    setEditHR(hr);
    setForm({
      name:        hr.name,
      email:       hr.email,
      password:    hr.password || '',   // current password prefill
      phone:       hr.phone       || '',
      department:  hr.department  || '',
      permissions: hr.permissions || initForm.permissions,
    });
    setShowFormPwd(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editHR && form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (editHR && form.password && form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const payload = { ...form };
      // Edit mein agar password empty chhoda toh mat bhejo
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

  const handleToggle = (hr) => {
    openConfirm(
      hr.isActive ? 'Deactivate HR?' : 'Activate HR?',
      hr.isActive
        ? <span>This will prevent <strong>{hr.name}</strong> from logging in.</span>
        : <span><strong>{hr.name}</strong> will regain full access.</span>,
      async () => {
        closeConfirm();
        try {
          await api.patch(`/admin/hrs/${hr._id}/toggle`);
          toast.success('HR status updated');
          loadHRs();
        } catch { toast.error('Failed to update status'); }
      },
      hr.isActive,
    );
  };

  const handleDelete = (hr) => {
    openConfirm(
      'Delete HR?',
      <span>Permanently delete <strong>{hr.name}</strong>? This cannot be undone.</span>,
      async () => {
        closeConfirm();
        try {
          await api.delete(`/admin/hrs/${hr._id}`);
          toast.success('HR deleted');
          loadHRs();
        } catch { toast.error('Failed to delete HR'); }
      },
    );
  };

  const resetPwd = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await api.put(`/admin/hrs/${pwdHR._id}/reset-password`, { newPassword: newPwd });
      toast.success('Password reset successfully!');
      setShowPwdModal(false);
      setNewPwd('');
      setShowResetPwd(false);
    } catch { toast.error('Failed to reset password'); }
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
      <ConfirmModal
        open={confirm.open} title={confirm.title} message={confirm.message}
        danger={confirm.danger} onConfirm={confirm.onConfirm} onCancel={closeConfirm}
      />

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total HRs',   value: hrs.length,                                         color: '#6366f1' },
          { label: 'Active',      value: hrs.filter(h => h.isActive).length,                 color: '#10b981' },
          { label: 'Inactive',    value: hrs.filter(h => !h.isActive).length,                color: '#ef4444' },
          { label: 'Total Hired', value: hrs.reduce((s, h) => s + (h.stats?.hired || 0), 0), color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--color-background-secondary)', borderRadius: '12px', padding: '14px', border: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* HR Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
        {filteredHRs.map(hr => (
          <HRCard
            key={hr._id} hr={hr}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onResetPwd={hr => { setPwdHR(hr); setNewPwd(''); setShowResetPwd(false); setShowPwdModal(true); }}
          />
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
              <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: '16px' }}>Add First HR</button>
            )}
          </div>
        )}
      </div>

      {/* ══ Add / Edit HR Modal ══ */}
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

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  HR INFORMATION
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>Full Name *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Priya Sharma" />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>Email Address *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="priya@company.com" />
                  </div>

                  {/* ✅ Password — edit mein current dikhega, eye se dekh sakte ho */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>
                      {editHR ? 'Password (current load hua hai)' : 'Password *'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showFormPwd ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => set('password', e.target.value)}
                        required={!editHR}
                        placeholder={editHR ? 'Current password loaded' : 'Min 6 characters'}
                        style={{ paddingRight: '38px', width: '100%', boxSizing: 'border-box' }}
                      />
                      <PwdToggleBtn show={showFormPwd} onToggle={() => setShowFormPwd(s => !s)} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
                      {editHR ? 'Aankhon ke icon se current password dekho, change karna ho toh edit karo' : 'Min 6 characters required'}
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>Phone</label>
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>Department</label>
                    <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="Technology / Marketing / HR" />
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', margin: '18px 0 12px', letterSpacing: '0.05em' }}>PERMISSIONS</div>
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
                      fontSize: '12px', fontWeight: 500, transition: 'all 0.15s',
                    }}>
                      <input type="checkbox" checked={form.permissions[key]} onChange={e => setPerm(key, e.target.checked)} />
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

      {/* ══ Reset Password Modal ══ */}
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
            <form onSubmit={resetPwd} noValidate>
              <div className="modal-body">
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#6366f10d', border: '1px solid #6366f122', fontSize: '12px', marginBottom: '14px' }}>
                  Resetting password for: <strong>{pwdHR?.name}</strong>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '5px' }}>New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPwd ? 'text' : 'password'}
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      placeholder="Minimum 6 characters"
                      style={{ paddingRight: '38px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <PwdToggleBtn show={showResetPwd} onToggle={() => setShowResetPwd(s => !s)} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'block' }}>
                    Minimum 6 characters required
                  </span>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowPwdModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}