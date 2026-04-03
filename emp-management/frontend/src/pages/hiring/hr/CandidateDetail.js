import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// import api from '../../../utils/api';
import api from '../../../utils/api';
import { stageColor, platformColor, fmtDate, fmtMoney, STAGES, initials, avColor } from '../../../utils/helpers';

const REQUIRED_DOCS = [
  { type: 'id_proof', label: 'ID Proof (Aadhaar/PAN)' },
  { type: 'address_proof', label: 'Address Proof' },
  { type: 'degree_certificate', label: 'Degree Certificate' },
  { type: 'experience_letter', label: 'Experience Letter' },
  { type: 'relieving_letter', label: 'Relieving Letter' },
  { type: 'salary_slips', label: 'Previous Salary Slips' },
  { type: 'bank_details', label: 'Bank Details' },
  { type: 'passport_photo', label: 'Passport Photo' },
];

const docStatusColor = { Pending: 'amber', Verified: 'green', Rejected: 'red', Missing: 'red' };

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cand, setCand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showStageModal, setShowStageModal] = useState(false);
  const [showIntModal, setShowIntModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [stageForm, setStageForm] = useState({ stage: '', note: '' });
  const [intForm, setIntForm] = useState({ round: '', mode: 'Video Call', scheduledAt: '', meetingLink: '', rating: '', technicalScore: '', communicationScore: '', cultureFitScore: '', feedback: '', strengths: '', weaknesses: '', recommendation: '', status: 'Scheduled' });
  const [offerForm, setOfferForm] = useState({ salary: '', stipend: '', designation: '', joiningDate: '' });
  const [offerFile, setOfferFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [editIntIdx, setEditIntIdx] = useState(null);

  // const fetchCand = useCallback(() => {
  //   api.get(`/candidates/${id}`).then(r => setCand(r.data)).catch(() => navigate('/hiring/candidates')).finally(() => setLoading(false));
  // }, [id]);

  // useEffect(() => { fetchCand(); }, [fetchCand]);

  // const updateStage = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await api.patch(`/candidates/${id}/stage`, stageForm);
  //     toast.success('Stage updated!'); setShowStageModal(false); fetchCand();
  //   } catch (err) { toast.error('Error'); }
  // };

  // const addInterview = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (editIntIdx !== null) {
  //       const intId = cand.interviews[editIntIdx]._id;
  //       await api.put(`/candidates/${id}/interviews/${intId}`, intForm);
  //       toast.success('Interview updated!');
  //     } else {
  //       await api.post(`/candidates/${id}/interviews`, intForm);
  //       toast.success('Interview added!');
  //     }
  //     setShowIntModal(false); setEditIntIdx(null); fetchCand();
  //   } catch (err) { toast.error('Error'); }
  // };

//   const fetchCand = useCallback(() => {
//   api.get(`/hiring/candidates/${id}`)
//     .then(r => setCand(r.data))
//     .catch(() => navigate('/hiring/candidates'))
//     .finally(() => setLoading(false));
// }, [id]);
const fetchCand = useCallback(() => {
  setLoading(true);
  api.get(`/hiring/candidates/${id}`)
    .then(r => setCand(r.data))
    .catch(() => navigate('/hiring/candidates'))
    .finally(() => setLoading(false));
}, [id, navigate]); // 👈 add navigate


useEffect(() => { fetchCand(); }, [fetchCand]);

const updateStage = async (e) => {
  e.preventDefault();
  try {
    await api.patch(`/hiring/candidates/${id}/stage`, stageForm);
    toast.success('Stage updated!');
    setShowStageModal(false);
    fetchCand();
  } catch (err) {
    toast.error('Error');
  }
};

const addInterview = async (e) => {
  e.preventDefault();
  try {
    if (editIntIdx !== null) {
      const intId = cand.interviews[editIntIdx]._id;
      await api.put(`/hiring/candidates/${id}/interviews/${intId}`, intForm);
      toast.success('Interview updated!');
    } else {
      await api.post(`/hiring/candidates/${id}/interviews`, intForm);
      toast.success('Interview added!');
    }
    setShowIntModal(false);
    setEditIntIdx(null);
    fetchCand();
  } catch (err) {
    toast.error('Error');
  }
};


  const uploadOffer = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(offerForm).forEach(k => { if (offerForm[k]) fd.append(k, offerForm[k]); });
      if (offerFile) fd.append('offerLetter', offerFile);
      await api.post(`/hiring/documents/${id}/offer-letter`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Offer letter uploaded!'); setShowOfferModal(false); fetchCand();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateOfferStatus = async (status) => {
    const reason = status === 'Rejected' ? window.prompt('Rejection reason?') : '';
    try {
      await api.patch(`/hiring/documents/${id}/offer-status`, { status, rejectionReason: reason });
      toast.success('Offer status updated!'); fetchCand();
    } catch { toast.error('Error'); }
  };

  const uploadDoc = async (e) => {
    e.preventDefault();
    if (!docFile) return toast.error('Select a file');
    const fd = new FormData();
    fd.append('documents', docFile);
    fd.append('type', docType);
    fd.append('name', docName || docFile.name);
    try {
      await api.post(`/hiring/documents/${id}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      // await api.post(`/hiring/documents/${id}/documents`, fd);

      toast.success('Document uploaded!'); setShowDocModal(false); setDocFile(null); setDocType(''); setDocName(''); fetchCand();
    } catch { toast.error('Error uploading'); }
  };




  const markMissing = async (type, label) => {
    try {
      await api.post(`/hiring/documents/${id}/documents/mark`, { type, name: label, status: 'Missing', remarks: 'Not yet received' });
      toast.success('Marked as missing'); fetchCand();
    } catch { toast.error('Error'); }
  };

  const verifyDoc = async (docId, status) => {
    const remarks = status === 'Rejected' ? window.prompt('Rejection reason?') : '';
    try {
      await api.patch(`/hiring/documents/${id}/documents/${docId}/verify`, { status, remarks });
      toast.success(`Document ${status.toLowerCase()}`); fetchCand();
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="loading"><div className="spin" /></div>;
  if (!cand) return null;

  const offerSent = ['Offer Sent', 'Offer Accepted', 'Offer Rejected', 'Joined'].includes(cand.stage);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/hiring/candidates')}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>{cand.name}</h1>
            <span className={`badge ${stageColor(cand.stage)}`}>{cand.stage}</span>
            {cand.source?.platform && <span className={`badge ${platformColor(cand.source.platform)}`}>{cand.source.platform}</span>}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{cand.currentDesignation || ''} {cand.currentCompany ? `@ ${cand.currentCompany}` : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => { setStageForm({ stage: cand.stage, note: '' }); setShowStageModal(true); }}>Update Stage</button>
          <button className="btn btn-outline btn-sm" onClick={() => { setIntForm({ round: '', mode: 'Video Call', scheduledAt: '', meetingLink: '', rating: '', technicalScore: '', communicationScore: '', cultureFitScore: '', feedback: '', strengths: '', weaknesses: '', recommendation: '', status: 'Scheduled' }); setEditIntIdx(null); setShowIntModal(true); }}>+ Interview</button>
          {!offerSent && cand.stage === 'Selected' && <button className="btn btn-success btn-sm" onClick={() => setShowOfferModal(true)}>Send Offer</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['overview', 'interviews', 'offer', 'documents', 'timeline'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="sidebar-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <div className="av" style={{ width: 72, height: 72, background: avColor(cand.name), color: 'white', fontSize: '28px', margin: '0 auto 12px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{initials(cand.name)}</div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{cand.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{cand.email}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{cand.phone}</p>
              {cand.resume?.url && <a href={cand.resume.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: '14px', display: 'inline-flex' }}>📄 View Resume</a>}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '10px' }}>Job Details</div>
              <div className="info-row"><span className="info-label">Position</span><span className="info-val">{cand.job?.title || cand.jobTitle || '—'}</span></div>
              <div className="info-row"><span className="info-label">Dept</span><span className="info-val">{cand.job?.department || '—'}</span></div>
              <div className="info-row"><span className="info-label">Source</span><span className="info-val">{cand.source?.platform || '—'}</span></div>
              {cand.source?.referredBy && <div className="info-row"><span className="info-label">Referred By</span><span className="info-val">{cand.source.referredBy}</span></div>}
              <div className="info-row"><span className="info-label">Assigned To</span><span className="info-val">{cand.assignedTo?.name || '—'}</span></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px' }}>Professional Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
                {[['Current Company', cand.currentCompany], ['Designation', cand.currentDesignation], ['Total Exp', cand.totalExperience], ['Relevant Exp', cand.relevantExperience], ['Current CTC', fmtMoney(cand.currentCTC)], ['Expected CTC', fmtMoney(cand.expectedCTC)], ['Notice Period', cand.noticePeriod], ['Location', cand.currentLocation]].map(([l, v]) => (
                  <div key={l} className="info-row"><span className="info-label">{l}</span><span className="info-val">{v || '—'}</span></div>
                ))}
              </div>
            </div>
            {cand.skills?.length > 0 && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: '12px' }}>Skills</div>
                <div className="skills-wrap">{cand.skills.map(s => <span key={s} className="skill-pill">{s}</span>)}</div>
              </div>
            )}
            {cand.notes && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: '8px' }}>Notes</div>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{cand.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interviews */}
      {tab === 'interviews' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button className="btn btn-primary" onClick={() => { setIntForm({ round: '', mode: 'Video Call', scheduledAt: '', meetingLink: '', rating: '', technicalScore: '', communicationScore: '', cultureFitScore: '', feedback: '', strengths: '', weaknesses: '', recommendation: '', status: 'Scheduled' }); setEditIntIdx(null); setShowIntModal(true); }}>+ Schedule Interview</button>
          </div>
          {cand.interviews?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cand.interviews.map((iv, i) => (
                <div key={iv._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700 }}>{iv.round || `Round ${i + 1}`}</h3>
                        <span className={`badge badge-${iv.status === 'Completed' ? 'green' : iv.status === 'Cancelled' ? 'red' : 'blue'}`}>{iv.status}</span>
                        {iv.mode && <span className="badge badge-gray">{iv.mode}</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {iv.interviewerName || iv.interviewer?.name || 'Interviewer'}
                        {iv.scheduledAt && ` · ${fmtDate(iv.scheduledAt)} ${new Date(iv.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {iv.rating && <span style={{ fontSize: '14px' }}>{'⭐'.repeat(iv.rating)}</span>}
                      <button className="btn btn-ghost btn-sm" onClick={() => { setIntForm({ round: iv.round || '', mode: iv.mode || 'Video Call', scheduledAt: iv.scheduledAt ? iv.scheduledAt.split('T')[0] + 'T' + iv.scheduledAt.split('T')[1]?.slice(0, 5) : '', meetingLink: iv.meetingLink || '', rating: iv.rating || '', technicalScore: iv.technicalScore || '', communicationScore: iv.communicationScore || '', cultureFitScore: iv.cultureFitScore || '', feedback: iv.feedback || '', strengths: iv.strengths || '', weaknesses: iv.weaknesses || '', recommendation: iv.recommendation || '', status: iv.status || 'Scheduled' }); setEditIntIdx(i); setShowIntModal(true); }}>Edit</button>
                    </div>
                  </div>
                  {(iv.technicalScore || iv.communicationScore || iv.cultureFitScore) && (
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', padding: '10px', background: 'var(--bg-2)', borderRadius: '8px' }}>
                      {[['Technical', iv.technicalScore], ['Communication', iv.communicationScore], ['Culture Fit', iv.cultureFitScore]].map(([l, v]) => v !== undefined && v !== '' && (
                        <div key={l} style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: v >= 7 ? 'var(--success)' : v >= 5 ? 'var(--accent)' : 'var(--danger)' }}>{v}/10</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {iv.feedback && <div style={{ marginBottom: '8px' }}><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Feedback</span><p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '3px', lineHeight: 1.6 }}>{iv.feedback}</p></div>}
                  {iv.strengths && <div style={{ marginBottom: '4px' }}><span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 700 }}>STRENGTHS: </span><span style={{ fontSize: '13px' }}>{iv.strengths}</span></div>}
                  {iv.weaknesses && <div style={{ marginBottom: '4px' }}><span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 700 }}>AREAS OF IMPROVEMENT: </span><span style={{ fontSize: '13px' }}>{iv.weaknesses}</span></div>}
                  {iv.recommendation && <div style={{ marginTop: '8px' }}><span className={`badge badge-${iv.recommendation.includes('Recommend') && !iv.recommendation.includes('Not') ? 'green' : iv.recommendation.includes('Neutral') ? 'amber' : 'red'}`}>{iv.recommendation}</span></div>}
                  {iv.meetingLink && <a href={iv.meetingLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: '10px', display: 'inline-flex' }}>🔗 Join Meeting</a>}
                </div>
              ))}
            </div>
          ) : <div className="card"><div className="empty"><div className="empty-icon">📅</div><p>No interviews yet</p></div></div>}
        </div>
      )}

      {/* Offer */}
      {tab === 'offer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Offer Details</span>
              {!offerSent && cand.stage === 'Selected' && <button className="btn btn-success btn-sm" onClick={() => setShowOfferModal(true)}>Generate Offer</button>}
            </div>
            {cand.offer?.salary || cand.offer?.stipend ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {[['Salary / Stipend', cand.offer.salary ? fmtMoney(cand.offer.salary) : fmtMoney(cand.offer.stipend)], ['Designation', cand.offer.designation || '—'], ['Joining Date', fmtDate(cand.offer.joiningDate)]].map(([l, v]) => (
                    <div key={l} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-2)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>{v}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Acceptance Status: </span><span className={`badge badge-${cand.offer.acceptanceStatus === 'Accepted' ? 'green' : cand.offer.acceptanceStatus === 'Rejected' ? 'red' : 'amber'}`}>{cand.offer.acceptanceStatus}</span></div>
                  {cand.offer.offerLetterUrl && <a href={cand.offer.offerLetterUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📄 View Offer Letter</a>}
                  {cand.offer.acceptanceStatus === 'Pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => updateOfferStatus('Accepted')}>Mark Accepted</button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateOfferStatus('Rejected')}>Mark Rejected</button>
                    </>
                  )}
                  {cand.offer.offerLetterSentAt && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sent: {fmtDate(cand.offer.offerLetterSentAt)}</span>}
                </div>
              </>
            ) : (
              <div className="empty"><div className="empty-icon">📨</div><p>No offer generated yet</p><span>Mark candidate as 'Selected' first, then generate offer</span></div>
            )}
          </div>
          {cand.payslips?.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px' }}>Payslips</div>
              {cand.payslips.map((p, i) => (
                <div key={i} className="info-row">
                  <span className="info-label">{p.month} {p.year}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="info-val">{fmtMoney(p.amount)}</span>
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs">View</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents */}
      {tab === 'documents' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>Onboarding Documents</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Status: <span className={`badge badge-${cand.onboardingStatus === 'Completed' ? 'green' : cand.onboardingStatus === 'Documents Pending' ? 'amber' : 'gray'}`}>{cand.onboardingStatus}</span></p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { setDocType(''); setDocFile(null); setDocName(''); setShowDocModal(true); }}>Upload Document</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {REQUIRED_DOCS.map(req => {
              const found = cand.documents?.find(d => d.type === req.type);
              return (
                <div key={req.type} className="checklist-item">
                  <span style={{ fontSize: '16px' }}>{found?.status === 'Verified' ? '✅' : found?.status === 'Rejected' ? '❌' : found?.status === 'Pending' ? '⏳' : '⚠️'}</span>
                  <span className="doc-name">{req.label}</span>
                  <div className="doc-status">
                    {found ? (
                      <>
                        <span className={`badge badge-${docStatusColor[found.status]}`}>{found.status}</span>
                        {found.url && <a href={found.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs">View</a>}
                        {found.status === 'Pending' && (
                          <>
                            <button className="btn btn-success btn-xs" onClick={() => verifyDoc(found._id, 'Verified')}>Verify</button>
                            <button className="btn btn-danger btn-xs" onClick={() => verifyDoc(found._id, 'Rejected')}>Reject</button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="badge badge-gray">Not Received</span>
                        <button className="btn btn-danger btn-xs" onClick={() => markMissing(req.type, req.label)}>Mark Missing</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {cand.documents?.filter(d => !REQUIRED_DOCS.find(r => r.type === d.type)).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Additional Documents</h3>
              {cand.documents.filter(d => !REQUIRED_DOCS.find(r => r.type === d.type)).map(doc => (
                <div key={doc._id} className="checklist-item">
                  <span style={{ fontSize: '16px' }}>📄</span>
                  <span className="doc-name">{doc.name}</span>
                  <div className="doc-status">
                    <span className={`badge badge-${docStatusColor[doc.status]}`}>{doc.status}</span>
                    {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs">View</a>}
                    {doc.status === 'Pending' && (
                      <>
                        <button className="btn btn-success btn-xs" onClick={() => verifyDoc(doc._id, 'Verified')}>Verify</button>
                        <button className="btn btn-danger btn-xs" onClick={() => verifyDoc(doc._id, 'Rejected')}>Reject</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {tab === 'timeline' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: '16px' }}>Stage History</div>
          {cand.stageHistory?.length > 0 ? (
            <div className="timeline">
              {[...cand.stageHistory].reverse().map((h, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-stage">{h.stage}</div>
                  <div className="tl-meta">{h.movedByName || h.movedBy?.name || 'System'} · {fmtDate(h.date)} {h.date && new Date(h.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  {h.note && <div className="tl-note">{h.note}</div>}
                </div>
              ))}
            </div>
          ) : <div className="empty"><p>No history yet</p></div>}
        </div>
      )}

      {/* Stage Modal */}
      {showStageModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowStageModal(false)}>
          <div className="modal modal-sm">
            <div className="modal-hdr"><span className="modal-title">Update Stage</span><button className="close-btn" onClick={() => setShowStageModal(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <form onSubmit={updateStage}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="fg"><label>New Stage *</label>
                  <select value={stageForm.stage} onChange={e => setStageForm({ ...stageForm, stage: e.target.value })} required>
                    <option value="">Select Stage</option>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="fg"><label>Note</label><textarea value={stageForm.note} onChange={e => setStageForm({ ...stageForm, note: e.target.value })} placeholder="Add a note about this stage change..." /></div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowStageModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Stage</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interview Modal */}
      {showIntModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowIntModal(false)}>
          <div className="modal">
            <div className="modal-hdr"><span className="modal-title">{editIntIdx !== null ? 'Edit Interview' : 'Add Interview'}</span><button className="close-btn" onClick={() => setShowIntModal(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <form onSubmit={addInterview}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="fg"><label>Round Name</label><input value={intForm.round} onChange={e => setIntForm({ ...intForm, round: e.target.value })} placeholder="Technical Round 1" /></div>
                  <div className="fg"><label>Mode</label><select value={intForm.mode} onChange={e => setIntForm({ ...intForm, mode: e.target.value })}>{['In-person', 'Video Call', 'Phone', 'Technical Test', 'HR Round'].map(m => <option key={m}>{m}</option>)}</select></div>
                  <div className="fg"><label>Scheduled At</label><input type="datetime-local" value={intForm.scheduledAt} onChange={e => setIntForm({ ...intForm, scheduledAt: e.target.value })} /></div>
                  <div className="fg"><label>Status</label><select value={intForm.status} onChange={e => setIntForm({ ...intForm, status: e.target.value })}>{['Scheduled', 'Completed', 'Cancelled', 'No Show'].map(s => <option key={s}>{s}</option>)}</select></div>
                  <div className="fg"><label>Meeting Link</label><input value={intForm.meetingLink} onChange={e => setIntForm({ ...intForm, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." /></div>
                  <div className="fg"><label>Overall Rating (1-5)</label><input type="number" min="1" max="5" value={intForm.rating} onChange={e => setIntForm({ ...intForm, rating: e.target.value })} /></div>
                  <div className="fg"><label>Technical Score (0-10)</label><input type="number" min="0" max="10" value={intForm.technicalScore} onChange={e => setIntForm({ ...intForm, technicalScore: e.target.value })} /></div>
                  <div className="fg"><label>Communication (0-10)</label><input type="number" min="0" max="10" value={intForm.communicationScore} onChange={e => setIntForm({ ...intForm, communicationScore: e.target.value })} /></div>
                  <div className="fg"><label>Culture Fit (0-10)</label><input type="number" min="0" max="10" value={intForm.cultureFitScore} onChange={e => setIntForm({ ...intForm, cultureFitScore: e.target.value })} /></div>
                  <div className="fg"><label>Recommendation</label><select value={intForm.recommendation} onChange={e => setIntForm({ ...intForm, recommendation: e.target.value })}><option value="">Select</option>{['Strongly Recommend', 'Recommend', 'Neutral', 'Not Recommend', 'Strong Reject'].map(r => <option key={r}>{r}</option>)}</select></div>
                  <div className="fg full"><label>Feedback / Notes</label><textarea value={intForm.feedback} onChange={e => setIntForm({ ...intForm, feedback: e.target.value })} rows={3} placeholder="Overall interview feedback..." /></div>
                  <div className="fg"><label>Strengths</label><textarea value={intForm.strengths} onChange={e => setIntForm({ ...intForm, strengths: e.target.value })} rows={2} placeholder="Candidate strengths observed..." /></div>
                  <div className="fg"><label>Areas of Improvement</label><textarea value={intForm.weaknesses} onChange={e => setIntForm({ ...intForm, weaknesses: e.target.value })} rows={2} placeholder="Areas needing improvement..." /></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowIntModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editIntIdx !== null ? 'Update' : 'Add Interview'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowOfferModal(false)}>
          <div className="modal modal-sm">
            <div className="modal-hdr"><span className="modal-title">Upload Offer Letter</span><button className="close-btn" onClick={() => setShowOfferModal(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <form onSubmit={uploadOffer}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="fg"><label>Offered Salary (₹)</label><input type="number" value={offerForm.salary} onChange={e => setOfferForm({ ...offerForm, salary: e.target.value })} placeholder="1500000" /></div>
                <div className="fg"><label>Stipend (₹) — for interns</label><input type="number" value={offerForm.stipend} onChange={e => setOfferForm({ ...offerForm, stipend: e.target.value })} /></div>
                <div className="fg"><label>Designation</label><input value={offerForm.designation} onChange={e => setOfferForm({ ...offerForm, designation: e.target.value })} placeholder="Senior Developer" /></div>
                <div className="fg"><label>Joining Date</label><input type="date" value={offerForm.joiningDate} onChange={e => setOfferForm({ ...offerForm, joiningDate: e.target.value })} /></div>
                <div className="fg"><label>Offer Letter (PDF)</label>
                  <div className="upload-zone" onClick={() => document.getElementById('olUpload').click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p>{offerFile ? offerFile.name : 'Upload offer letter PDF'}</p>
                  </div>
                  <input id="olUpload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setOfferFile(e.target.files[0])} />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowOfferModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Send Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doc Upload Modal */}
      {showDocModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDocModal(false)}>
          <div className="modal modal-sm">
            <div className="modal-hdr"><span className="modal-title">Upload Document</span><button className="close-btn" onClick={() => setShowDocModal(false)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            <form onSubmit={uploadDoc}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="fg"><label>Document Type *</label>
                  <select value={docType} onChange={e => setDocType(e.target.value)} required>
                    <option value="">Select Type</option>
                    {REQUIRED_DOCS.map(d => <option key={d.type} value={d.type}>{d.label}</option>)}
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="fg"><label>Document Name</label><input value={docName} onChange={e => setDocName(e.target.value)} placeholder="Auto-filled from file name" /></div>
                <div className="fg"><label>File *</label>
                  <div className="upload-zone" onClick={() => document.getElementById('docUpload').click()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <p>{docFile ? docFile.name : 'Click to upload'}</p><span className="sub">PDF, DOC, JPG, PNG</span>
                  </div>
                  <input id="docUpload" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setDocFile(e.target.files[0])} />
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-ghost" onClick={() => setShowDocModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
