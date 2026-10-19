# NEXORA — Online Assessment Platform
> **"Assess knowledge. Unlock potential."**

An enterprise-grade, full-stack online examination platform engineered for software engineering rigor, academic assessments, and recruitment screening. Built with a modern **React 19 + TypeScript + Vite + Tailwind CSS** client and an accompanying **Spring Boot 3 + Spring Data JPA + MySQL** REST backend architecture.

---

## 🌟 Key Application Modules

### 1. Student Assessment Portal
- **Personalized Welcome & Date-Aware Dashboard**: Dynamic greeting, daily study status, real-time metrics for available tests, completed assessments, average score percentage, and overall pass rate calculated directly from student submissions.
- **Assessment Catalog**: Real-time search by title or keyword, multi-subject filter, difficulty level filtering (Beginner, Intermediate, Advanced), and duration sorting.
- **Syllabus & Rules Modal**: Comprehensive pre-exam briefing detailing duration, total question count, passing grade threshold, and academic honesty guidelines.
- **Timed Examination Session**:
  - Live MM:SS countdown timer with urgent visual alerting when `< 3:00` remains.
  - Automatic submission and answer compiling when time expires (`00:00`).
  - Keyboard navigation (1–4, A–D, arrow keys) and one-question-at-a-time focus.
  - Interactive Question Navigator Palette indicating Answered, Unanswered, and Flagged items.
  - Continuous local auto-save ensuring connection hiccups or accidental refreshes preserve candidate progress.
  - Pre-submission confirmation dialog warning of unanswered items.
- **Diagnostic Diagnostic Results & Review**:
  - Immediate score calculation (earned marks vs total, percentage, pass/fail status).
  - Celebratory confetti burst on passing performance.
  - Question-by-question review showing candidate choice, the correct key, and an in-depth technical explanation.
  - Retake exam and transcript navigation shortcuts.

### 2. External Product REST API Explorer
- **Decoupled Architecture**: Integrated into the app as a separate, clearly labeled demonstration module without confusing product browsing with the examination workflow.
- **Live DummyJSON Integration**: Consumes the public REST API (`https://dummyjson.com/products`).
- **Performance Optimized**:
  - Debounced search input (350ms delay) to prevent redundant network requests.
  - Dynamic category selector querying live API categories.
  - Multi-criteria sorting (Price Low/High, Rating, Alphabetical).
  - Controlled pagination (items per page, skip/limit parameter support).
  - Geometric skeleton loading states, empty search fallback, and error handling with a retry button.
  - Detailed product inspector modal featuring full image galleries, technical specifications, and warranty details.
  - *Android Note*: Equivalent web implementation of list recycling and controlled rendering without claiming to run Android `RecyclerView` in the browser.

### 3. Faculty & Administrator Console
- **Role-Based Authorization Gate**: Dedicated views protected for `ADMIN` role. Features an instant evaluator switcher to toggle between Student and Admin privileges.
- **KPI Summary**: Real-time counts for active exams, total question items, student attempt logs, and aggregate candidate pass percentage.
- **Exam Management**: Create new examinations, edit syllabus details, delete exams, and toggle public visibility (Published vs Draft).
- **Question Bank Management**: Filter questions by exam, author multi-choice questions with 4 choices, select correct answer key, assign marks, and author diagnostic explanations.
- **Submission Auditing**: Inspect raw timestamps, answer keys, and graded outcomes for all student attempts.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion, Canvas-Confetti |
| **Backend** | Java 17+, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security 6 |
| **Authentication** | JSON Web Tokens (JWT) with BCrypt password hashing |
| **Database** | MySQL 8.0+ / Relational Schema |
| **External API** | DummyJSON Public Products REST API |
| **Testing** | JUnit 5, Spring Boot Test, MockMvc, React Component Validation |

---

## 🚀 Quick Start Guide

### Frontend Development Server (AI Studio / Local)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Vite Development Server**:
   ```bash
   npm run dev
   ```
   The application will boot on `http://localhost:3000`.

3. **Build for Production**:
   ```bash
   npm run build
   ```

### 1-Click Evaluator Sign-In
To facilitate rapid code review and portfolio evaluation, the login screen includes 1-click preset authentication:
- **Demo Student**: `alex.rivera@nexora.edu` (Preloaded with exam attempts and transcript)
- **Demo Admin**: `evelyn.chen@nexora.edu` (Full administrative privileges)
- You can also toggle roles anytime using the role switcher located at the top of the sidebar.

---

## ☕ Spring Boot 3 Backend Setup (Local Environment)

The complete Spring Boot 3 backend project structure is located in `/backend-spring-boot`.

### Prerequisites
- Java Development Kit (JDK) 17 or higher
- Apache Maven 3.8+
- MySQL Server 8.0+

### Database Configuration
1. Create a MySQL database:
   ```sql
   CREATE DATABASE nexora_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'nexora_user'@'localhost' IDENTIFIED BY 'nexora_secure_password';
   GRANT ALL PRIVILEGES ON nexora_db.* TO 'nexora_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Configure environment variables in `backend-spring-boot/.env` or export directly:
   ```bash
   export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/nexora_db?useSSL=false&serverTimezone=UTC
   export SPRING_DATASOURCE_USERNAME=nexora_user
   export SPRING_DATASOURCE_PASSWORD=nexora_secure_password
   export JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   ```

3. Run the Spring Boot application:
   ```bash
   cd backend-spring-boot
   mvn spring-boot:run
   ```
   The API will listen on `http://localhost:8080`.

---

## 📡 REST API Specification

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student or faculty account | Public |
| `POST` | `/api/auth/login` | Authenticate with credentials and receive JWT | Public |
| `GET` | `/api/auth/me` | Retrieve profile of the authenticated user | Authenticated |

### Examinations (`/api/exams`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/exams` | Retrieve all published exams with metadata | Public |
| `GET` | `/api/exams/{id}` | Retrieve exam details, syllabus, and rules | Public |
| `POST` | `/api/exams` | Create a new examination | Admin Only |
| `PUT` | `/api/exams/{id}` | Update existing examination details | Admin Only |
| `DELETE` | `/api/exams/{id}` | Delete exam and associated question bank | Admin Only |

### Assessment Attempts & Scoring (`/api/attempts`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/exams/{id}/attempts` | Initialize timed examination session | Student |
| `PUT` | `/api/attempts/{id}/answers` | Autosave interim answer key state | Student |
| `POST` | `/api/attempts/{id}/submit` | Compile final submission and grade | Student |
| `GET` | `/api/attempts/{id}/result` | Diagnostic report with question review | Student/Admin |
| `GET` | `/api/results/me` | Complete transcript history for logged-in user | Student |
| `GET` | `/api/admin/attempts` | Audit all platform attempts | Admin Only |

---

## 🔒 Security & Data Integrity
- **Stateless JWT Authorization**: Requests to protected routes require `Authorization: Bearer <token>` headers.
- **Tamper-Resistant Scoring**: Final marks and percentages are computed strictly on the backend/service layer comparing candidate answers with the question bank keys. Answers are never exposed in browser inspection prior to exam submission.
- **Auto-Submission**: When the local countdown timer expires, the exam engine automatically locks input and submits the compiled answer set.
- **Zero Secrets Committed**: All database credentials, JWT secrets, and configuration tokens are driven by environment variables with safe defaults.
