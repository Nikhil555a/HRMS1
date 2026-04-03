import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../../utils/api';
import {  stageColor } from '../../../utils/helpers';
import { useAuth } from '../../../context/AuthContext';

const COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#ec4899'];

export default function HiringDashboard() {
  const [data, setData] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get('/hiring/dashboard/hr'),
      api.get('/hiring/dashboard/interviews'),
    ]).then(([d, i]) => { setData(d.data); setUpcoming(i.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spin" /></div>;
  const s = data?.stats || {};
  const stageData = (data?.stages || []).map(x => ({ name: x._id, value: x.count })).filter(x => x.name);
  const platformData = (data?.platforms || []).map(x => ({ name: x._id || 'Unknown', value: x.count })).filter(x => x.name);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>
          Hiring Dashboard &nbsp;
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>
            {user?.role === 'super_admin' ? '(System-wide)' : `(${user?.name})`}
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Recruitment overview at a glance</p>
      </div>

      <div className="stats-row">
        {[
          ['Total Jobs', s.totalJobs, 'blue', '💼'],
          ['Active Jobs', s.activeJobs, 'teal', '🎯'],
          ['Candidates', s.totalCandidates, 'purple', '👥'],
          ['In Progress', s.inProgress, 'amber', '⚡'],
          ['Selected', s.selected, 'green', '✅'],
          ['Rejected', s.rejected, 'red', '❌'],
          ['Offer Pending', s.offerPending, 'amber', '📨'],
          ['Docs Pending', s.docsPending, 'purple', '📂'],
        ].map(([l, v, c, icon]) => (
          <div key={l} className={`stat-tile ${c}`}>
            <div className={`stat-val ${c}`}>{v ?? 0}</div>
            <div className="stat-lbl">{l}</div>
            <div className="stat-icon">{icon}</div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Pipeline Stages</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stageData.slice(0, 8)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={45} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Source Platforms</span></div>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={platformData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty"><p>No data</p></div>}
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Candidates</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/hiring/candidates')}>View All</button>
          </div>
          {data?.recent?.length > 0 ? data.recent.map(c => (
            <div key={c._id} className="cand-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/hiring/candidates/${c._id}`)}>
              <div className="emp-avatar" style={{ width: 32, height: 32, fontSize: 11, background: 'var(--primary)' }}>{c.name?.[0]}</div>
              <div className="cand-info">
                <div className="cand-name">{c.name}</div>
                <div className="cand-sub">{c.job?.title || '—'} · {c.source?.platform || '?'}</div>
              </div>
              <span className={`badge ${stageColor(c.stage)}`}>{c.stage}</span>
            </div>
          )) : <div className="empty"><p>No candidates yet</p></div>}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Interviews</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/hiring/interviews')}>View All</button>
          </div>
          {upcoming.length > 0 ? upcoming.slice(0, 5).map((item, i) => (
            <div key={i} className="cand-row" style={{ cursor: 'pointer' }} onClick={() => navigate(`/hiring/candidates/${item.candidate._id}`)}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-card2)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>{new Date(item.interview.scheduledAt).getDate()}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(item.interview.scheduledAt).toLocaleString('en', { month: 'short' })}</span>
              </div>
              <div className="cand-info">
                <div className="cand-name">{item.candidate.name}</div>
                <div className="cand-sub">{item.interview.round} · {item.interview.mode}</div>
              </div>
              <span className={`badge badge-${item.interview.status === 'Scheduled' ? 'info' : 'muted'}`}>{item.interview.status}</span>
            </div>
          )) : <div className="empty"><p>No upcoming interviews</p></div>}
        </div>
      </div>
    </div>
  );
}
