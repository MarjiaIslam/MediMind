# 🏥 MediMind - Your Digital Health Companion

<div align="center">

![MediMind Banner](https://img.shields.io/badge/MediMind-Health%20Companion-4CAF50?style=for-the-badge&logo=heart&logoColor=white)

[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](https://github.com/MarjiaIslam/MediMind)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**A comprehensive health management platform combining medicine tracking, nutrition planning, mood journaling, and gamified wellness.**

[Features](#-key-features) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Tech Stack](#-technology-stack)

</div>

---

## 📖 Overview

**MediMind** is an intelligent health companion designed to help users:
- 💊 Track daily medicines with smart reminders
- 🍎 Plan nutritious meals with allergy-aware suggestions
- 📔 Journal moods and mental well-being
- 💧 Monitor hydration levels
- 🎮 Stay motivated with gamification and badges

Built with **Java Spring Boot** backend and **React TypeScript** frontend, MediMind provides a seamless, responsive experience across devices.

---

## 🚀 Quick Start

### Using GitHub Codespaces or Dev Containers (Recommended)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MarjiaIslam/MediMind)

1. Click the button above or clone locally and open in VS Code Dev Container
2. Run the automated setup and start scripts:

```bash
# One-time setup (installs all dependencies)
./scripts/setup.sh

# Start both backend and frontend
./scripts/start.sh

# Or start individually:
./scripts/start-backend.sh   # Backend only (port 8080)
./scripts/start-frontend.sh  # Frontend only (port 5173)

# Stop all services
./scripts/stop.sh
```

3. Access the application:
   - 🌐 **Frontend**: http://localhost:5173
   - ⚙️ **Backend API**: http://localhost:8080
   - 🗄️ **H2 Console**: http://localhost:8080/h2-console

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
- Custom profile picture or avatar icons
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
- Customizable daily goals

### 📔 Mood Journal
- Daily diary with mood tracking
- Multiple mood options: Happy, Stressed, Calm, Tired, Sad, Excited, Anxious, Grateful
- Search entries by keyword or date
- Motivational quotes based on mood

### 🎮 Gamification & Rewards
- **Points system** - Earn points for healthy habits
- **Level progression** - Level up as you grow
- **Badges** - Bronze, Silver, Gold achievements

### 📊 Health Dashboard
- BMI display with health category
- Daily calorie recommendations
- Medicine progress at a glance
- Ideal weight range calculator

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

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/{id}` | Get user profile |
| `PUT` | `/api/user/{id}` | Update user profile |
| `DELETE` | `/api/user/{id}` | Delete account |

### Medicines
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/medicine/user/{userId}` | Get all medicines |
| `POST` | `/api/medicine/add` | Add new medicine |
| `PUT` | `/api/medicine/{id}` | Update medicine |
| `DELETE` | `/api/medicine/{id}` | Delete medicine |
| `PUT` | `/api/medicine/{id}/take` | Mark dose as taken |

### Meals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/meals/suggest` | Get meal suggestions |
| `POST` | `/api/meals/log` | Log a meal |
| `GET` | `/api/meals/user/{userId}` | Get meal history |

### Journal
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/journal/user/{userId}` | Get all entries |
| `POST` | `/api/journal/add` | Create entry |
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
