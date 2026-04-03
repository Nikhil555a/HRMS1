
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { connectSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';

const TYPE_ICON = {
  interview_reminder:    '⏰',
  interview_today:       '📅',
  interview_scheduled:   '🗓️',
  stage_update:          '🔄',
  offer_update:          '📨',
  document_update:       '📂',
  general:               '🔔',
};

const TYPE_COLOR = {
  interview_reminder:  '#f59e0b',
  interview_today:     '#ef4444',
  interview_scheduled: '#8b5cf6',
  stage_update:        '#3b82f6',
  offer_update:        '#0ea5e9',
  document_update:     '#10b981',
  general:             '#6366f1',
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── WhatsApp-style notification sound using Web Audio API ──────────────────
// No external file needed — pure synthesis
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const playTone = (frequency, startTime, duration, gainVal = 0.35) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;

    // WhatsApp-like 3-note "ding ding ding" — ascending then settle
    playTone(880,  now,        0.12, 0.30);  // A5 — first ding
    playTone(1108, now + 0.13, 0.12, 0.28);  // C#6 — second ding
    playTone(1318, now + 0.26, 0.22, 0.25);  // E6  — final settle (longer)

    // Auto-close context to free resources
    setTimeout(() => ctx.close(), 1000);
  } catch (e) {
    // Silently fail if AudioContext not supported
    console.warn('Notification sound failed:', e);
  }
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [bellPos, setBellPos]             = useState({ top: 0, left: 0 });
  const bellRef     = useRef(null);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // ── Fetch from REST ───────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Socket.IO — real-time (scoped to logged-in HR) ────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?._id) return;

    const socket = connectSocket(token);
    if (!socket) return;

    const handleNewNotif = (notif) => {
      // 🔔 Play WhatsApp-style sound on every new notification
      playNotificationSound();

      setNotifications(prev => [notif, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);

      const accentColor = TYPE_COLOR[notif.type] || '#6366f1';

      toast.info(
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
            background: `${accentColor}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>
            {TYPE_ICON[notif.type] || '🔔'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{notif.title}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{notif.message}</div>
            <div style={{ fontSize: 10, color: accentColor, marginTop: 4, fontWeight: 600 }}>
              {notif.type === 'interview_reminder' ? '⚠️ Action needed' : 'Click to view'}
            </div>
          </div>
        </div>,
        {
          autoClose: notif.type === 'interview_reminder' ? 15000 : 8000,
          toastId: `notif-${notif._id}`,
          onClick: () => { if (notif.link) navigate(notif.link); },
          style: { cursor: notif.link ? 'pointer' : 'default' },
        }
      );
    };

    const handleUnreadCount = (count) => setUnreadCount(count);

    socket.on('new_notification', handleNewNotif);
    socket.on('unread_count', handleUnreadCount);

    return () => {
      socket.off('new_notification', handleNewNotif);
      socket.off('unread_count', handleUnreadCount);
    };
  }, [navigate, user]);

  // ── Bell click — position dropdown ───────────────────────
  const handleBellClick = () => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      setBellPos({
        top:  rect.bottom + 8,
        left: Math.min(rect.left - 320, window.innerWidth - 380),
      });
    }
    setOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        bellRef.current    && !bellRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────
  const markRead = async (notif) => {
    if (!notif.isRead) {
      await api.patch(`/notifications/${notif._id}/read`).catch(() => {});
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const markAllRead = async () => {
    setLoading(true);
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  const clearRead = async () => {
    await api.delete('/notifications/clear-all').catch(() => {});
    setNotifications(prev => prev.filter(n => !n.isRead));
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    await api.delete(`/notifications/${id}`).catch(() => {});
    setNotifications(prev => {
      const removed = prev.find(n => n._id === id);
      if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
      return prev.filter(n => n._id !== id);
    });
  };

  // Group notifications by date
  const grouped = notifications.reduce((acc, n) => {
    const day = new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(n);
    return acc;
  }, {});

  return (
    <>
      {/* ── Bell Button ── */}
      <button
        ref={bellRef}
        onClick={handleBellClick}
        title={`${unreadCount} notifications`}
        style={{
          position: 'relative',
          background: open ? 'rgba(99,102,241,0.15)' : 'none',
          border: '1px solid',
          borderColor: open ? 'rgba(99,102,241,0.3)' : 'transparent',
          borderRadius: '8px',
          padding: '6px 8px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          transition: 'all 0.18s', flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          width="17" height="17" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            background: '#ef4444', color: 'white',
            borderRadius: '50%', minWidth: '16px', height: '16px',
            fontSize: '9px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--color-background-primary)',
            padding: '0 2px', animation: 'bellPulse 2s ease-in-out infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: bellPos.top, left: bellPos.left,
            width: '380px',
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: '16px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
            zIndex: 99999, overflow: 'hidden',
            animation: 'dropIn 0.18s ease',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid var(--color-border-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  background: '#ef4444', color: 'white',
                  borderRadius: '10px', padding: '1px 7px',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} disabled={loading} style={{
                  background: 'none', border: 'none', color: '#6366f1',
                  fontSize: '11px', cursor: 'pointer', fontWeight: 600,
                }}>
                  Mark all read
                </button>
              )}
              {notifications.some(n => n.isRead) && (
                <button onClick={clearRead} style={{
                  background: 'none', border: 'none',
                  color: 'var(--color-text-tertiary)', fontSize: '11px', cursor: 'pointer',
                }}>
                  Clear read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: 'none',
                color: 'var(--color-text-tertiary)', fontSize: '18px',
                cursor: 'pointer', lineHeight: 1,
              }}>×</button>
            </div>
          </div>

          {/* Live indicator */}
          <div style={{
            padding: '5px 16px',
            background: 'rgba(16,185,129,0.06)',
            borderBottom: '1px solid var(--color-border-tertiary)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#10b981', display: 'inline-block',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
              Live — HR-scoped real-time updates
            </span>
          </div>

          {/* List */}
          <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-tertiary)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🔔</div>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>No notifications</p>
                <p style={{ fontSize: 12, marginTop: 4, color: 'var(--color-text-tertiary)' }}>
                  Interview reminders will appear 15 min before
                </p>
              </div>
            ) : Object.entries(grouped).map(([day, notifs]) => (
              <div key={day}>
                <div style={{
                  padding: '6px 16px', fontSize: '10px', fontWeight: 700,
                  color: 'var(--color-text-tertiary)', letterSpacing: '0.05em',
                  background: 'var(--color-background-primary)',
                  borderBottom: '1px solid var(--color-border-tertiary)',
                }}>
                  {day}
                </div>
                {notifs.map(notif => {
                  const accent = TYPE_COLOR[notif.type] || '#6366f1';
                  return (
                    <div
                      key={notif._id}
                      onClick={() => markRead(notif)}
                      style={{
                        display: 'flex', gap: '10px', padding: '11px 14px',
                        cursor: 'pointer',
                        background: notif.isRead ? 'transparent' : `${accent}0a`,
                        borderBottom: '1px solid var(--color-border-tertiary)',
                        transition: 'background 0.15s', position: 'relative',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = `${accent}14`}
                      onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : `${accent}0a`}
                    >
                      {!notif.isRead && (
                        <div style={{
                          position: 'absolute', left: 5, top: '50%',
                          transform: 'translateY(-50%)',
                          width: 5, height: 5, borderRadius: '50%', background: accent,
                        }} />
                      )}

                      <div style={{
                        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                        background: notif.isRead ? 'var(--color-background-primary)' : `${accent}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', border: `1px solid ${accent}22`,
                      }}>
                        {TYPE_ICON[notif.type] || '🔔'}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: notif.isRead ? 500 : 700,
                          lineHeight: 1.4,
                        }}>
                          {notif.title}
                        </div>
                        <div style={{
                          fontSize: '12px', color: 'var(--color-text-secondary)',
                          marginTop: 2, lineHeight: 1.4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: 3 }}>
                          {timeAgo(notif.createdAt)}
                        </div>
                      </div>

                      <button onClick={(e) => deleteOne(e, notif._id)} style={{
                        background: 'none', border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer', fontSize: '16px',
                        flexShrink: 0, alignSelf: 'flex-start',
                        lineHeight: 1, opacity: 0.6, padding: '2px',
                      }}>×</button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '8px 14px',
              borderTop: '1px solid var(--color-border-tertiary)',
              background: 'var(--color-background-primary)',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                {notifications.length} notifications · Socket.IO HR-scoped
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bellPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.3); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}