# How to Run the Alumni Platform Backend in VS Code

This guide will help you get the project running locally and test the API.

## Prerequisites
- **VS Code** installed.
- **Node.js** (v18+) installed.
- **MongoDB** installed locally OR a **MongoDB Atlas** account.

---

## 🚀 Getting Started

### 1. Open the Project
1. Open VS Code.
2. Go to `File > Open Folder...` and select the `alumni-backend` directory.

### 2. Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + ` `) and run:
```bash
npm install
```

### 3. Configure Environment Variables
The `.env` file is already configured to work with a local MongoDB by default.
- **Local MongoDB:** `DATABASE=mongodb://localhost:27017/alumni_db` (Recommended for testing)
- **Atlas MongoDB:** If you use Atlas, ensure your IP is whitelisted in the Atlas Dashboard.

### 4. Start the Server
In the terminal, run:
```bash
npm run dev
```
You should see: `Server running in development mode on port 5000`.

---

## 🛠️ Testing the API

### 1. Automatic Test Suite (Recommended)
I have created a comprehensive test script that registers users, seeds data, and tests all 58 scenarios.
While the server is running, open a **second terminal** and run:
```bash
node api_test.js
```

### 2. Manual Testing (Postman/Thunder Client)
- **Base URL:** `http://localhost:5000/api`
- **Health Check:** `GET /health`
- **Register:** `POST /auth/register`
- **Login:** `POST /auth/login` (returns a token)
- **Protected Routes:** Include the token in the `Authorization` header as `Bearer <token>`.

---

## 🔑 How to Create an Admin User
Admin-only routes (like approving stories or viewing all donations) require an `admin` role.
1. Register a user normally.
2. In the terminal, run the bootstrap script:
```bash
node scripts/makeAdmin.js your_email@example.com
```

---

## ✅ Recent Bug Fixes Applied
- **JWT Errors:** Now return 401 instead of 500.
- **Security:** Stack traces are hidden in production mode.
- **Startup:** Redundant database index warning removed.
- **Features:** Added missing `PATCH` routes for Jobs and Events, and `update-password` for Auth.
