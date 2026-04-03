
import React from 'react';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import EmployeeProfile from './employee-portal/EmployeeProfile';
import EmployeeAttendance from './employee-portal/EmployeeAttendance';
import EmployeeHolidays from './employee-portal/EmployeeHolidays';

const Ico = ({ d }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 16, height: 16 }}
  >
    <path d={d} />
  </svg>
);

const NL = ({ to, label, icon }) => (
  <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <Ico d={icon} />
    {label}
  </NavLink>
);

const ICONS = {
  profile:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z',
  attendance: 'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z',
  holiday:    'M20 12v10H4V12 M2 7h20 M12 22V7 M7 7l5-5 5 5',
  logout:     'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  sun:        'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z',
  moon:       'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'
};

export default function EmployeePortal() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ✅ SIDEBAR FIXED */}
      <aside
        className="sidebar"
        style={{
          width: '260px',
          minWidth: '260px',
          maxWidth: '260px',
          height: '100vh',
          position: 'sticky',
          top: 0
        }}
      >

        {/* Logo */}
        <div className="sidebar-logo">
          <h2>👤 Employee</h2>
          <span>Employee Panel</span>
        </div>

        {/* NAV */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">My Panel</div>

          <NL to="/employee-portal/profile" label="My Profile" icon={ICONS.profile} />
          <NL to="/employee-portal/attendance" label="Attendance" icon={ICONS.attendance} />
          <NL to="/employee-portal/holidays" label="Holidays" icon={ICONS.holiday} />
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div
            className="user-badge"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >

            {/* LEFT */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-avatar">
                {user?.name?.[0]?.toUpperCase()}
              </div>

              <div className="user-info">
                <div className="name">{user?.name}</div>
                <div className="role">Employee</div>
              </div>
            </div>

            {/* RIGHT ICONS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

              {/* THEME */}
              {/* <button
                onClick={toggleTheme}
                title={isDark ? 'Light Mode' : 'Dark Mode'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <Ico d={isDark ? ICONS.sun : ICONS.moon} />
              </button> */}

               {/* 🌙 / ☀️ Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? 'Light Mode on karo' : 'Dark Mode on karo'}
          >
            <Ico d={isDark ? ICONS.sun : ICONS.moon} />
          </button>

              {/* LOGOUT */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <Ico d={ICONS.logout} />
              </button>

            </div>

          </div>
        </div>

      </aside>

      {/* ✅ MAIN CONTENT FIX */}
      <main
        style={{
          flex: 1,
          padding: '24px',
          overflow: 'auto' // 🔥 important
        }}
      >
        <Routes>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="holidays" element={<EmployeeHolidays />} />
        </Routes>
      </main>

    </div>
  );
}


