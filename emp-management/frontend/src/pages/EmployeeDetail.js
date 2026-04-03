import React, { useState, useEffect ,useCallback} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import EmployeeForm from '../components/employees/EmployeeForm';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emp, setEmp] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // const fetchEmp = () => {
  //   api.get(`/employees/${id}`).then(r => setEmp(r.data)).catch(() => navigate('/employees')).finally(() => setLoading(false));
  // };

  // useEffect(() => { fetchEmp(); api.get('/departments').then(r => setDepartments(r.data)); }, [id]);


const fetchEmp = useCallback(() => {
  setLoading(true);
  api.get(`/employees/${id}`)
     .then(r => setEmp(r.data))
     .catch(() => navigate('/employees'))
     .finally(() => setLoading(false));
}, [id, navigate]); // 👈 id + navigate dependency

useEffect(() => {
  fetchEmp();
  api.get('/departments').then(r => setDepartments(r.data));
}, [fetchEmp]);


  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!emp) return null;

  const fullName = `${emp.firstName} ${emp.lastName}`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/employees')}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{fullName}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{emp.designation} · {emp.department?.name}</p>
        </div>
        <StatusBadge status={emp.status} />
        <button className="btn btn-primary" onClick={() => setShowEdit(true)}>Edit Employee</button>
      </div>

      <div className="detail-grid">
        {/* Left sidebar */}
        <div className="detail-sidebar">
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            {emp.profilePhoto
              ? <img src={`/${emp.profilePhoto}`} alt={fullName} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block' }} />
              : <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 800, color: 'var(--primary-light)', margin: '0 auto 12px' }}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
            }
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{fullName}</h2>
            <p style={{ color: 'var(--primary-light)', fontSize: '13px', marginTop: '4px' }}>{emp.designation}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Space Mono, monospace', marginTop: '6px' }}>{emp.employeeId}</p>
            {emp.resume && (
              <a href={`/${emp.resume}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: '14px', display: 'inline-flex' }}>
                📄 View Resume
              </a>
            )}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: '12px' }}>Contact</div>
            <div className="info-row"><span className="label">📧 Email</span><span className="value" style={{ fontSize: '12px' }}>{emp.email}</span></div>
            <div className="info-row"><span className="label">📞 Phone</span><span className="value">{emp.phone}</span></div>
            {emp.alternatePhone && <div className="info-row"><span className="label">📞 Alt.</span><span className="value">{emp.alternatePhone}</span></div>}
            {emp.address?.city && <div className="info-row"><span className="label">📍 City</span><span className="value">{emp.address.city}, {emp.address.state}</span></div>}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: '12px' }}>Employment</div>
            <div className="info-row"><span className="label">Department</span><span className="value">{emp.department?.name}</span></div>
            <div className="info-row"><span className="label">Type</span><span className="value">{emp.employmentType}</span></div>
            <div className="info-row"><span className="label">Joined</span><span className="value">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : '—'}</span></div>
            {emp.closingDate && <div className="info-row"><span className="label">Closing</span><span className="value">{new Date(emp.closingDate).toLocaleDateString('en-IN')}</span></div>}
            {emp.salary && <div className="info-row"><span className="label">Salary</span><span className="value">₹{Number(emp.salary).toLocaleString()}</span></div>}
          </div>
        </div>

        {/* Right content */}
        <div>
          <div className="tabs" style={{ marginBottom: '20px' }}>
            {['overview', 'education', 'experience', 'skills'].map(t => (
              <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</div>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: '12px' }}>Personal Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                  {[
                    ['Date of Birth', emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                    ['Gender', emp.gender || '—'],
                    ['Blood Group', emp.bloodGroup || '—'],
                    ['Applied Position', emp.appliedPosition || '—'],
                    ['Previous Company', emp.previousCompany || '—'],
                  ].map(([l, v]) => (
                    <div key={l} className="info-row"><span className="label">{l}</span><span className="value">{v}</span></div>
                  ))}
                </div>
              </div>
              {(emp.address?.street || emp.address?.city) && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: '12px' }}>Address</div>
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                    {[emp.address.street, emp.address.city, emp.address.state, emp.address.country, emp.address.zipCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {emp.emergencyContact?.name && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: '12px' }}>Emergency Contact</div>
                  <div className="info-row"><span className="label">Name</span><span className="value">{emp.emergencyContact.name}</span></div>
                  <div className="info-row"><span className="label">Relationship</span><span className="value">{emp.emergencyContact.relationship}</span></div>
                  <div className="info-row"><span className="label">Phone</span><span className="value">{emp.emergencyContact.phone}</span></div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Education History</div>
              {emp.education?.length > 0 ? (
                <div className="timeline">
                  {emp.education.map((edu, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-title">{edu.degree}</div>
                      <div className="timeline-sub">{edu.institution}</div>
                      {edu.fieldOfStudy && <div className="timeline-date">{edu.fieldOfStudy}</div>}
                      <div className="timeline-date">{edu.startYear} — {edu.endYear || 'Present'} {edu.grade && `· ${edu.grade}`}</div>
                    </div>
                  ))}
                </div>
              ) : <div className="empty-state"><p>No education records</p></div>}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Work Experience</div>
              {emp.experience?.length > 0 ? (
                <div className="timeline">
                  {emp.experience.map((exp, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-title">{exp.jobTitle}</div>
                      <div className="timeline-sub">{exp.company}</div>
                      {exp.location && <div className="timeline-date">📍 {exp.location}</div>}
                      <div className="timeline-date">
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                        {' — '}
                        {exp.currentlyWorking ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                      </div>
                      {exp.description && <div className="timeline-desc">{exp.description}</div>}
                    </div>
                  ))}
                </div>
              ) : <div className="empty-state"><p>No experience records</p></div>}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '16px' }}>Skills & Technologies</div>
              {emp.skills?.length > 0
                ? <div className="skills-wrap">{emp.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
                : <div className="empty-state"><p>No skills listed</p></div>
              }
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EmployeeForm employee={emp} departments={departments} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); fetchEmp(); toast.success('Employee updated!'); }} />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { Active: 'success', Inactive: 'muted', 'On Leave': 'warning', Terminated: 'danger', Resigned: 'danger' };
  return <span className={`badge badge-${map[status] || 'muted'}`}>{status}</span>;
}
