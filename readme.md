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

### Phase 4: Frontend Development (UI/UX) ✅
- **Design System:** Engineered a premium, glassmorphism-based UI using CSS variables and Lucide icons.
- **Atomic Architecture:** Built a reusable component library (`Button`, `InputField`, `Card`) for a unified aesthetic.
- **Auth Flow:** Developed high-fidelity Login/Register forms with password visibility toggles.
- **Dashboards:** Created specialized, responsive layouts for both Patients (Discovery) and Providers (Management).

### Phase 5: Integration & Advanced Features ✅
- **Discovery Engine:** Implemented real-time search and multi-category filtering for service providers.
- **Process Wizard:** Integrated a multi-step mock payment gateway within the booking experience.
- **State Management:** Fully connected frontend components to modular backend services via Axios.
- **Aesthetic Polish:** Optimized for modern typography (Outfit Font) and smooth micro-animations.

### Phase 6: Advanced 7-Step Booking Flow ✅
- **Healthcare Logic:** Crafted a functional 7-step wizard (Facility -> Mode -> Type -> Dept -> Slot -> Auth -> SMS).
- **Relational Data:** Introduced a dedicated `Hospital` model linked to providers for realistic facility tracking.
- **Confirmation UX:** Developed a stylized digital "SMS Bubble" simulation with mock phone verification.
- **Dynamic Cascading:** Engineered intelligent dropdowns that filter data based on previously selected states/hospitals.

---

## 💎 Key Technical Features
- **Modular Monolith:** Backend architecture designed for easy transition to microservices.
- **Security First:** JWT authentication, bcrypt password hashing, and role-based middleware protection.
- **Seed System:** Robust script to populate realistic healthcare data for instant demonstration.
- **Responsive & Alive:** Fully mobile-responsive design with hover effects and glassmorphism elements.

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
