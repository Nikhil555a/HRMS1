
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../common/NotificationBell';

const Ico = ({ d }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: 16, height: 16, flexShrink: 0 }}>
    <path d={d} />
  </svg>
);

const NL = ({ to, label, icon }) => (
  <NavLink to={to} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <Ico d={icon} />{label}
  </NavLink>
);

const ICONS = {
  home:       'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  dept:       'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  emp:        'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z',
  attendance: 'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z M9 16l2 2 4-4',
  internship: 'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5',
  hiringDash: 'M18 20V10 M12 20V4 M6 20v-6',
  jobs:       'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z',
  candidates: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  interviews: 'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z M9 16l2 2 4-4',
  docs:       'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  admin:      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  hrs:        'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  logout:     'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  sun:        'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z',
  moon:       'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'super_admin';
  const [hiringOpen, setHiringOpen] = useState(true);
  const [empOpen,    setEmpOpen]    = useState(true);

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-logo">
        <h2>🏢 HRMS</h2>
        <span>HR Management Suite</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">

        {/* ── Employee Management ── */}
        <div
          className="nav-section-title"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setEmpOpen(o => !o)}
        >
          <span>Employee Management</span>
          <span style={{ fontSize: 10 }}>{empOpen ? '▲' : '▼'}</span>
        </div>
        {empOpen && (
          <>
            <NL to="/dashboard"   label="Dashboard"   icon={ICONS.home} />
            <NL to="/departments" label="Departments" icon={ICONS.dept} />
            <NL to="/employees"   label="Employees"   icon={ICONS.emp} />
            <NL to="/attendance"  label="Attendance"  icon={ICONS.attendance} />
            <NL to="/internships" label="Internships" icon={ICONS.internship} />
          </>
        )}

        <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />

        {/* ── Hiring System ── */}
        <div
          className="nav-section-title"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--accent)' }}
          onClick={() => setHiringOpen(o => !o)}
        >
          <span>Hiring System</span>
          <span style={{ fontSize: 10 }}>{hiringOpen ? '▲' : '▼'}</span>
        </div>
        {hiringOpen && (
          <>
            {isAdmin && (
              <>
                <div className="nav-section-title" style={{ fontSize: 9, paddingTop: 6 }}>Admin</div>
                <NL to="/hiring/admin"            label="Admin Dashboard" icon={ICONS.admin} />
                <NL to="/hiring/admin/hrs"        label="Manage HRs"      icon={ICONS.hrs} />
                <NL to="/hiring/admin/candidates" label="All Candidates"  icon={ICONS.candidates} />
                <NL to="/hiring/admin/jobs"       label="All Jobs"        icon={ICONS.jobs} />
                <div className="nav-section-title" style={{ fontSize: 9, paddingTop: 6 }}>My Work</div>
              </>
            )}
            <NL to="/hiring/dashboard"  label="Hiring Dashboard" icon={ICONS.hiringDash} />
            <NL to="/hiring/jobs"       label="Job Postings"     icon={ICONS.jobs} />
            <NL to="/hiring/candidates" label="Candidates"       icon={ICONS.candidates} />
            <NL to="/hiring/interviews" label="Interviews"       icon={ICONS.interviews} />
            <NL to="/hiring/documents"  label="Documents"        icon={ICONS.docs} />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer" style={{ overflow: 'visible' }}>
        <div className="user-badge" style={{ overflow: 'visible' }}>

          {/* Avatar */}
          <div
            className="user-avatar"
            style={{ background: isAdmin ? 'linear-gradient(135deg,#f43f5e,#e11d48)' : 'var(--primary)' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>

          {/* Name + Role */}
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div className="role">{isAdmin ? 'Super Admin' : user?.role}</div>
          </div>

          {/* 🔔 Bell */}
          <NotificationBell />

          {/* 🌙 / ☀️ Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'Light Mode on karo' : 'Dark Mode on karo'}
          >
            <Ico d={isDark ? ICONS.sun : ICONS.moon} />
          </button>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer',
              padding: '4px', display: 'flex',
            }}
            title="Logout"
          >
            <Ico d={ICONS.logout} />
          </button>

        </div>
      </div>
    </aside>
  );
}