# 🏥 MediMind - Your Digital Health Companion

![Project Status](https://img.shields.io/badge/Status-Active_Development-green)
[![Tech Stack](https://img.shields.io/badge/stack-Spring%20Boot%20%7C%20React%20TypeScript-blue)]()
![Course](https://img.shields.io/badge/Course-AOOP_Project-orange)

## 📖 Project Overview
**MediMind** is an online health companion designed to help users track daily medicines, monitor mental and physical well-being, and manage nutrition. The system leverages **Java Spring Boot** for robust backend logic (including multi-threaded background tasks for reminders) and **TypeScript** for a dynamic, user-friendly frontend.

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

### Running the Project

**Backend (Terminal 1):**
```bash
cd backend
mvn spring-boot:run
```
Backend runs at: http://localhost:8080

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

### Using Dev Container (Recommended)
If using VS Code with Dev Containers extension:
1. Open the project in VS Code
2. Click "Reopen in Container" when prompted
3. Run the backend and frontend commands above

---

## 🚀 Key Features

### 1. 👤 User Profile & Deep Personalization
- Secure Registration & Login with email validation
- **Profile Picture:** Upload custom image or choose from icon collection
- **Deep Profile:** Age, weight, height, target weight, allergies, chronic conditions
- **BMI Calculator:** Automatic BMI calculation with health category and recommended daily calories
- **Settings:** Notification preferences, notification sounds, account management
- **Delete Account:** Option to permanently delete account and all data

### 2. 💊 MyMedicine (Advanced Tracker & Reminder System)
- **Multi-Time Scheduling:** Add medicines with up to 3 times per day (e.g., 10 AM, 4 PM, 10 PM)
- **Duration Tracking:** Set medication duration in days with start/end dates
- **Today's Schedule:** Visual chart showing taken vs remaining doses
- **Adherence Tracking:** Percentage of doses taken today
- **Browser Notifications:** Get reminded when it's time to take medicine
- **CRUD Operations:** Add, edit, and delete medicines easily

### 3. 🍎 MealMate (Smart Nutrition Planner)
- **Allergy Warnings:** ⚠️ Warns if meal contains allergens (seafood, nuts, dairy, gluten, etc.)
- **Health Condition Filtering:** Recommendations consider diabetes, hypertension, heart conditions
- **Smart Suggestions:** Based on selected ingredients and cuisine preferences
- **Health Compatibility Score:** Shows how well a meal matches your health profile
- **Macro Tracking:** Log meals to track daily calories
- **Hydration:** Water intake tracker

### 4. 📔 Mood Journal
- **Daily Diary:** Write and save journal entries with mood tracking
- **Search Functionality:** Find entries by keyword or date
- **Multiple Moods:** Happy, Stressed, Calm, Tired, Sad, Excited, Anxious, Grateful
- **Random Quotes:** Different motivational messages each time based on mood

### 5. 🎮 Gamification & Rewards
- **Point System:** Earn points for healthy habits
- **Level Progression:** Level up as you accumulate points
- **Badges:** Bronze, Silver, Gold badges for achievements

### 6. 📊 Health Dashboard
- **BMI Display:** Current BMI with health category (Underweight/Normal/Overweight/Obese)
- **Calorie Recommendations:** Daily calorie needs based on your profile
- **Medicine Summary:** Today's medicine progress at a glance
- **Ideal Weight Range:** Shows target weight range for your height

---
## 🛠️ Technology Stack

| Component | Technology | Role in Project |
|-----------|------------|-----------------|
| **Frontend** | React 18 + TypeScript | User Interface, Hooks, State Management |
| **Build Tool** | Vite | Fast development and building |
| **Networking** | Axios | Handling asynchronous REST API requests |
| **Styling** | Tailwind CSS | Responsive Design with custom sage/lavender theme |
| **Backend** | Java Spring Boot 3.2 | REST Controllers, Service Logic |
| **Database** | H2 (dev) / MySQL (prod) | Data Storage |
| **ORM** | Hibernate (JPA) | Object-Relational Mapping |
| **Validation** | Jakarta Validation | Input validation (email, password, etc.) |

---

## ⚙️ How to Run

### Prerequisites
- **Java 17+** - For the Spring Boot backend
- **Maven 3.6+** - For building and running the backend
- **Node.js 18+** - For the React frontend
- **npm** - For managing frontend dependencies

### Backend
```bash
cd backend
mvn spring-boot:run
```
Backend will start on: `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install    # First time only
npm run dev
```
Frontend will start on: `http://localhost:5173`

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080

---

## 🔗 API Endpoints Overview

| Feature | Method | Endpoint | Description |
|---------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/login` | Authenticate user |
| **Profile** | GET | `/api/user/profile` | Fetch allergies & conditions |
| **Medicine** | POST | `/api/medicine/add` | Schedule a new medicine |
| **Medicine** | GET | `/api/medicine/today` | Get today's schedule |
| **Nutrition** | GET | `/api/meals/suggest` | Get filtered meal plans |
| **Gamification**| POST | `/api/mood/log` | Log mood & get response |

---

## 📊 Data Privacy
MediMind is designed with **user privacy and security** in mind. Health data will be stored securely and only accessible to the user.  

---

## 📜 License
This project is licensed under the MIT License.  

---

## 💡 Inspiration
MediMind was created to **transform health management from a chore into an engaging habit**. By seamlessly combining **automated medicine tracking**, **intelligent nutrition planning (MealMate)**, and **gamified mental well-being**, we aim to provide a smart companion that not only tracks health but actively encourages a better lifestyle through personalized care.
