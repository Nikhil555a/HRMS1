// import axios from 'axios';

// const api = axios.create({ baseURL: '/api' });

// api.interceptors.request.use(cfg => {
//   const token = localStorage.getItem('token');
//   if (token) cfg.headers.Authorization = `Bearer ${token}`;
//   return cfg;
// });

// api.interceptors.response.use(
//   res => res,
//   err => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;


import axios from 'axios';

const api = axios.create({
  baseURL: '/api' ,
   timeout: 120000, // ✅ 2 minute — Cloudinary upload ke liye
  // baseURL: 'https://hrms1-3.onrender.com/api'
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
