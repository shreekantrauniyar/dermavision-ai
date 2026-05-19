# 🔬 DermaVision AI

> AI-powered dermatology analysis platform with real-time skin condition detection, secure patient management, and an intelligent chat assistant.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

## ✨ Features

### 🩺 AI Skin Analysis
- Upload a photo of any skin condition
- Get instant AI-powered diagnosis with confidence scores
- Receive symptoms, causes, precautions, and treatment recommendations
- Powered by Groq's LLaMA 4 Scout vision model

### 🔒 Enterprise-Grade Security
- **JWT Authentication** with HTTP-only cookies
- **bcrypt** password hashing (10 salt rounds)
- Role-Based Access Control (RBAC) for Admin vs Patient
- Protected API routes with middleware authentication

### 🗄️ Real Database (Prisma + SQLite)
- Relational database with User and Scan models
- One-to-many relationships (User → Scans)
- Cascading deletes for data integrity
- Visual database management via Prisma Studio

### 👨‍⚕️ Admin Dashboard
- View all registered users across the platform
- Monitor all patient scans in a real-time global feed
- Ban users and delete their medical records
- Delete individual scans from any patient

### 💬 AI Chat Assistant
- Context-aware dermatology chatbot
- Chat history persistence
- Powered by LLaMA 3.3 70B

### 🌙 Dark Mode
- Full dark mode support across all pages
- Persistent theme preference via localStorage

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, TailwindCSS 4, Framer Motion |
| **Backend** | Express.js, Node.js |
| **Database** | SQLite via Prisma ORM |
| **Auth** | JWT + bcrypt |
| **AI** | Groq API (LLaMA 4 Scout for vision, LLaMA 3.3 70B for chat) |
| **Charts** | Recharts |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dermavision-ai.git
cd dermavision-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Groq API key

# Set up the database
npx prisma db push

# Start the development server
npm run dev
```

The app will be running at `http://localhost:3000`

### Database Management

```bash
# Open the visual database editor
npx prisma studio
```

This opens a browser-based GUI at `http://localhost:5555` to view and manage all data.

## 📁 Project Structure

```
dermavision-ai/
├── prisma/
│   └── schema.prisma      # Database schema (User & Scan models)
├── src/
│   ├── components/
│   │   ├── Layout.tsx      # Auth-guarded layout wrapper
│   │   ├── Navbar.tsx      # Top navigation bar
│   │   └── Sidebar.tsx     # Side navigation with admin link
│   ├── hooks/
│   │   ├── useAuth.ts      # JWT authentication hook
│   │   └── useScans.ts     # Scan data fetching hook
│   ├── pages/
│   │   ├── AdminPage.tsx   # Admin dashboard (RBAC protected)
│   │   ├── ChatPage.tsx    # AI chat assistant
│   │   ├── Dashboard.tsx   # Patient health dashboard
│   │   ├── HistoryPage.tsx # Scan history with detail modals
│   │   ├── LoginPage.tsx   # Authentication (login/signup)
│   │   ├── ScanPage.tsx    # Image upload & AI analysis
│   │   └── SettingsPage.tsx# Settings with dark mode toggle
│   ├── App.tsx             # Router configuration
│   └── main.tsx            # React entry point
├── server.ts               # Express backend (API + Auth + DB)
├── .env.example            # Environment variable template
└── package.json
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/me` | Get current user session |
| DELETE | `/api/auth/delete-account` | Permanently delete account |

### Scans (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scans` | Get user's scan history |
| POST | `/api/scans` | Save a new scan result |
| DELETE | `/api/scans/:id` | Delete a specific scan |

### Admin (Admin-only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/scans` | List all scans globally |
| DELETE | `/api/admin/users/:id` | Ban user & delete data |
| DELETE | `/api/admin/scans/:id` | Delete any scan |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze-skin` | Analyze skin image |
| POST | `/api/chat` | Chat with AI assistant |

## 👤 Admin Access

To access the admin dashboard, create an account with:
- **Email:** `admin@dermavision.com`
- **Password:** Any password (6+ characters)

## 📄 License

This project is for educational and demonstration purposes.

---

Built with ❤️ using React, Express, Prisma & Groq AI
