import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../../../utils/api';

const COLORS = ['#0ea5e9','#8b5cf6','#10b981','#f59e0b','#f43f5e','#14b8a6','#6366f1','#ec4899','#64748b'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spin" /></div>;
  if (!stats) return null;

  const monthlyData = (stats.monthlyTrend || []).map(m => ({ name: `${months[m._id.month - 1]} ${m._id.year}`, count: m.count }));
  const stageData = (stats.stageDistribution || []).filter(s => s._id).map(s => ({ name: s._id, value: s.count }));
  const platformData = (stats.platformDistribution || []).filter(p => p._id).map(p => ({ name: p._id, value: p.count }));
  const hrData = (stats.hrPerformance || []).filter(h => h.hr).map(h => ({ name: h.hr, total: h.total, hired: h.hired }));

  const convRate = stats.totalCandidates > 0 ? ((stats.hired / stats.totalCandidates) * 100).toFixed(1) : 0;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'linear-gradient(135deg,#f43f5e,#e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🛡️</div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800 }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>System-wide recruitment analytics</p>
          </div>
        </div>
      </div>

      <div className="stats-row">
        {[
          ['Total Jobs', stats.totalJobs, 'blue', '💼'],
          ['Active Jobs', stats.activeJobs, 'teal', '🎯'],
          ['Total Candidates', stats.totalCandidates, 'purple', '👥'],
          ['Total HRs', stats.totalHRs, 'amber', '🧑‍💼'],
          ['Hired', stats.hired, 'green', '✅'],
          ['Offers Sent', stats.offerSent, 'teal', '📨'],
          ['Offers Accepted', stats.offerAccepted, 'green', '🎉'],
          ['Rejected', stats.rejected, 'red', '❌'],
        ].map(([l, v, c, icon]) => (
          <div key={l} className={`stat-tile ${c}`}>
            <div className={`stat-val ${c}`}>{v ?? 0}</div><div className="stat-lbl">{l}</div><div className="stat-icon">{icon}</div>
          </div>
        ))}
      </div>

      {/* Conversion rate highlight */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.08))', border: '1px solid rgba(14,165,233,0.2)' }}>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800, color: 'var(--primary)' }}>{convRate}%</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Overall Conversion Rate</div>
          </div>
          <div style={{ flex: 1, display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {[['Offer Acceptance Rate', stats.offerAccepted && stats.offerSent ? ((stats.offerAccepted / stats.offerSent) * 100).toFixed(1) + '%' : 'N/A', '#10b981'], ['Active Job Ratio', stats.totalJobs > 0 ? ((stats.activeJobs / stats.totalJobs) * 100).toFixed(1) + '%' : 'N/A', '#0ea5e9'], ['Avg per HR', stats.totalHRs > 0 ? Math.round(stats.totalCandidates / stats.totalHRs) : 'N/A', '#8b5cf6']].map(([l, v, c]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: c }}>{v}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div className="card-hdr"><span className="card-title">Monthly Applications</span></div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141e2e', border: '1px solid #1e2d45', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div className="empty"><p>No trend data yet</p></div>}
        </div>
        <div className="card">
          <div className="card-hdr"><span className="card-title">Candidate Stages</span></div>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2} dataKey="value">
                  {stageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#141e2e', border: '1px solid #1e2d45', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty"><p>No stage data</p></div>}
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-hdr"><span className="card-title">Source Platforms</span></div>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141e2e', border: '1px solid #1e2d45', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty"><p>No platform data</p></div>}
        </div>
        <div className="card">
          <div className="card-hdr">
            <span className="card-title">HR Performance</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/hiring/admin/hrs')}>View HRs</button>
          </div>
          {hrData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hrData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141e2e', border: '1px solid #1e2d45', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="hired" fill="#10b981" radius={[4, 4, 0, 0]} name="Hired" />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty"><p>No HR data</p></div>}
        </div>
      </div>
    </div>
  );
}
