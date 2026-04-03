

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import { connectSocket, disconnectSocket } from './hooks/useSocket';

// Pages
import Login from './pages/Login';

// Employee Management
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Attendance from './pages/Attendance';
import Internships from './pages/Internships';

// Hiring HR
import HiringDashboard from './pages/hiring/hr/Dashboard';
import HiringJobs from './pages/hiring/hr/Jobs';
import HiringCandidates from './pages/hiring/hr/Candidates';
import HiringCandidateDetail from './pages/hiring/hr/CandidateDetail';
import HiringInterviews from './pages/hiring/hr/Interviews';
import HiringDocuments from './pages/hiring/hr/Documents';
import HRProfile from './pages/hiring/hr/HrProfile';

// Hiring Admin
import AdminDashboard from './pages/hiring/admin/AdminDashboard';
import ManageHRs from './pages/hiring/admin/ManageHRs';
import AdminCandidates from './pages/hiring/admin/AdminCandidates';
import AdminJobs from './pages/hiring/admin/AdminJobs';

// Employee Portal
import EmployeePortal from './pages/EmployeePortal';
// import EmployeeJobs from './pages/EmployeeJob';


// Loader
const Loader = () => (
  <div className="loading">
    <div className="spinner" />
  </div>
);


// SOCKET MANAGER
function SocketManager() {
  const { user } = useAuth();

  // useEffect(() => {
  //   if (user) {
  //     const token = localStorage.getItem('token');
  //     if (token) connectSocket(token);
  //   } else {
  //     disconnectSocket();
  //   }
  // }, [user?._id]);

  useEffect(() => {
  if (user) {
    const token = localStorage.getItem('token');
    if (token) connectSocket(token);
  }

  return () => {
    disconnectSocket(); // 👈 cleanup
  };
}, [user]);

  return null;
}


// PRIVATE ROUTE
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'employee') {
      return <Navigate to="/employee-portal" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};


// PUBLIC ONLY (🔥 FIXED)
const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (user) {
    if (user.role === 'employee') {
      return <Navigate to="/employee-portal" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};


// HOME REDIRECT
const Home = () => {
  const { user } = useAuth();

  if (user?.role === 'super_admin') {
    return <Navigate to="/hiring/admin" replace />;
  }

  if (user?.role === 'employee') {
    return <Navigate to="/employee-portal" replace />;
  }

  return <Navigate to="/hiring/dashboard" replace />;
};


// MAIN ROUTES
function AppRoutes() {
  return (
    <BrowserRouter

      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
      <SocketManager />

      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        } />

        {/* EMPLOYEE PORTAL */}
        <Route path="/employee-portal/*" element={
          <PrivateRoute allowedRoles={['employee']}>
            <EmployeePortal />
          </PrivateRoute>
        } />

        {/* ADMIN + HR PANEL */}
        <Route path="/" element={
          <PrivateRoute allowedRoles={['super_admin', 'hr']}>
            <Layout />
          </PrivateRoute>
        }>

          <Route index element={<Home />} />

          {/* Employee Management */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="departments" element={<Departments />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeDetail />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="internships" element={<Internships />} />

          {/* Hiring HR */}
          <Route path="hiring/dashboard" element={<HiringDashboard />} />
          <Route path="hiring/jobs" element={<HiringJobs />} />
          <Route path="hiring/candidates" element={<HiringCandidates />} />
          <Route path="hiring/candidates/:id" element={<HiringCandidateDetail />} />
          <Route path="hiring/interviews" element={<HiringInterviews />} />
          <Route path="hiring/documents" element={<HiringDocuments />} />
          <Route path="hiring/profile" element={<HRProfile />} />

          {/* Hiring Admin */}
          <Route path="hiring/admin" element={
            <PrivateRoute allowedRoles={['super_admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          <Route path="hiring/admin/hrs" element={
            <PrivateRoute allowedRoles={['super_admin']}>
              <ManageHRs />
            </PrivateRoute>
          } />

          <Route path="hiring/admin/candidates" element={
            <PrivateRoute allowedRoles={['super_admin']}>
              <AdminCandidates />
            </PrivateRoute>
          } />

          <Route path="hiring/admin/jobs" element={
            <PrivateRoute allowedRoles={['super_admin']}>
              <AdminJobs />
            </PrivateRoute>
          } />

        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        {/* <Route path='/employee-job' element={<EmployeeJobs/>}/> */}

      </Routes>

      <ToastContainer position="top-right" theme="dark" autoClose={3000} />
    </BrowserRouter>
  );
}


// APP WRAPPER
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
