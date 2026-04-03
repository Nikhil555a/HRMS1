import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';

// const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/employees/stats/overview'),
      api.get('/departments'),
      api.get('/employees?limit=5&page=1')
    ]).then(([s, d, e]) => {
      setStats(s.data);
      setDepartments(d.data);
      setRecentEmployees(e.data.employees);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const deptChartData = departments.map(d => ({ name: d.name, employees: d.employeeCount || 0 }));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>Welcome back! Here's what's happening.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="👥" label="Total Employees" value={stats?.total || 0} color="#6366f1" />
        <StatCard icon="✅" label="Active" value={stats?.active || 0} color="#10b981" />
        <StatCard icon="⏸️" label="Inactive / Left" value={stats?.inactive || 0} color="#ef4444" />
        <StatCard icon="🏖️" label="On Leave" value={stats?.onLeave || 0} color="#f59e0b" />
        <StatCard icon="🏢" label="Departments" value={departments.length} color="#22d3ee" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Employees by Department</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="employees" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Status Breakdown</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={220} height={200}>
              <Pie data={[
                { name: 'Active', value: stats?.active || 0 },
                { name: 'On Leave', value: stats?.onLeave || 0 },
                { name: 'Inactive', value: stats?.inactive || 0 }
              ]} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {['#10b981', '#f59e0b', '#ef4444'].map((color, i) => <Cell key={i} fill={color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
            </PieChart>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
            {[['#10b981', 'Active'], ['#f59e0b', 'On Leave'], ['#ef4444', 'Inactive']].map(([color, label]) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recently Added Employees</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map(emp => (
                <tr key={emp._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="emp-avatar">{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                      <span>{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{emp.employeeId}</td>
                  <td>{emp.department?.name || '—'}</td>
                  <td>{emp.designation}</td>
                  <td><StatusBadge status={emp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}22` }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
      </div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { Active: 'success', Inactive: 'muted', 'On Leave': 'warning', Terminated: 'danger', Resigned: 'danger' };
  return <span className={`badge badge-${map[status] || 'muted'}`}>{status}</span>;
}
