# 🚀 SmartHire AI

> A full-stack job portal and recruitment management platform built with Node.js, Express.js, PostgreSQL, EJS, and Bootstrap.

SmartHire AI allows candidates to discover and apply for jobs while employers can create jobs, review applications, analyze resume matches, and manage candidates from a dedicated dashboard.

---

## 🌐 Live Demo

👉 [https://smarthire-ai-907b.onrender.com](https://smarthire-ai-907b.onrender.com)

## 📂 GitHub Repository

👉 [https://github.com/shouvik000/SmartHire-AI](https://github.com/shouvik000/SmartHire-AI)

---

## ✨ Features

### 🔐 Authentication

- User Registration
- User Login
- User Logout
- Session-based Authentication
- Protected Routes
- Authenticated User Dashboard

### 💼 Job Management

- Post New Jobs
- Edit Existing Jobs
- Delete Jobs
- View Available Jobs
- Search Jobs
- Job Details
- Required Skills for Each Job
- Company and Location Information
- Salary Information

### 📄 Job Applications

Users can apply for jobs by providing:

- Full Name
- Email
- Phone Number
- Skills
- Cover Letter
- Resume

**Resume upload supports:** PDF, DOC, DOCX
**Maximum resume upload size:** 5 MB

---

## 🤖 Resume Match System

SmartHire AI includes a resume-to-job skill matching system.

When a candidate submits an application:

1. The uploaded resume is processed.
2. Resume text is extracted.
3. Required job skills are obtained from the database.
4. Resume skills are compared with required skills.
5. A Resume Match Score is calculated.
6. Matched skills and missing skills are identified.
7. The application is stored in PostgreSQL.
8. The candidate receives a submission confirmation with the match score.

### Example

If a job requires:

```
Node.js, Express.js, PostgreSQL, JavaScript
```

and the resume contains:

```
Node.js, Express.js, JavaScript
```

the system calculates the matching percentage based on the matched required skills — in this case, **75%**.

### 📊 Resume Match Score Levels

| Score | Result |
|---|---|
| 70%+ | 🎯 Excellent Match |
| 40–69% | 👍 Good Match |
| Below 40% | 📌 Low Match |

The application also displays:

- ✅ Matched Skills
- ❌ Missing Skills
- 📊 Match Percentage

---

## 👨‍💼 Recruiter Application Management

Recruiters can view applications submitted specifically for the jobs **they have posted**. Applications from other recruiters' jobs are not shown in the user's application management page.

For each candidate, recruiters can view:

- 👤 Applicant Name
- 📧 Email
- 📞 Phone
- 💼 Applied Job
- 🏢 Company
- 📍 Location
- 🛠️ Candidate Skills
- 📝 Cover Letter
- 📄 Uploaded Resume
- 🤖 Resume Match Score
- 📌 Application Status

Recruiters can also:

- 📄 View Candidate Resume
- ✅ Accept Application
- 🗑️ Delete Application

### 📋 Application Status

Applications can have different statuses, for example:

- `Applied`
- `Accepted`

When a recruiter accepts an application, the status changes to **✅ Accepted**.

---

## 📊 Dashboard

SmartHire AI includes a modern dashboard containing:

- 👥 Total Users
- 💼 Total Jobs
- 📄 Total Applications
- 🔗 Quick access to Jobs
- ➕ Quick access to Post Job
- 📋 Floating Applications button
- 🚪 Logout

---

## 🔍 Job Search

Users can search jobs using:

- Job Title
- Company
- Location

Example queries: `Node.js`, `Developer`, `Kolkata`

---

## 📎 Resume Upload

Resume files are stored in the application's `uploads/` directory.

- **Supported formats:** PDF, DOC, DOCX
- **Maximum file size:** 5 MB

---

## 🧠 Application Workflow

**Candidate flow:**

```
Browse Jobs
    │
    ▼
Select Job
    │
    ▼
Apply Now
    │
    ▼
Upload Resume
    │
    ▼
Resume Text Extraction
    │
    ▼
Skill Matching
    │
    ▼
Calculate Match Score
    │
    ▼
Save Application
    │
    ▼
Application Submitted Successfully
```

**Employer flow:**

```
Dashboard
    │
    ▼
View Applications
    │
    ▼
See Candidates for Own Jobs
    │
    ├── 📄 View Resume
    ├── 🤖 Check Match Score
    ├── ✅ Accept
    └── 🗑️ Delete
```

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon) |
| Frontend | EJS, HTML5, CSS3, Bootstrap 5, JavaScript |
| Authentication | Express Session |
| File Upload | Multer |
| Resume Processing | pdf-parse, Mammoth |
| Deployment | Render |
| Version Control | Git, GitHub |

---

## 🏗️ Project Architecture

SmartHire AI follows a structured MVC-style architecture.

```
SmartHire-AI/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── jobController.js
│   └── applicationController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── routes/
│   ├── authRoutes.js
│   ├── jobRoutes.js
│   └── applicationRoutes.js
│
├── public/
│   ├── css/
│   └── screenshots/
│
├── uploads/
│   └── (uploaded resumes — excluded from Git)
│
├── views/
│   ├── applications/
│   │   ├── apply.ejs
│   │   ├── applications.ejs
│   │   ├── success.ejs
│   │   └── viewApplication.ejs
│   │
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   │
│   ├── jobs/
│   │   ├── jobs.ejs
│   │   ├── addJob.ejs
│   │   └── editJob.ejs
│   │
│   ├── dashboard.ejs
│   └── index.ejs
│
├── app.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🗄️ Database

SmartHire AI uses **PostgreSQL** (hosted on **Neon**) for storing application and recruitment data.

**Main entities:**

**Users** — Stores registered users and authentication information.

**Jobs** — Stores job title, company, location, salary, description, required skills, and job creator.

**Applications** — Stores applicant information, job information, skills, cover letter, resume filename, resume match score, application status, and submission timestamp.

---

## 🔒 Security

- Session-based authentication
- Protected application routes
- Environment variables for sensitive credentials
- Parameterized PostgreSQL queries
- File upload restrictions
- Resume file size limitation
- `.env` excluded from Git

> Sensitive information such as database credentials and session secrets should never be committed to GitHub.

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/shouvik000/SmartHire-AI.git
```

### 2. Enter the project directory

```bash
cd SmartHire-AI
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=YOUR_DATABASE_URL
SESSION_SECRET=YOUR_SECRET
PORT=3000
```

**Example:**

```env
DATABASE_URL=postgresql://username:password@host/database
SESSION_SECRET=your_secure_session_secret
PORT=3000
```

> ⚠️ Never upload your real `.env` file to GitHub.

### 5. Run locally

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

The application will run at: `http://localhost:3000`

---

## ☁️ Deployment

SmartHire AI is deployed using **Render**.

**Deployment configuration:**

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- Environment variables are configured directly in the Render dashboard.

---

## 📸 Screenshots

| | |
|---|---|
| **🏠 Landing Page** | ![Landing Page](public/screenshots/landing.png) |
| **🔐 Login Page** | ![Login Page](public/screenshots/login.png) |
| **📊 Dashboard** | ![Dashboard](public/screenshots/dashboard.png) |
| **💼 Jobs Page** | ![Jobs Page](public/screenshots/jobs.png) |
| **📋 Applications** | ![Applications](public/screenshots/applications.png) |

> Screenshot files should live in `public/screenshots/` with the names above so they render correctly on GitHub.

---

## 🚀 Future Improvements

- 🔔 Real-time employer notifications
- 📧 Email notifications for applications
- 🧠 More advanced AI resume analysis
- 📊 Candidate ranking system
- 🔎 Advanced job filtering
- 👤 Candidate profile pages
- 🏷️ Application status workflow
- 📈 Recruitment analytics
- 💬 Employer-candidate messaging
- ⭐ Candidate bookmarking
- 🔐 Role-based authorization
- 📱 Improved mobile UI

---

## 🎯 Project Purpose

SmartHire AI was developed as a full-stack backend-focused project to demonstrate practical experience with:

- RESTful routing
- MVC architecture
- PostgreSQL database integration
- Authentication and sessions
- CRUD operations
- File uploads
- Resume processing
- Skill matching
- Application management
- Server-side rendering
- Cloud deployment

---

## 👨‍💻 Author

**Shouvik Bagdi**
Backend Developer | Node.js | Express.js | PostgreSQL

**Tech Interests:** Node.js, Express.js, PostgreSQL, REST APIs, Backend Development, Database Design

---
