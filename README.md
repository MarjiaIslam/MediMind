# 🏥 MediMind - Your Digital Health Companion

<div align="center">

![MediMind Banner](https://img.shields.io/badge/MediMind-Health%20Companion-14b8a6?style=for-the-badge&logo=heart&logoColor=white)

[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](https://github.com/MarjiaIslam/MediMind)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A comprehensive health management platform combining medicine tracking, nutrition planning, mood journaling, hydration tracking, and gamified wellness with achievements.**

[Features](#-key-features) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Tech Stack](#-technology-stack)

</div>

---

## 📖 Overview

**MediMind** is an intelligent health companion designed to help users:
- 💊 Track daily medicines with smart reminders and browser notifications
- 🍎 Plan nutritious meals with allergy-aware suggestions
- 📔 Journal moods and mental well-being
- 💧 Monitor hydration levels with daily goals
- 🎮 Stay motivated with daily streaks, achievements, and badge progression
- 📊 View personalized health dashboards with BMI and calorie tracking

Built with **Java Spring Boot** backend and **React TypeScript** frontend, MediMind provides a seamless, responsive experience across devices.

---

## 🚀 Quick Start

### Using GitHub Codespaces or Dev Containers (Recommended)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MarjiaIslam/MediMind)

1. **Open in Codespaces** or VS Code Dev Container - All dependencies (Java 17, Maven, Node.js 20, npm) are installed automatically.

2. **Start the application** in two separate terminals:

```bash
# Terminal 1 - Backend
cd backend && mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Manual Setup (Without Containers)

#### Prerequisites
| Tool | Version | Download |
|------|---------|----------|
| Java | 17+ | [Download](https://adoptium.net/) |
| Maven | 3.8+ | [Download](https://maven.apache.org/download.cgi) |
| Node.js | 18+ | [Download](https://nodejs.org/) |

#### Installation

```bash
# Clone the repository
git clone https://github.com/MarjiaIslam/MediMind.git
cd MediMind

# Start Backend (Terminal 1)
cd backend
mvn spring-boot:run

# Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

### Access the Application

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8080 |
| 🗄️ H2 Console | http://localhost:8080/h2-console |

---

## 📋 Technical Requirements Fulfilled

This project demonstrates key software engineering concepts:

| Requirement | Status | Implementation Details |
|-------------|--------|------------------------|
| **REST APIs** | ✅ Complete | Full CRUD operations with `@RestController`, `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`. Controllers: `AuthController`, `UserController`, `MedicineController`, `MealController`, `JournalController` |
| **Networking** | ✅ Complete | Frontend uses **Axios** for async HTTP requests. Backend configured with `@CrossOrigin` for CORS. Client-server architecture over HTTP. **SMTP email** for verification |
| **Threads** | ✅ Complete | `@Scheduled` cron tasks for medicine reminders & daily resets. `@Async` methods with `CompletableFuture` for non-blocking processing. `ExecutorService` thread pool for parallel medicine checking. `ConcurrentHashMap` for thread-safe notifications |

### Threading Implementation Details

| Component | Thread Concept | Location |
|-----------|---------------|----------|
| Medicine Reminder Check | `@Scheduled(cron)` - Runs every minute | `BackgroundTaskService.java` |
| Daily Medicine Reset | `@Scheduled(cron)` - Runs at midnight | `BackgroundTaskService.java` |
| Health Summary Calculator | `@Scheduled(cron)` - Runs at 6 AM | `BackgroundTaskService.java` |
| Adherence Calculator | `@Async` + `CompletableFuture` | `BackgroundTaskService.java` |
| Meal Processing | `@Async` + `CompletableFuture` | `BackgroundTaskService.java` |
| Parallel Medicine Checks | `ExecutorService` thread pool | `BackgroundTaskService.java` |
| Notification Storage | `ConcurrentHashMap` (thread-safe) | `BackgroundTaskService.java` |
| Email Sending | `@Async` non-blocking | `EmailService.java` |

### Networking Implementation Details

| Component | Network Concept | Location |
|-----------|-----------------|----------|
| REST API Calls | Axios HTTP Client | `Auth.tsx`, all frontend components |
| CORS Configuration | `@CrossOrigin` | All controllers |
| Email Verification | SMTP Protocol (Gmail) | `EmailService.java` |
| DNS Domain Validation | `InetAddress` lookup | `EmailService.java` |

---

## ✨ Key Features

### 👤 User Profile & Personalization
- Secure registration & login with **email verification**
- **Email domain validation** - Only real email domains accepted
- **6-digit verification code** sent to email
- **Password reset** via email with secure tokens
- Custom profile picture or avatar icons
- **Guided profile setup** for new users
- Deep health profile: age, weight, height, allergies, chronic conditions
- Automatic BMI calculation with health categories
- Personalized daily calorie recommendations

### 💊 MyMedicine - Smart Medication Tracker
- **Multi-dose scheduling** - Up to 3 times per day
- **Duration tracking** - Set start/end dates
- **Visual dashboard** - Today's taken vs remaining doses
- **Adherence tracking** - Percentage completion
- **Browser notifications** - Never miss a dose
- **Full CRUD** - Add, edit, delete medicines

### 🍎 MealMate - Intelligent Nutrition Planner
- **Allergy warnings** - Alerts for seafood, nuts, dairy, gluten, etc.
- **Health condition filtering** - Considers diabetes, hypertension, heart conditions
- **Smart suggestions** - Based on ingredients and cuisine preferences
- **Health compatibility score** - Meal-to-profile matching
- **Macro tracking** - Daily calorie logging

### 💧 Hydration Tracker
- Daily water intake monitoring
- Visual progress indicators
- 8-glass daily goal

### 📔 Mood Journal
- Daily diary with mood tracking
- Multiple mood options: Happy, Excited, Calm, Grateful, Tired, Anxious, Sad, Angry
- Search entries by keyword or date
- Full entry editing and deletion

### 🎮 Gamification & Rewards
- **Points system** - Earn points for healthy habits
- **Daily streak** - Claim daily rewards to build streaks
- **Level progression** - Bronze, Silver, Gold, Platinum, Diamond
- **12 Achievements** - Track progress across various health goals

### 📊 Health Dashboard
- BMI display with health category
- Daily calorie recommendations
- Medicine progress at a glance
- Notes/Journal entry counter

---

## 📁 Project Structure

```
MediMind/
├── 📁 .devcontainer/          # Dev container configuration
│   └── devcontainer.json      # Auto-setup for VS Code
├── 📁 backend/                 # Spring Boot API
│   ├── 📁 src/main/java/com/medimind/api/
│   │   ├── 📁 controller/     # REST endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── JournalController.java
│   │   │   ├── MealController.java
│   │   │   ├── MedicineController.java
│   │   │   └── UserController.java
│   │   ├── 📁 model/          # JPA entities
│   │   │   ├── User.java
│   │   │   ├── Medicine.java
│   │   │   ├── Meal.java
│   │   │   └── JournalEntry.java
│   │   ├── 📁 repository/     # Data access layer
│   │   ├── 📁 service/        # Business logic
│   │   └── MediMindApplication.java
│   ├── 📁 src/main/resources/
│   │   └── application.properties
│   └── pom.xml                # Maven dependencies
├── 📁 frontend/               # React TypeScript app
│   ├── 📁 src/
│   │   ├── App.tsx            # Main router
│   │   ├── Auth.tsx           # Login/Register
│   │   ├── Dashboard.tsx      # Health overview
│   │   ├── MealMate.tsx       # Nutrition planner
│   │   ├── MyMedicine.tsx     # Medicine tracker
│   │   ├── Hydration.tsx      # Water tracking
│   │   ├── Journal.tsx        # Mood diary
│   │   ├── Badges.tsx         # Gamification
│   │   ├── Profile.tsx        # User settings
│   │   ├── ProfileSetup.tsx   # Onboarding
│   │   └── index.css          # Tailwind styles
│   ├── package.json           # npm dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind theme
│   └── tsconfig.json          # TypeScript config
├── LICENSE
└── README.md
```

---

## 🔗 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/{id}` | Get user profile |
| `PUT` | `/api/user/update` | Update user profile |
| `DELETE` | `/api/user/{id}` | Delete account |
| `GET` | `/api/user/bmi/{id}` | Get BMI info |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/medicine/{userId}` | Get all medicines |
| `GET` | `/api/medicine/today/{userId}` | Get today's schedule |
| `POST` | `/api/medicine/add` | Add new medicine |
| `PUT` | `/api/medicine/{id}` | Update medicine |
| `DELETE` | `/api/medicine/{id}` | Delete medicine |
| `PUT` | `/api/medicine/toggle/{id}/{slot}` | Mark dose as taken |

### Meals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/meals/suggestions/recommended` | Get meal suggestions |
| `POST` | `/api/meals/log` | Log a meal |
| `GET` | `/api/meals/history/{userId}` | Get meal history |
| `DELETE` | `/api/meals/{mealId}` | Delete a meal |

### Journal
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/journal/{userId}` | Get all entries |
| `POST` | `/api/journal/add` | Create entry |
| `PUT` | `/api/journal/{id}` | Update entry |
| `DELETE` | `/api/journal/{id}` | Delete entry |

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Java 17** | Core language |
| **Spring Boot 3.2** | REST API framework |
| **Spring Data JPA** | Database abstraction |
| **Hibernate** | ORM for data persistence |
| **H2 Database** | In-memory database (dev) |
| **Jakarta Validation** | Input validation |
| **Lombok** | Boilerplate reduction |
| **Maven** | Build & dependency management |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript 5** | Type-safe JavaScript |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **React Router 6** | Client-side routing |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Dev Containers** | Reproducible dev environment |
| **Git** | Version control |

---

## 🔒 Data Privacy

MediMind prioritizes user privacy:
- 🔐 Passwords are securely handled
- 📊 Health data is user-specific and isolated
- 🗑️ Full account deletion available
- 🚫 No data sharing with third parties

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💡 Inspiration

MediMind transforms health management from a chore into an engaging habit. By combining **automated medicine tracking**, **intelligent nutrition planning**, and **gamified mental wellness**, we provide a smart companion that actively encourages a healthier lifestyle through personalized care.

---

<div align="center">

**Made with ❤️ for better health**

⭐ Star this repo if you find it helpful!

</div>
