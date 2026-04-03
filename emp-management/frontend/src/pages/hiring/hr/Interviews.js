import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { fmtDate } from '../../../utils/helpers';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/hiring/interviews', { params: filterStatus ? { status: filterStatus } : {} })
      .then(r => setInterviews(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [filterStatus]);

  const statuses = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
  const modeIcon = { 'Video Call': '🎥', 'In-person': '🏢', 'Phone': '📞', 'Technical Test': '💻', 'HR Round': '👤' };

  if (loading) return <div className="loading"><div className="spin" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>Interviews</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{interviews.length} interview records</p>
        </div>
        <div className="filter-bar" style={{ margin: 0 }}>
          {['', ...statuses].map(s => (
            <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilterStatus(s)}>{s || 'All'}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {interviews.map((item, i) => (
          <div key={i} className="card" style={{ cursor: 'pointer', borderLeft: `3px solid ${item.interview.status === 'Completed' ? 'var(--success)' : item.interview.status === 'Cancelled' ? 'var(--danger)' : 'var(--primary)'}` }}
            onClick={() => navigate(`/hiring/candidates/${item.candidate._id}`)}>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{item.candidate.name}</span>
                  <span className={`badge badge-${item.interview.status === 'Completed' ? 'green' : item.interview.status === 'Cancelled' ? 'red' : item.interview.status === 'No Show' ? 'amber' : 'blue'}`}>{item.interview.status}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.job?.title || 'N/A'}</div>
              </div>
              <div style={{ fontSize: '22px' }}>{modeIcon[item.interview.mode] || '📋'}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
              {item.interview.round && <span>🔁 {item.interview.round}</span>}
              {item.interview.mode && <span>{item.interview.mode}</span>}
              {item.interview.scheduledAt && <span>📅 {fmtDate(item.interview.scheduledAt)} {new Date(item.interview.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
            {item.interview.rating && <div style={{ marginTop: '8px', fontSize: '14px' }}>{'⭐'.repeat(item.interview.rating)}</div>}
            {item.interview.recommendation && <div style={{ marginTop: '8px' }}><span className={`badge badge-${item.interview.recommendation.includes('Recommend') && !item.interview.recommendation.includes('Not') ? 'green' : item.interview.recommendation.includes('Neutral') ? 'amber' : 'red'}`}>{item.interview.recommendation}</span></div>}
            {item.interview.feedback && <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.interview.feedback}</p>}
          </div>
        ))}
        {interviews.length === 0 && (
          <div style={{ gridColumn: '1/-1' }} className="card">
            <div className="empty"><div className="empty-icon">📅</div><p>No interviews yet</p><span>Add interviews from candidate profiles</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
