import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { stageColor, fmtDate } from '../../../utils/helpers';

export default function Documents() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const stages = ['Offer Accepted', 'Joined', 'Offer Sent'];
    api.get('/hiring/candidates', { params: { limit: 100 } })
      .then(r => setCandidates(r.data.candidates || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = candidates.filter(c => {
    if (filter === 'offer_pending') return c.stage === 'Offer Sent';
    if (filter === 'offer_accepted') return c.stage === 'Offer Accepted';
    if (filter === 'docs_pending') return ['Offer Accepted', 'Joined'].includes(c.stage);
    if (filter === 'joined') return c.stage === 'Joined';
    return ['Selected', 'Offer Sent', 'Offer Accepted', 'Joined'].includes(c.stage);
  });

  if (loading) return <div className="loading"><div className="spin" /></div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Document Tracking</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>Offer letters, onboarding documents, payslips</p>
      </div>

      <div className="stats-row" style={{ marginBottom: '20px' }}>
        {[
          ['Offer Pending', candidates.filter(c => c.stage === 'Offer Sent').length, 'amber', '📨'],
          ['Offer Accepted', candidates.filter(c => c.stage === 'Offer Accepted').length, 'green', '✅'],
          ['Offer Rejected', candidates.filter(c => c.stage === 'Offer Rejected').length, 'red', '❌'],
          ['Joined', candidates.filter(c => c.stage === 'Joined').length, 'teal', '🎉'],
        ].map(([l, v, c, icon]) => (
          <div key={l} className={`stat-tile ${c}`} style={{ cursor: 'pointer' }}>
            <div className={`stat-val ${c}`}>{v}</div><div className="stat-lbl">{l}</div><div className="stat-icon">{icon}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: '16px' }}>
        {[['all', 'All'], ['offer_pending', 'Offer Pending'], ['offer_accepted', 'Offer Accepted'], ['docs_pending', 'Docs Pending'], ['joined', 'Joined']].map(([val, label]) => (
          <button key={val} className={`btn ${filter === val ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilter(val)}>{label}</button>
        ))}
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Candidate</th><th>Position</th><th>Stage</th><th>Offer Status</th><th>Onboarding</th><th>Joining Date</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td style={{ fontSize: '12px' }}>{c.job?.title || '—'}</td>
                  <td><span className={`badge ${stageColor(c.stage)}`}>{c.stage}</span></td>
                  <td>
                    {c.offer?.acceptanceStatus ? (
                      <span className={`badge badge-${c.offer.acceptanceStatus === 'Accepted' ? 'green' : c.offer.acceptanceStatus === 'Rejected' ? 'red' : 'amber'}`}>{c.offer.acceptanceStatus}</span>
                    ) : <span className="badge badge-gray">No Offer</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${c.onboardingStatus === 'Completed' ? 'green' : c.onboardingStatus === 'Documents Pending' ? 'amber' : 'gray'}`}>{c.onboardingStatus}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.joiningDate ? fmtDate(c.joiningDate) : c.offer?.joiningDate ? fmtDate(c.offer.joiningDate) : '—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/hiring/candidates/${c._id}`)}>View Docs</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty"><div className="empty-icon">📂</div><p>No records found</p></div>}
        </div>
      </div>
    </div>
  );
}
