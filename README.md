# 🏥 MediMind - Your Digital Health Companion

![Project Status](https://img.shields.io/badge/Status-Active_Development-green)
[![Tech Stack](https://img.shields.io/badge/stack-Spring%20Boot%20%7C%20React%20TypeScript-blue)]()
![Course](https://img.shields.io/badge/Course-AOOP_Project-orange)

## 📖 Project Overview
**MediMind** is an online health companion designed to help users track daily medicines, monitor mental and physical well-being, and manage nutrition. The system leverages **Java Spring Boot** for robust backend logic (including multi-threaded background tasks for reminders) and **TypeScript** for a dynamic, user-friendly frontend.

---

## 🚀 Key Features

### 1. 👤 User Profile & Deep Personalization
- Secure Registration & Login (JWT/Session).
- **Deep Profile:** Stores age, weight, height, allergies, and chronic conditions.
- **Data Persistence:** User preferences are saved and restored upon login.

### 2. 💊 MyMedicine (Tracker & Reminder System)
- **Schedule Management:** Add medicines with dosage and time.
- **Smart Reminders (Threading):** A background daemon thread runs continuously on the server to check for upcoming or missed doses and triggers system alerts.
- **Dashboard:** Visual view of "Today's Schedule" and "Upcoming."

### 3. 🍎 MealMate (Nutrition Planner)
- **Smart Suggestions:** Recommendations for Breakfast, Lunch, and Dinner based on health conditions (e.g., Diabetic-friendly filters).
- **Macro Tracking:** Log meals to track daily Calories, Proteins, and Carbs.
- **Hydration:** Water intake tracker.

### 4. 🎮 Gamification & Mood Support
- **Reward System:** Users earn **Points** and **Badges** (Bronze, Silver, Gold) for healthy habits.
- **Empathy Engine:** Mood slider where users log emotions and receive comforting, logic-based messages from the system.

### 5. 🔮 Future Scope
- AI-powered health insights  
- IoT integration with wearables & smart devices  

---
## 🛠️ Technology Stack

| Component | Technology | Role in Project |
|-----------|------------|-----------------|
| **Frontend** | ReactJS | User Interface, Hooks, State Management |
| **Networking** | Axios | Handling asynchronous REST API requests |
| **Styling** | CSS / Tailwind | Responsive Design |
| **Backend** | Java Spring Boot | REST Controllers, Service Logic |
| **Database** | MySQL | Relational Data Storage |
| **ORM** | Hibernate (JPA) | Object-Relational Mapping |
| **Concurrency** | Java Threads | Background tasks (`ScheduledExecutorService`) |

---

## ⚙️ Installation & Setup Guide

### Prerequisites
*   Java JDK 17 or higher
*   Node.js & npm
*   MySQL Server

### Step 2: Backend configuration

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will start on: `http://localhost:8080`


### Step 3: Frontend Configuration
1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React application:
    ```bash
    npm start
    ```
4.  Open your browser at `http://localhost:3000`.

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
