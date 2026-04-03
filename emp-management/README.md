# ⚡ EmpMS - Employee Management System
### MERN Stack (MongoDB + Express + React + Node.js)

---

## 🚀 Features / Features

- **Departments** — Create, edit, delete departments with code, location, budget
- **Employees** — Full employee profiles with:
  - Basic Info (ID, name, email, phone, address)
  - Background (education history, work experience, previous company)
  - Skills & Applied Position
  - Document Upload (profile photo + resume/CV)
  - Status management (Active, On Leave, Terminated, Resigned)
- **Attendance** — Mark daily attendance, check-in/out times, leave management, monthly summary
- **Internships** — Manage internship lifecycle (Active → Completed/Terminated/Extended), mentor assignment, performance rating

---

## 📦 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- npm

### Step 1: Clone/Extract and Install
```bash
# Install all dependencies
npm run install-all
```

### Step 2: Configure Backend
Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=your_secret_key_here
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee_management
```

### Step 3: Seed Database (Admin User + Sample Data)
```bash
npm run seed
```
This creates:
- Admin login: **admin@company.com / admin123**
- 5 sample departments
- 5 sample employees

### Step 4: Start the Application
```bash
# Run backend + frontend together
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend (port 5000)
npm run start-backend

# Terminal 2 - Frontend (port 3000)
npm run start-frontend
```

### Step 5: Open Browser
```
http://localhost:3000
```

---

## 📁 Project Structure

```
emp-management/
├── backend/
│   ├── models/
│   │   ├── User.js          # Auth user model
│   │   ├── Department.js    # Department model
│   │   ├── Employee.js      # Employee model (with edu/exp)
│   │   ├── Attendance.js    # Attendance model
│   │   └── Internship.js    # Internship model
│   ├── routes/
│   │   ├── auth.js          # Login/Register
│   │   ├── departments.js   # Department CRUD
│   │   ├── employees.js     # Employee CRUD + file upload
│   │   ├── attendance.js    # Attendance management
│   │   └── internships.js   # Internship management
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   └── upload.js        # Multer file upload
│   ├── uploads/             # Uploaded files stored here
│   ├── server.js            # Express server
│   ├── seed.js              # Database seeder
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Dashboard.js
│       │   ├── Departments.js
│       │   ├── Employees.js
│       │   ├── EmployeeDetail.js
│       │   ├── Attendance.js
│       │   └── Internships.js
│       ├── components/
│       │   ├── layout/Sidebar.js, Layout.js
│       │   └── employees/EmployeeForm.js
│       ├── context/AuthContext.js
│       ├── utils/api.js
│       ├── App.js
│       └── index.css
│
└── package.json
```

---

## 🔐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/departments | List departments |
| POST | /api/departments | Create department |
| GET | /api/employees | List employees (with search/filter) |
| POST | /api/employees | Add employee (multipart/form-data) |
| GET | /api/employees/:id | Employee detail |
| PUT | /api/employees/:id | Update employee |
| PATCH | /api/employees/:id/status | Update status |
| GET | /api/attendance | List attendance records |
| POST | /api/attendance | Mark attendance |
| GET | /api/internships | List internships |
| POST | /api/internships | Add internship |

---

## 💡 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) |
| File Upload | Multer |
| Styling | Custom CSS with CSS Variables |
| Notifications | React Toastify |
