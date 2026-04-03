import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function EmployeeProfile() {
  const { user } = useAuth();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get('/employees/me/profile')
      .then(r => setEmp(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;
  if (!emp) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-tertiary)' }}>Could not load profile.</div>;

  const fullName = `${emp.firstName} ${emp.lastName}`;
  const tabs = ['overview', 'education', 'experience', 'skills'];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>My Profile</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          View your personal and professional details
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* ── Left Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Avatar card */}
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            {emp.profilePhoto
              ? <img src={`/${emp.profilePhoto}`} alt={fullName} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '3px solid #6366f133' }} />
              : <div style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', fontWeight: 800, color: '#fff',
                  margin: '0 auto 12px',
                }}>
                  {emp.firstName?.[0]}{emp.lastName?.[0]}
                </div>
            }
            <h2 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 4px' }}>{fullName}</h2>
            <p style={{ color: '#6366f1', fontSize: '13px', margin: '0 0 4px' }}>{emp.designation}</p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: '11px', fontFamily: 'monospace' }}>{emp.employeeId}</p>
            <div style={{ marginTop: '12px' }}>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                background: emp.status === 'Active' ? '#10b98122' : '#ef444422',
                color: emp.status === 'Active' ? '#10b981' : '#ef4444',
                border: `1px solid ${emp.status === 'Active' ? '#10b98144' : '#ef444444'}`,
              }}>{emp.status}</span>
            </div>
            {emp.resume && (
              <a href={`/${emp.resume}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: '14px', display: 'inline-flex' }}>
                📄 View Resume
              </a>
            )}
          </div>

          {/* Contact card */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</div>
            <InfoRow label="📧 Email" value={emp.email} small />
            <InfoRow label="📞 Phone" value={emp.phone} />
            {emp.alternatePhone && <InfoRow label="📞 Alt." value={emp.alternatePhone} />}
            {emp.address?.city && <InfoRow label="📍 City" value={`${emp.address.city}, ${emp.address.state}`} />}
          </div>

          {/* Employment card */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employment</div>
            <InfoRow label="Department" value={emp.department?.name} />
            <InfoRow label="Type" value={emp.employmentType} />
            <InfoRow label="Joined" value={emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : '—'} />
            {emp.salary && <InfoRow label="Salary" value={`₹${Number(emp.salary).toLocaleString()}/mo`} />}
          </div>
        </div>

        {/* ── Right Content ── */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--color-background-secondary)', padding: '5px', borderRadius: '12px', border: '0.5px solid var(--color-border-tertiary)' }}>
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                  background: activeTab === t ? '#6366f1' : 'transparent',
                  color: activeTab === t ? '#fff' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === t ? 700 : 500, fontSize: '12px',
                  cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
                }}
              >{t}</button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '14px' }}>Personal Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                  {[
                    ['Date of Birth', emp.dateOfBirth ? new Date(emp.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                    ['Gender', emp.gender || '—'],
                    ['Blood Group', emp.bloodGroup || '—'],
                    ['Previous Company', emp.previousCompany || '—'],
                  ].map(([l, v]) => <InfoRow key={l} label={l} value={v} />)}
                </div>
              </div>

              {(emp.address?.street || emp.address?.city) && (
                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>Address</div>
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: 0 }}>
                    {[emp.address.street, emp.address.city, emp.address.state, emp.address.country, emp.address.zipCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {emp.emergencyContact?.name && (
                <div className="card">
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>Emergency Contact</div>
                  <InfoRow label="Name" value={emp.emergencyContact.name} />
                  <InfoRow label="Relationship" value={emp.emergencyContact.relationship} />
                  <InfoRow label="Phone" value={emp.emergencyContact.phone} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>Education History</div>
              {emp.education?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {emp.education.map((edu, i) => (
                    <div key={i} style={{ padding: '14px', background: 'var(--color-background-primary)', borderRadius: '10px', border: '0.5px solid var(--color-border-tertiary)' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{edu.degree}</div>
                      <div style={{ color: '#6366f1', fontSize: '13px', marginTop: '2px' }}>{edu.institution}</div>
                      {edu.fieldOfStudy && <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', marginTop: '2px' }}>{edu.fieldOfStudy}</div>}
                      <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
                        {edu.startYear} — {edu.endYear || 'Present'} {edu.grade && `· Grade: ${edu.grade}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState text="No education records" />}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>Work Experience</div>
              {emp.experience?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {emp.experience.map((exp, i) => (
                    <div key={i} style={{ padding: '14px', background: 'var(--color-background-primary)', borderRadius: '10px', border: '0.5px solid var(--color-border-tertiary)' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{exp.jobTitle}</div>
                      <div style={{ color: '#6366f1', fontSize: '13px', marginTop: '2px' }}>{exp.company}</div>
                      {exp.location && <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', marginTop: '2px' }}>📍 {exp.location}</div>}
                      <div style={{ color: 'var(--color-text-tertiary)', fontSize: '12px', marginTop: '4px' }}>
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                        {' — '}
                        {exp.currentlyWorking ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : '—'}
                      </div>
                      {exp.description && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : <EmptyState text="No experience records" />}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>Skills & Technologies</div>
              {emp.skills?.length > 0
                ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {emp.skills.map(s => (
                      <span key={s} style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        background: '#6366f111', color: '#6366f1', border: '1px solid #6366f133',
                      }}>{s}</span>
                    ))}
                  </div>
                : <EmptyState text="No skills listed" />
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, small }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
      <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', minWidth: '100px' }}>{label}</span>
      <span style={{ fontSize: small ? '11px' : '13px', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all' }}>{value || '—'}</span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-tertiary)', fontSize: '14px' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
      {text}
    </div>
  );
}