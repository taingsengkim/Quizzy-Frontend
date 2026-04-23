# 🧠 Quizzy Frontend

Quizzy is a modern **quiz platform frontend** built with **Next.js, TypeScript, and Redux Toolkit Query**, featuring both **single-player quizzes and real-time multiplayer mode**.

It connects to a Spring Boot backend and supports authentication, quiz gameplay, result tracking, and live multiplayer battles.

---

## 🚀 Features

### 👤 Authentication

- Login / Register
- JWT-based session (access + refresh token)
- Auto token refresh system
- Profile management

### 🧠 Quiz System (Single Player)

- Play quizzes by category
- Multiple choice / true-false / coding questions
- Submit quiz answers
- View results and score history
- Track performance

### ⚔️ Multiplayer Mode

- Real-time quiz battles
- Join room / match system
- Compete with other players live
- Live score updates
- Winner detection at end of match

### 📚 Categories & Quizzes

- Browse quiz categories
- Filter quizzes by category
- Search quizzes
- Paginated data loading

---

## ⚙️ Tech Stack

- Next.js (App Router)
- TypeScript
- Redux Toolkit Query (RTK Query)
- Tailwind CSS
- React Hook Form + Zod
- Framer Motion (animations)
- Sonner (toast notifications)
- WebSocket (for multiplayer real-time features)

---

## 🌐 Backend API

Backend base URL: ( Contact Me )

---

## 🔐 Authentication Flow

1. User logs in
2. Backend returns:
   - access token (short-lived)
   - refresh token (long-lived)
3. Tokens stored in cookies
4. If access token expires:
   - frontend calls `/auth/refresh`
   - gets new token automatically
   - retries request

---

## 🍪 Cookie Storage

- `access_token`
- `refresh_token`

All API calls use:

```ts id="credentials"
credentials: "include";
```
