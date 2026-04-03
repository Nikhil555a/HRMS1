

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const EMPTY_EDU = { degree: '', institution: '', fieldOfStudy: '', startYear: '', endYear: '', grade: '' };
const EMPTY_EXP = { jobTitle: '', company: '', location: '', startDate: '', endDate: '', currentlyWorking: false, description: '' };

export default function EmployeeForm({ employee, departments, onClose, onSaved }) {
  const isEdit = !!employee;
  const [tab, setTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
    employeeId: employee?.employeeId || '',
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    alternatePhone: employee?.alternatePhone || '',
    dateOfBirth: employee?.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
    gender: employee?.gender || '',
    department: employee?.department?._id || employee?.department || '',
    designation: employee?.designation || '',
    appliedPosition: employee?.appliedPosition || '',
    employmentType: employee?.employmentType || 'Full-time',
    status: employee?.status || 'Active',
    joiningDate: employee?.joiningDate ? employee.joiningDate.split('T')[0] : '',
    closingDate: employee?.closingDate ? employee.closingDate.split('T')[0] : '',
    salary: employee?.salary || '',
    previousCompany: employee?.previousCompany || '',
    bloodGroup: employee?.bloodGroup || '',
    password: '', // ← NEW: employee portal login password
    skills: employee?.skills || [],
    education: employee?.education || [],
    experience: employee?.experience || [],
    address: employee?.address || { street: '', city: '', state: '', country: '', zipCode: '' },
    emergencyContact: employee?.emergencyContact || { name: '', relationship: '', phone: '' }
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setAddr = (field, val) => setForm(f => ({ ...f, address: { ...f.address, [field]: val } }));
  const setEmerg = (field, val) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [field]: val } }));

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      set('skills', [...form.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };
  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));

  const addEdu = () => set('education', [...form.education, { ...EMPTY_EDU }]);
  const removeEdu = (i) => set('education', form.education.filter((_, idx) => idx !== i));
  const setEdu = (i, field, val) => {
    const arr = [...form.education];
    arr[i] = { ...arr[i], [field]: val };
    set('education', arr);
  };

  const addExp = () => set('experience', [...form.experience, { ...EMPTY_EXP }]);
  const removeExp = (i) => set('experience', form.experience.filter((_, idx) => idx !== i));
  const setExp = (i, field, val) => {
    const arr = [...form.experience];
    arr[i] = { ...arr[i], [field]: val };
    set('experience', arr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'skills') {
          fd.append('skills', form.skills.join(','));
        } else if (['education', 'experience', 'address', 'emergencyContact'].includes(key)) {
          fd.append(key, JSON.stringify(form[key]));
        } else if (key === 'password') {
          // Only send password if filled (on edit it's optional — blank = keep existing)
          if (form.password) fd.append('password', form.password);
        } else if (form[key] !== '' && form[key] !== null && form[key] !== undefined) {
          fd.append(key, form[key]);
        }
      });
      if (profilePhoto) fd.append('profilePhoto', profilePhoto);
      if (resume) fd.append('resume', resume);

      if (isEdit) {
        await api.put(`/employees/${employee._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Employee updated successfully!');
      } else {
        await api.post('/employees', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Employee added successfully!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving employee');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['basic', 'background', 'skills', 'documents'];
  const tabLabels = { basic: 'Basic Info', background: 'Education & Experience', skills: 'Skills & Position', documents: 'Documents & Status' };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">

        {/* ── Header ── */}
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Employee' : 'Add New Employee'}</span>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Tab Nav ── */}
        <div className="tabs" style={{ padding: '0 24px', marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {tabLabels[t]}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">

            {/* ════════ TAB: Basic Info ════════ */}
            {tab === 'basic' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input value={form.employeeId} onChange={e => set('employeeId', e.target.value)} required placeholder="EMP001" />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select value={form.department} onChange={e => set('department', e.target.value)} required>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>First Name *</label>
                  <input value={form.firstName} onChange={e => set('firstName', e.target.value)} required placeholder="John" />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input value={form.lastName} onChange={e => set('lastName', e.target.value)} required placeholder="Doe" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="john@company.com" />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+91 9876543210" />
                </div>

                {/* ── PASSWORD (NEW) ── */}
                <div className="form-group">
                  <label>{isEdit ? 'Password (blank = unchanged)' : 'Password *'}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder={isEdit ? '••••••• (leave blank to keep)' : 'Min. 6 characters'}
                      required={!isEdit}
                      style={{ paddingRight: '42px' }}
                    />
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: '15px', padding: 0, lineHeight: 1,
                      }}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    {isEdit ? 'Only fill to change the password' : 'Employee will use this to login to their portal'}
                  </span>
                </div>

                <div className="form-group">
                  <label>Alternate Phone</label>
                  <input value={form.alternatePhone} onChange={e => set('alternatePhone', e.target.value)} placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>

                {/* Address */}
                <div className="section-divider full" style={{ gridColumn: '1/-1' }}><span>Address</span></div>
                <div className="form-group full">
                  <label>Street</label>
                  <input value={form.address.street} onChange={e => setAddr('street', e.target.value)} placeholder="123 Main St" />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input value={form.address.city} onChange={e => setAddr('city', e.target.value)} placeholder="Mumbai" />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input value={form.address.state} onChange={e => setAddr('state', e.target.value)} placeholder="Maharashtra" />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input value={form.address.country} onChange={e => setAddr('country', e.target.value)} placeholder="India" />
                </div>
                <div className="form-group">
                  <label>Zip Code</label>
                  <input value={form.address.zipCode} onChange={e => setAddr('zipCode', e.target.value)} placeholder="400001" />
                </div>

                {/* Emergency Contact */}
                <div className="section-divider" style={{ gridColumn: '1/-1' }}><span>Emergency Contact</span></div>
                <div className="form-group">
                  <label>Contact Name</label>
                  <input value={form.emergencyContact.name} onChange={e => setEmerg('name', e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="form-group">
                  <label>Relationship</label>
                  <input value={form.emergencyContact.relationship} onChange={e => setEmerg('relationship', e.target.value)} placeholder="Spouse" />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input value={form.emergencyContact.phone} onChange={e => setEmerg('phone', e.target.value)} placeholder="+91 9876543210" />
                </div>
              </div>
            )}

            {/* ════════ TAB: Education & Experience ════════ */}
            {tab === 'background' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Education</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addEdu}>+ Add</button>
                </div>
                {form.education.map((edu, i) => (
                  <div key={i} className="card" style={{ marginBottom: '12px', padding: '16px', background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Education #{i + 1}</span>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeEdu(i)}>Remove</button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group"><label>Degree</label><input value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} placeholder="B.Tech / MBA" /></div>
                      <div className="form-group"><label>Institution</label><input value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder="IIT Delhi" /></div>
                      <div className="form-group"><label>Field of Study</label><input value={edu.fieldOfStudy} onChange={e => setEdu(i, 'fieldOfStudy', e.target.value)} placeholder="Computer Science" /></div>
                      <div className="form-group"><label>Grade / CGPA</label><input value={edu.grade} onChange={e => setEdu(i, 'grade', e.target.value)} placeholder="8.5 / First Class" /></div>
                      <div className="form-group"><label>Start Year</label><input type="number" value={edu.startYear} onChange={e => setEdu(i, 'startYear', e.target.value)} placeholder="2018" /></div>
                      <div className="form-group"><label>End Year</label><input type="number" value={edu.endYear} onChange={e => setEdu(i, 'endYear', e.target.value)} placeholder="2022" /></div>
                    </div>
                  </div>
                ))}
                {form.education.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>No education records. Click "+ Add" to add.</p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Work Experience</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addExp}>+ Add</button>
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Previous Company</label>
                  <input value={form.previousCompany} onChange={e => set('previousCompany', e.target.value)} placeholder="Previous employer name" />
                </div>
                {form.experience.map((exp, i) => (
                  <div key={i} className="card" style={{ marginBottom: '12px', padding: '16px', background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Experience #{i + 1}</span>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeExp(i)}>Remove</button>
                    </div>
                    <div className="form-grid">
                      <div className="form-group"><label>Job Title</label><input value={exp.jobTitle} onChange={e => setExp(i, 'jobTitle', e.target.value)} placeholder="Software Engineer" /></div>
                      <div className="form-group"><label>Company</label><input value={exp.company} onChange={e => setExp(i, 'company', e.target.value)} placeholder="TCS / Infosys" /></div>
                      <div className="form-group"><label>Location</label><input value={exp.location} onChange={e => setExp(i, 'location', e.target.value)} placeholder="Pune, India" /></div>
                      <div className="form-group"><label>Start Date</label><input type="date" value={exp.startDate ? exp.startDate.split('T')[0] : ''} onChange={e => setExp(i, 'startDate', e.target.value)} /></div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input type="date" value={exp.endDate ? exp.endDate.split('T')[0] : ''} onChange={e => setExp(i, 'endDate', e.target.value)} disabled={exp.currentlyWorking} />
                      </div>
                      <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                        <label style={{ flexDirection: 'row', gap: '8px', alignItems: 'center', display: 'flex', marginTop: '24px' }}>
                          <input type="checkbox" checked={exp.currentlyWorking} onChange={e => setExp(i, 'currentlyWorking', e.target.checked)} />
                          Currently Working
                        </label>
                      </div>
                      <div className="form-group full">
                        <label>Description</label>
                        <textarea value={exp.description} onChange={e => setExp(i, 'description', e.target.value)} placeholder="Key responsibilities..." />
                      </div>
                    </div>
                  </div>
                ))}
                {form.experience.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No experience records. Click "+ Add" to add.</p>
                )}
              </div>
            )}

            {/* ════════ TAB: Skills & Position ════════ */}
            {tab === 'skills' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Designation *</label>
                  <input value={form.designation} onChange={e => set('designation', e.target.value)} required placeholder="Software Engineer" />
                </div>
                <div className="form-group">
                  <label>Applied Position</label>
                  <input value={form.appliedPosition} onChange={e => set('appliedPosition', e.target.value)} placeholder="Senior Developer" />
                </div>
                <div className="form-group">
                  <label>Employment Type</label>
                  <select value={form.employmentType} onChange={e => set('employmentType', e.target.value)}>
                    {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Skills</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Type a skill and press Enter or Add"
                      style={{ flex: 1 }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={addSkill}>Add</button>
                  </div>
                  <div className="skills-wrap" style={{ marginTop: '10px' }}>
                    {form.skills.map(s => (
                      <span key={s} className="skill-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {s}
                        <button type="button" onClick={() => removeSkill(s)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', padding: '0', lineHeight: 1, fontSize: '14px' }}>
                          ×
                        </button>
                      </span>
                    ))}
                    {form.skills.length === 0 && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No skills added yet</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ════════ TAB: Documents & Status ════════ */}
            {tab === 'documents' && (
              <div className="form-grid">
                <div className="form-group">
                  <label>Joining Date *</label>
                  <input type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Closing Date</label>
                  <input type="date" value={form.closingDate} onChange={e => set('closingDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}>
                    {['Active', 'Inactive', 'On Leave', 'Terminated', 'Resigned'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Salary (₹)</label>
                  <input type="number" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="50000" />
                </div>
                <div className="form-group full">
                  <label>Profile Photo</label>
                  <div className="upload-zone" onClick={() => document.getElementById('photoInput').click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p>{profilePhoto ? profilePhoto.name : employee?.profilePhoto ? 'Photo uploaded ✓' : 'Click to upload profile photo'}</p>
                    <span style={{ fontSize: '12px' }}>JPG, PNG up to 5MB</span>
                  </div>
                  <input id="photoInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setProfilePhoto(e.target.files[0])} />
                </div>
                <div className="form-group full">
                  <label>Resume / CV</label>
                  <div className="upload-zone" onClick={() => document.getElementById('resumeInput').click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <p>{resume ? resume.name : employee?.resume ? 'Resume uploaded ✓' : 'Click to upload resume/CV'}</p>
                    <span style={{ fontSize: '12px' }}>PDF, DOC, DOCX up to 5MB</span>
                  </div>
                  <input id="resumeInput" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => setResume(e.target.files[0])} />
                </div>
              </div>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            {tab !== 'documents' && (
              <button type="button" className="btn btn-secondary" onClick={() => setTab(tabs[tabs.indexOf(tab) + 1])}>
                Next →
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}