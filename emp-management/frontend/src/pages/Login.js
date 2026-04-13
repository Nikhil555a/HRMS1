
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const user = await login(form.email, form.password);
  //     // Role-based redirect
  //     if (user.role === 'employee') {
  //       navigate('/employee-portal');
  //     } else {
  //       navigate('/');
  //     }
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Invalid email or password');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const user = await login(form.email, form.password);

    // 🔥 wait for user + redirect properly
    if (user.role === 'employee') {
      navigate('/employee-portal');
    } else if (user.role === 'super_admin') {
      navigate('/hiring/admin');
    } else {
      navigate('/hiring/dashboard');
    }

  } catch (err) {
    toast.error(err.response?.data?.message || 'Invalid email or password');
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background-primary)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--color-background-secondary)',
        borderRadius: '20px',
        padding: '40px',
        border: '0.5px solid var(--color-border-tertiary)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: '24px',
            boxShadow: '0 8px 24px #6366f144',
          }}>⚡</div>
          <h1 style={{ fontWeight: 800, fontSize: '22px', margin: 0 }}>EmpMS</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Employee Management System
          </p>
        </div>

        {/* Role badges */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '24px',
          padding: '12px', borderRadius: '10px',
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
        }}>
          {[
            { role: 'Super Admin', icon: '👑', color: '#6366f1' },
            { role: 'HR Manager', icon: '🧑‍💼', color: '#10b981' },
            { role: 'Employee', icon: '👤', color: '#f59e0b' },
          ].map(r => (
            <div key={r.role} style={{
              flex: 1, textAlign: 'center', padding: '6px 4px',
              borderRadius: '6px', background: `${r.color}11`,
              border: `1px solid ${r.color}33`,
            }}>
              <div style={{ fontSize: '16px' }}>{r.icon}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: r.color, marginTop: '2px' }}>
                {r.role}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{
                fontSize: '12px', fontWeight: 600,
                color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block',
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{
                fontSize: '12px', fontWeight: 600,
                color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--color-text-tertiary)',
                    fontSize: '13px', padding: '0',
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%', justifyContent: 'center',
                padding: '13px', marginTop: '8px',
                fontSize: '14px', fontWeight: 700,
                borderRadius: '10px',
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} /> Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </div>
        </form>

        {/* Demo credentials */}
        <div style={{
          marginTop: '20px', padding: '12px',
          background: 'var(--color-background-primary)',
          borderRadius: '8px', border: '0.5px solid var(--color-border-tertiary)',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
            DEMO CREDENTIALS
          </div>
          {[
            // { label: 'Admin', email: 'admin@company.com', pwd: 'admin123', color: '#6366f1' },
            // { label: 'HR', email: 'hr@company.com', pwd: 'hr123', color: '#10b981' },
            // { label: 'Employee', email: 'emp@company.com', pwd: 'emp123', color: '#f59e0b' },
          ].map(c => (
            <div
              key={c.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 8px', borderRadius: '6px', marginBottom: '4px',
                background: `${c.color}0d`, cursor: 'pointer',
              }}
              onClick={() => setForm({ email: c.email, password: c.pwd })}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: c.color, minWidth: '50px' }}>{c.label}</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
                {c.email}
              </span>
              <span style={{ fontSize: '10px', color: c.color }}>Click to fill</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
