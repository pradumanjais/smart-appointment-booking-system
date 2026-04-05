# Smart Appointment Booking System (SOA)

A premium, service-oriented web application for seamless appointment scheduling between users and service providers (doctors, consultants, etc.).

## 🚀 Development Phase-Wise Plan

### Phase 1: Foundation & Project Setup ✅
- **Directories:** Created `frontend` and `backend` structures.
- **Frontend:** Initialized React.js with Vite and configured premium CSS variables.
- **Backend:** Setup Node.js/Express environment with Mongoose.
- **Infrastructure:** Configured `.env` and initialized core dependencies.

### Phase 2: Authentication & Security ✅
- **User Schema:** Developed robust model with password hashing (bcrypt).
- **JWT Auth:** Integrated JSON Web Tokens for secure session management.
- **Authorization:** Created middleware for role-based access control (User vs. Provider).

### Phase 3: Core Service Logic ✅
- **Provider Service:** CRUD operations for provider profiles and availability management.
- **Booking Service:** Appointment scheduling logic with slot conflict validation.
- **API Gateway:** Integrated routes into a modular monolithic structure.

### Phase 4: Frontend Development (UI/UX) [IN PROGRESS]
- **Design System:** Implementing a premium, glassmorphism-based UI.
- **Auth Flow:** Building Login and Registration forms.
- **Dashboard:** Creating personalized views for Users (Search/Book) and Providers (Schedule).
- **Animations:** Adding micro-animations for an enhanced user experience.

### Phase 5: Integration & Advanced Features [PLANNED]
- **Search & Filter:** Advanced filtering by specialization and location.
- **Notifications:** Simulation of reminders and booking confirmations.
- **Payment Integration:** Mock payment gateway for booking fees.
- **Final Polish:** Cross-browser testing and performance optimization.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, Axios, Lucide Icons, Vanilla CSS.
- **Backend:** Node.js, Express.js, JWT, Bcrypt.js.
- **Database:** MongoDB (Mongoose).

---

## 🏃 How to Run Locally

### 1. Prerequisite
- Ensure you have **Node.js** and **MongoDB** installed and running.

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
*Server will run at http://localhost:5000*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Application will run at http://localhost:5173*
