
<<<<<<< HEAD
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { useAuth } from '../context/AuthContext';

// export default function Login() {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [loading, setLoading] = useState(false);
//   const [showPwd, setShowPwd] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   try {
//   //     const user = await login(form.email, form.password);
//   //     // Role-based redirect
//   //     if (user.role === 'employee') {
//   //       navigate('/employee-portal');
//   //     } else {
//   //       navigate('/');
//   //     }
//   //   } catch (err) {
//   //     toast.error(err.response?.data?.message || 'Invalid email or password');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//     const user = await login(form.email, form.password);

//     // 🔥 wait for user + redirect properly
//     if (user.role === 'employee') {
//       navigate('/employee-portal');
//     } else if (user.role === 'super_admin') {
//       navigate('/hiring/admin');
//     } else {
//       navigate('/hiring/dashboard');
//     }

//   } catch (err) {
//     toast.error(err.response?.data?.message || 'Invalid email or password');
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
//     <div style={{
//       minHeight: '100vh',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       background: 'var(--color-background-primary)',
//       padding: '20px',
//     }}>
//       <div style={{
//         width: '100%',
//         maxWidth: '440px',
//         background: 'var(--color-background-secondary)',
//         borderRadius: '20px',
//         padding: '40px',
//         border: '0.5px solid var(--color-border-tertiary)',
//         boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
//       }}>
//         {/* Logo */}
//         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
//           <div style={{
//             width: 56, height: 56, borderRadius: '16px',
//             background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             margin: '0 auto 14px', fontSize: '24px',
//             boxShadow: '0 8px 24px #6366f144',
//           }}>⚡</div>
//           <h1 style={{ fontWeight: 800, fontSize: '22px', margin: 0 }}>EmpMS</h1>
//           <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
//             Employee Management System
//           </p>
//         </div>

//         {/* Role badges */}
//         <div style={{
//           display: 'flex', gap: '8px', marginBottom: '24px',
//           padding: '12px', borderRadius: '10px',
//           background: 'var(--color-background-primary)',
//           border: '0.5px solid var(--color-border-tertiary)',
//         }}>
//           {[
//             { role: 'Super Admin', icon: '👑', color: '#6366f1' },
//             { role: 'HR Manager', icon: '🧑‍💼', color: '#10b981' },
//             { role: 'Employee', icon: '👤', color: '#f59e0b' },
//           ].map(r => (
//             <div key={r.role} style={{
//               flex: 1, textAlign: 'center', padding: '6px 4px',
//               borderRadius: '6px', background: `${r.color}11`,
//               border: `1px solid ${r.color}33`,
//             }}>
//               <div style={{ fontSize: '16px' }}>{r.icon}</div>
//               <div style={{ fontSize: '10px', fontWeight: 600, color: r.color, marginTop: '2px' }}>
//                 {r.role}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit}>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
//             <div>
//               <label style={{
//                 fontSize: '12px', fontWeight: 600,
//                 color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block',
//               }}>
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 placeholder="Enter your email address"
//                 value={form.email}
//                 onChange={e => setForm({ ...form, email: e.target.value })}
//                 required
//                 style={{ width: '100%', boxSizing: 'border-box' }}
//               />
//             </div>

//             <div>
//               <label style={{
//                 fontSize: '12px', fontWeight: 600,
//                 color: 'var(--color-text-secondary)', marginBottom: '6px', display: 'block',
//               }}>
//                 Password
//               </label>
//               <div style={{ position: 'relative' }}>
//                 <input
//                   type={showPwd ? 'text' : 'password'}
//                   placeholder="Enter your password"
//                   value={form.password}
//                   onChange={e => setForm({ ...form, password: e.target.value })}
//                   required
//                   style={{ width: '100%', boxSizing: 'border-box', paddingRight: '40px' }}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPwd(s => !s)}
//                   style={{
//                     position: 'absolute', right: '10px', top: '50%',
//                     transform: 'translateY(-50%)',
//                     background: 'none', border: 'none',
//                     cursor: 'pointer', color: 'var(--color-text-tertiary)',
//                     fontSize: '13px', padding: '0',
//                   }}
//                 >
//                   {showPwd ? '🙈' : '👁️'}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="btn btn-primary"
//               disabled={loading}
//               style={{
//                 width: '100%', justifyContent: 'center',
//                 padding: '13px', marginTop: '8px',
//                 fontSize: '14px', fontWeight: 700,
//                 borderRadius: '10px',
//               }}
//             >
//               {loading ? (
//                 <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
//                   <span className="spinner" style={{ width: 14, height: 14 }} /> Signing in…
//                 </span>
//               ) : 'Sign In →'}
//             </button>
//           </div>
//         </form>

//         {/* Demo credentials */}
//         <div style={{
//           marginTop: '20px', padding: '12px',
//           background: 'var(--color-background-primary)',
//           borderRadius: '8px', border: '0.5px solid var(--color-border-tertiary)',
//         }}>
//           <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
//             DEMO CREDENTIALS
//           </div>
//           {[
//             // { label: 'Admin', email: 'admin@company.com', pwd: 'admin123', color: '#6366f1' },
//             // { label: 'HR', email: 'hr@company.com', pwd: 'hr123', color: '#10b981' },
//             // { label: 'Employee', email: 'emp@company.com', pwd: 'emp123', color: '#f59e0b' },
//           ].map(c => (
//             <div
//               key={c.label}
//               style={{
//                 display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                 padding: '6px 8px', borderRadius: '6px', marginBottom: '4px',
//                 background: `${c.color}0d`, cursor: 'pointer',
//               }}
//               onClick={() => setForm({ email: c.email, password: c.pwd })}
//             >
//               <span style={{ fontSize: '11px', fontWeight: 600, color: c.color, minWidth: '50px' }}>{c.label}</span>
//               <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
//                 {c.email}
//               </span>
//               <span style={{ fontSize: '10px', color: c.color }}>Click to fill</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }





=======
>>>>>>> 6da1c31 (Updated frontend HRMS features)

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
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

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid var(--color-border-secondary)',
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = '#6366f1';
    e.target.style.boxShadow = '0 0 0 3.5px rgba(99,102,241,0.13)';
  };

  const inputBlurHandler = (e) => {
    e.target.style.borderColor = 'var(--color-border-secondary)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background-tertiary)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--color-background-primary)',
        borderRadius: '22px',
        padding: '44px 40px 36px',
        border: '1px solid rgba(99,102,241,0.18)',
        boxShadow: `
          0 0 0 1px rgba(99,102,241,0.06),
          0 2px 4px rgba(99,102,241,0.06),
          0 8px 20px rgba(99,102,241,0.10),
          0 20px 48px rgba(99,102,241,0.13),
          0 40px 80px rgba(99,102,241,0.08)
        `,
      }}>

        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 58, height: 58,
            borderRadius: '17px',
            background: 'linear-gradient(145deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: '24px',
            boxShadow: '0 4px 6px rgba(99,102,241,0.2), 0 8px 20px rgba(99,102,241,0.25), 0 1px 0 rgba(255,255,255,0.18) inset',
          }}>⚡</div>
          <h1 style={{
            fontWeight: 800, fontSize: '23px', margin: 0,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.3px',
          }}>EmpMS</h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '13px', marginTop: '5px',
          }}>
            Employee Management System
          </p>
        </div>

        {/* ── Role badges ── */}
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '28px',
          padding: '10px',
          borderRadius: '13px',
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border-tertiary)',
        }}>
          {[
            { role: 'Super Admin', icon: '👑', color: '#6366f1' },
            { role: 'HR Manager', icon: '🧑‍💼', color: '#10b981' },
            { role: 'Employee',   icon: '👤', color: '#f59e0b' },
          ].map(r => (
            <div key={r.role} style={{
              flex: 1, textAlign: 'center',
              padding: '8px 4px',
              borderRadius: '9px',
              background: `${r.color}12`,
              border: `1px solid ${r.color}2e`,
            }}>
              <div style={{ fontSize: '15px', lineHeight: 1 }}>{r.icon}</div>
              <div style={{
                fontSize: '10px', fontWeight: 700,
                color: r.color, marginTop: '4px',
                letterSpacing: '0.2px',
              }}>
                {r.role}
              </div>
            </div>
          ))}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Email */}
            <div>
              <label style={{
                fontSize: '11.5px', fontWeight: 700,
                color: 'var(--color-text-secondary)',
                marginBottom: '7px', display: 'block',
                letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                required
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                fontSize: '11.5px', fontWeight: 700,
                color: 'var(--color-text-secondary)',
                marginBottom: '7px', display: 'block',
                letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                  required
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-tertiary)',
                    fontSize: '14px', padding: '0', lineHeight: 1,
                  }}
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                marginTop: '4px',
                borderRadius: '11px',
                border: 'none',
                background: loading
                  ? 'linear-gradient(135deg, #a5b4fc, #c4b5fd)'
                  : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.3px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: loading
                  ? 'none'
                  : '0 2px 4px rgba(99,102,241,0.2), 0 6px 16px rgba(99,102,241,0.3), 0 1px 0 rgba(255,255,255,0.15) inset',
                transition: 'opacity 0.2s, transform 0.1s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.target.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.target.style.opacity = '1'; }}
              onMouseDown={e => { if (!loading) e.target.style.transform = 'scale(0.985)'; }}
              onMouseUp={e => { e.target.style.transform = 'scale(1)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </div>
        </form>

        {/* ── Demo credentials ── */}
        <div style={{
          marginTop: '24px',
          padding: '14px',
          background: 'var(--color-background-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--color-border-tertiary)',
        }}>
          {/* <div style={{
            fontSize: '10px', fontWeight: 800,
            color: 'var(--color-text-tertiary)',
            marginBottom: '10px',
            letterSpacing: '0.9px',
            textTransform: 'uppercase',
          }}>
            Demo Credentials
          </div> */}
          {[
          //  { label: 'Admin', email: 'admin@company.com', pwd: 'admin123', color: '#6366f1' },
          ].map(c => (
            <div
              key={c.label}
              onClick={() => setForm({ email: c.email, password: c.pwd })}
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                marginBottom: '4px',
                background: `${c.color}0d`,
                border: `1px solid ${c.color}20`,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${c.color}1c`}
              onMouseLeave={e => e.currentTarget.style.background = `${c.color}0d`}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: c.color, minWidth: '50px' }}>
                {c.label}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
                {c.email}
              </span>
              <span style={{ fontSize: '10px', color: c.color, fontWeight: 600 }}>
                Click to fill
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
