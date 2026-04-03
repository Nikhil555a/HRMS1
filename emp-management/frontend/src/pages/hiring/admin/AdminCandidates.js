import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { stageColor, platformColor, fmtDate, STAGES } from '../../../utils/helpers';

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const navigate = useNavigate();

  const fetch = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;
    if (filterStage) params.stage = filterStage;
    api.get('/admin/all-candidates', { params })
      .then(r => { setCandidates(r.data.candidates); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page, search, filterStage]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>All Candidates</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{total} total across all HRs</p>
      </div>

      <div className="filter-bar">
        {/* <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search candidates..." />
        </div> */}
        <select value={filterStage} onChange={e => { setFilterStage(e.target.value); setPage(1); }} style={{ minWidth: '160px' }}>
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(search || filterStage) && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStage(''); }}>Clear</button>}
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spin" /></div> : (
          <>
            <div className="tbl-wrap">
              <table>
                <thead><tr><th>Candidate</th><th>Position</th><th>Source</th><th>Assigned HR</th><th>Stage</th><th>Added</th></tr></thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/hiring/candidates/${c._id}`)}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email}</div>
                      </td>
                      <td style={{ fontSize: '12px' }}>{c.job?.title || '—'}</td>
                      <td>{c.source?.platform ? <span className={`badge ${platformColor(c.source.platform)}`}>{c.source.platform}</span> : '—'}</td>
                      <td style={{ fontSize: '12px' }}>{c.assignedTo?.name || '—'}</td>
                      <td><span className={`badge ${stageColor(c.stage)}`}>{c.stage}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fmtDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {candidates.length === 0 && <div className="empty"><div className="empty-icon">👥</div><p>No candidates found</p></div>}
            </div>
            {pages > 1 && (
              <div className="pag">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
                <span className="pag-info">Page {page} of {pages}</span>
                <button className="pag-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
