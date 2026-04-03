export const STAGES = [
  'Applied','Screening','Shortlisted','Interview Scheduled','Interview In Progress',
  'Technical Round','HR Round','Final Round','Selected','Offer Sent','Offer Accepted',
  'Offer Rejected','Joined','Rejected','On Hold','Withdrawn'
];

export const PLATFORMS = [
  'LinkedIn','Naukri','Indeed','Shine','Monster','Instahyre',
  'Referral','Company Website','Walk-in','Campus','Internshala','Other'
];

export const stageColor = (stage) => {
  const map = {
    'Applied':'badge-muted','Screening':'badge-info','Shortlisted':'badge-info',
    'Interview Scheduled':'badge-warning','Interview In Progress':'badge-warning',
    'Technical Round':'badge-warning','HR Round':'badge-warning','Final Round':'badge-warning',
    'Selected':'badge-success','Offer Sent':'badge-info','Offer Accepted':'badge-success',
    'Offer Rejected':'badge-danger','Joined':'badge-success','Rejected':'badge-danger',
    'On Hold':'badge-warning','Withdrawn':'badge-muted'
  };
  return map[stage] || 'badge-muted';
};

export const platformColor = (p) => {
  const map = {
    LinkedIn:'badge-info', Naukri:'badge-warning', Indeed:'badge-success',
    Shine:'badge-warning', Monster:'badge-danger', Instahyre:'badge-info',
    Referral:'badge-success', 'Company Website':'badge-info',
    'Walk-in':'badge-muted', Campus:'badge-success', Internshala:'badge-warning', Other:'badge-muted'
  };
  return map[p] || 'badge-muted';
};

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

export const fmtMoney = (n) =>
  n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

export const initials = (name) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

export const avColor = (name) => {
  const colors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#ec4899'];
  return name ? colors[name.charCodeAt(0) % colors.length] : colors[0];
};
