import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { fmtDate, fmtMoney } from '../../../utils/helpers';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/all-jobs').then(r => setJobs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusColor = { Draft: 'gray', Active: 'green', Paused: 'amber', Closed: 'red', Filled: 'teal' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800 }}>All Job Postings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{jobs.length} total jobs across all HRs</p>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spin" /></div> : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Job Title</th><th>Department</th><th>Type</th><th>Salary</th><th>Openings</th><th>Posted By</th><th>Platforms</th><th>Status</th><th>Posted</th></tr></thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{j.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{j.location}</div>
                    </td>
                    <td style={{ fontSize: '12px' }}>{j.department}</td>
                    <td><span className="badge badge-gray">{j.jobType}</span></td>
                    <td style={{ fontSize: '12px' }}>{j.salaryRange?.min > 0 ? `${fmtMoney(j.salaryRange.min)} – ${fmtMoney(j.salaryRange.max)}` : '—'}</td>
                    <td style={{ fontSize: '13px', textAlign: 'center' }}>{j.openings}</td>
                    <td style={{ fontSize: '12px' }}>{j.postedBy?.name || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {j.platforms?.slice(0, 3).map(p => <span key={p._id} className="badge badge-blue" style={{ fontSize: '10px' }}>{p.name}</span>)}
                        {j.platforms?.length > 3 && <span className="badge badge-gray" style={{ fontSize: '10px' }}>+{j.platforms.length - 3}</span>}
                        {!j.platforms?.length && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </td>
                    <td><span className={`badge badge-${statusColor[j.status]}`}>{j.status}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fmtDate(j.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.length === 0 && <div className="empty"><div className="empty-icon">💼</div><p>No jobs posted yet</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
