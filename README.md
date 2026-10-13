# SkillSwap — Creative React + Spring Boot + MySQL starter

This frontend is designed to fit your existing Vite project and existing student endpoints.

## What's included
- Modern purple-blue responsive landing page
- Registration form connected to `POST /api/students/register`
- Dashboard using `GET /api/students`
- Discover page with search and skill filter
- Skill match suggestions based on the signed-in user's wanted skills
- XP, levels and badges (prototype state stored in browser localStorage)
- Chat interface (prototype messages stored in browser localStorage)
- Login form that calls `POST /api/auth/login`

## 1. Put the frontend files into your existing project
Copy these files into `Skillswap/frontend/src/`:
- `App.jsx`
- `main.jsx`
- `style.css`

Replace the existing files when prompted. Keep your existing `index.html`, `package.json`, and Vite configuration.

## 2. Start the frontend
Open VS Code terminal:
```bash
cd C:\Users\Sreej\OneDrive\Desktop\Skillswap\frontend
npm install
npm run dev
```
Open the URL Vite prints, normally `http://localhost:5173`.

## 3. Start the backend
Open a second terminal in VS Code and run your existing Spring Boot application. Keep it running on `http://localhost:8080`.
Set the database password in the terminal before starting Spring Boot:
```powershell
$env:DB_PASSWORD = "your-local-database-password"
```

The frontend calls:
- `GET http://localhost:8080/api/students`
- `POST http://localhost:8080/api/students/register`
- `POST http://localhost:8080/api/auth/login`

## 4. Add login endpoint
Follow `backend/README-BACKEND-ADDITIONS.md` and create `AuthController.java` inside your existing Spring Boot source tree. The code assumes packages:
- `com.skillswap.skillswap.entity.Student`
- `com.skillswap.skillswap.repository.StudentRepository`
- `com.skillswap.skillswap.controller`

Adjust package names if yours differ. Restart Spring Boot after adding the controller.

## Prototype limitations (important)
- Chat messages and XP are saved only in the current browser. They are not shared across users/devices.
- Demo student cards are included so the site looks populated while you build. Your real database students are also loaded from the API.
- The simple login endpoint described in the backend guide compares existing stored passwords and is only for a local prototype with test data. Your earlier backend stores passwords in plain text. Do not use real or reused passwords. Before real use, implement BCrypt hashing and Spring Security, and persist chat messages in MySQL.
- Skill matching is a frontend prototype based on exact comma-separated skill names, not an AI recommendation engine yet.
