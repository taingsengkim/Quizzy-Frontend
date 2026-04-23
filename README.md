# 🧠 Quizzy for Devs — Frontend

A modern, full-featured **programming quiz platform** built with Next.js 16, TypeScript, and Redux Toolkit. Supports single-player quizzes, real-time multiplayer battles, and a full admin dashboard — live at [quizzy-it.vercel.app](https://quizzy-it.vercel.app).

---

## ✨ Features

### 👤 Authentication

- Register / Login with email & password
- OAuth social login via **GitHub**, **Google**, and **Facebook** (powered by [better-auth](https://better-auth.com))
- JWT-based session with **auto token refresh** on 401 responses
- Tokens stored securely in cookies (`access_token`, `refresh_token`)

### 🧠 Single-Player Quizzes

- Browse quizzes by **category**
- Multiple choice, true/false, and coding questions
- Submit answers and view your **score & results**
- Track performance history on your profile

### ⚔️ Multiplayer Mode

- Real-time quiz battles via **WebSocket (STOMP / SockJS)**
- Create or join a match room
- Live score updates during gameplay
- Winner detection at the end of each match

### 📚 Browse & Discovery

- Browse and filter quizzes by category
- Search quizzes by keyword
- Paginated data loading

### 🛠️ Admin Dashboard

- Manage quiz **categories** (create, edit, delete, view)
- Create and edit **quizzes** with drag-and-drop question ordering
- Separate admin login flow

---

## 🗂️ Project Structure

```
Quizzy-Frontend/
├── app/
│   ├── (user)/                    # User-facing pages
│   │   ├── page.tsx               # Home page
│   │   ├── about/                 # About page
│   │   ├── login/ & register/     # Auth pages
│   │   ├── profile/               # User profile
│   │   └── quizzes/
│   │       ├── page.tsx           # Browse all quizzes
│   │       ├── [categoryId]/      # Quizzes by category
│   │       ├── play/[quizId]/     # Single-player quiz
│   │       ├── instant/           # Instant play mode
│   │       └── multiplayer/       # Real-time multiplayer
│   │           ├── join/          # Join a room
│   │           └── [quizId]/      # Multiplayer game
│   ├── (admin)/                   # Admin-only pages
│   │   ├── login-admin/           # Admin login
│   │   └── dashboard/
│   │       ├── page.tsx           # Dashboard overview
│   │       ├── categories/        # Category management
│   │       └── create-quiz/       # Quiz creation & editing
│   ├── api/                       # Next.js API route handlers
│   ├── auth/callback/             # OAuth callback handler
│   └── layout.tsx                 # Root layout (fonts, metadata, Redux)
├── components/
│   ├── dashboard/                 # Admin dashboard components
│   ├── quiz/                      # Quiz UI components
│   ├── user-page/                 # User-facing UI components
│   ├── share-component/           # Shared (Navbar, etc.)
│   └── ui/                        # shadcn/ui primitives
├── lib/
│   ├── features/
│   │   ├── api/                   # RTK Query base API setup
│   │   ├── categories/            # Category endpoints
│   │   └── quizzes/               # Quiz endpoints
│   ├── auth/                      # better-auth config & actions
│   ├── store.ts                   # Redux store configuration
│   ├── hooks.ts                   # Typed Redux hooks
│   └── types/                     # Shared TypeScript types
├── hooks/
│   └── use-mobile.ts              # Responsive hook
├── public/                        # Static assets & images
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## ⚙️ Tech Stack

| Category         | Technology                    |
| ---------------- | ----------------------------- |
| Framework        | Next.js 16.2 (App Router)     |
| Language         | TypeScript 5                  |
| State Management | Redux Toolkit + RTK Query     |
| Auth             | better-auth (JWT + OAuth)     |
| Styling          | Tailwind CSS v4               |
| UI Components    | shadcn/ui + Radix UI          |
| Forms            | React Hook Form + Zod         |
| Animations       | Framer Motion                 |
| Tables           | TanStack React Table          |
| Drag & Drop      | dnd-kit                       |
| Real-time        | STOMP.js + SockJS (WebSocket) |
| Charts           | Recharts                      |
| Notifications    | Sonner                        |
| Deployment       | Vercel                        |

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- npm or yarn
- A running [Quizzy Spring Boot backend](https://github.com/taingsengkim)

### 2. Clone the Repository

```bash
git clone https://github.com/taingsengkim/Quizzy-Frontend.git
cd Quizzy-Frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# OAuth Social Providers (via better-auth)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# better-auth
BETTER_AUTH_SECRET=your_random_secret
BETTER_AUTH_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔐 Authentication Flow

```
User logs in
    ↓
Backend returns access_token + refresh_token
    ↓
Tokens stored in HTTP cookies
    ↓
RTK Query sends requests with credentials: "include"
    ↓
On 401 → auto call /auth/refresh → retry original request
    ↓
On refresh failure → logout user
```

Social login (GitHub / Google / Facebook) flows through Next.js API routes and the `better-auth` library, with the callback handled at `/auth/callback`.

---

## 🌐 App Routes

### User Routes

| Route                           | Description             |
| ------------------------------- | ----------------------- |
| `/`                             | Home page               |
| `/login`                        | Login page              |
| `/register`                     | Registration page       |
| `/profile`                      | User profile & history  |
| `/quizzes`                      | Browse all quizzes      |
| `/quizzes/[categoryId]`         | Quizzes by category     |
| `/quizzes/play/[quizId]`        | Single-player quiz      |
| `/quizzes/instant`              | Instant quiz mode       |
| `/quizzes/multiplayer/join`     | Join a multiplayer room |
| `/quizzes/multiplayer/[quizId]` | Live multiplayer battle |
| `/about`                        | About page              |

### Admin Routes

| Route                             | Description       |
| --------------------------------- | ----------------- |
| `/login-admin`                    | Admin login       |
| `/dashboard`                      | Admin overview    |
| `/dashboard/categories`           | Manage categories |
| `/dashboard/categories/create`    | Create category   |
| `/dashboard/categories/edit/[id]` | Edit category     |
| `/dashboard/create-quiz`          | Create a quiz     |
| `/dashboard/edit-quiz/[id]`       | Edit a quiz       |

---

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🚢 Deployment

The app is deployed on **Vercel** at [https://quizzy-it.vercel.app](https://quizzy-it.vercel.app).

To deploy your own instance:

1. Push the repository to GitHub
2. Import the project into [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy

The `next.config.ts` includes a permanent 301 redirect from `quizzy.it.com` → `quizzy-it.vercel.app`.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open source and available for educational use.
