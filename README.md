# 🧠 Quizzy Frontend

Quizzy is a modern quiz platform frontend built with **Next.js**, **TypeScript**, and **Redux Toolkit Query**.  
It connects to a Spring Boot backend to handle authentication, quizzes, and user progress.

---

## 🚀 Tech Stack

- Next.js (App Router)
- TypeScript
- Redux Toolkit Query (RTK Query)
- Tailwind CSS
- React Hook Form + Zod
- Framer Motion
- Sonner (Toast notifications)

---

## 🌐 Backend Connection

This frontend connects to a Spring Boot API: ...

---

## 🔐 Authentication System

Quizzy uses **JWT authentication with refresh token support**.

### Flow:

1. User logs in
2. Backend returns:
   - access token (short-lived)
   - refresh token (long-lived)
3. Tokens are stored in cookies
4. When access token expires:
   - RTK Query automatically calls `/auth/refresh`
   - New access token is issued
   - Original request is retried

---

## 🍪 Cookie Strategy

Stored cookies:

- `access_token`
- `refresh_token`

> API calls use `credentials: "include"` to send cookies automatically

---

## ⚙️ API Setup (RTK Query)

Base API configuration:

```ts id="rtk-base"
baseQuery: fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
});
```
