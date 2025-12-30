# 💀 INTERN_HUNTER - Developer Guide

Welcome to the **INTERN_HUNTER** codebase. This document is a comprehensive guide for developers to understand, setup, and contribute to the project.

## 1. Project Overview

**INTERN_HUNTER** (a.k.a INTERN_OS) is a Brutalist-style internship application portal. It simplifies the application process with a "no-nonsense" aesthetic and workflow.

### Key Features:
- **Brutalist UI**: High contrast, bold borders, raw aesthetic using Tailwind CSS.
- **Application Portal**: Multi-step form for students to apply with Resume upload.
- **Admin Dashboard**: For reviewing applications and managing content.
- **Job Board**: Listing and details of available internships.
- **Blog System**: An internal log/blog for updates.
- **SSR/Meta Injection**: Custom backend handling for social media previews (OG tags) for Jobs and Blogs.

---

## 2. Tech Stack

| Domain | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | **React 19** | Latest React features. |
| **Build Tool** | **Vite** | Fast development server and bundler. |
| **Language** | **TypeScript** | For type safety implementation. |
| **Styling** | **Tailwind CSS** | Configured via CDN in `index.html` + custom config. |
| **Backend** | **Express.js** | Serves API and handles SSR meta-tag injection. |
| **Runtime** | **Node.js** | Server-side runtime. |
| **Database** | **Supabase** | Postgres database & Storage buckets. |
| **Deployment** | **Vercel** | Configured via `vercel.json` for serverless API + static frontend. |

---

## 3. Project Structure

The project has a relatively flat structure typical of Vite + simple backend setups.

```
/
├── api/                   # Backend Express Application
│   └── index.js           # Main server file (API endpoints & Meta injection)
├── components/            # Reusable React Components (Buttons, Inputs, etc.)
│   └── BrutalComponents.tsx
├── contexts/              # React Contexts (e.g., AuthContext)
├── lib/                   # Utilities & Clients
│   └── supabase.ts        # Supabase client configuration
├── assets/                # Static assets (images, fonts)
├── App.tsx                # Main React Router & Application Logic
├── types.ts               # Shared TypeScript Interfaces (CandidateProfile, etc.)
├── index.html             # Entry HTML (Tailwind Config is here!)
├── package.json           # Dependencies & Scripts
├── vercel.json            # Vercel Deployment Configuration
└── vite.config.ts         # Vite Configuration
```

---

## 4. Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- `npm` or `yarn`

### Step 1: Clone & Install
```bash
git clone <repo-url>
cd intern_hunter
npm install
```

### Step 2: Environment Variables
Create a `.env.local` file in the root directory. You will need credentials from your Supabase project.

```env
# Supabase Configuration (Required for Frontend & Backend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend Admin Keys (Required for Admin actions like creating blogs)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
PORT=3000
```

> **Note**: `VITE_` prefix is required for variables exposed to the Vite frontend.

### Step 3: Run Locally

To fully run the app, you need two terminal processes:

**Terminal 1: Frontend (Vite)**
```bash
npm run dev
```
Runs at `http://localhost:5173`

**Terminal 2: Backend (Express)**
```bash
npm start
```
Runs at `http://localhost:3000`

> **Dev Note**: `App.tsx` has logic to point requests to `http://localhost:3000` when running in development mode (`import.meta.env.DEV`).

---

## 5. Database Schema (Supabase)

The application relies on the following tables and storage buckets in Supabase.

### Tables

1.  **`applications`**
    *   `id`: UUID
    *   `full_name`: Text
    *   `email`: Text
    *   `phone`: Text
    *   `department`: Text
    *   `experience_level`: Text
    *   `skills`: JSON/Array
    *   `bio`: Text
    *   `portfolio_url`: Text
    *   `cv_url`: Text (URL to Storage)
    *   `created_at`: Timestamp

2.  **`jobs`**
    *   `id`: UUID
    *   `title`: Text
    *   `company`: Text
    *   `location`: Text
    *   `salary_min`: Number
    *   `salary_max`: Number
    *   `internship_type`: Text
    *   `status`: Text ('active', etc.)

3.  **`blog_posts`**
    *   `id`: UUID
    *   `title`: Text
    *   `excerpt`: Text
    *   `content`: Text
    *   `author`: Text
    *   `image_url`: Text

### Storage Buckets
*   `resumes`: For storing applicant CVs (PDF/Doc).
*   `blog-images`: For storing blog cover images.

---

## 6. Backend API Reference

The backend (`api/index.js`) serves two purposes: JSON API and Social Media Meta Injection.

### JSON API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/apply` | Submit a new application form + CV upload. |
| `GET` | `/api/applications` | (Admin) Get all submitted applications. |
| `GET` | `/api/jobs` | Get all active job listings. |
| `GET` | `/api/jobs/:id` | Get details for a specific job. |
| `GET` | `/api/blogs` | Get all blog posts. |
| `POST` | `/api/blogs` | (Admin) Create a new blog post. |

### Social Media Injection (SSR)
These endpoints intercept standard page requests to inject `<meta>` tags for Twitter/OpenGraph cards before serving the React app.

*   `GET /blogs/:id` -> Injects Blog Title & Image.
*   `GET /jobs/:id` -> Injects Job Title & dynamically generated Brutalist Image.

---

## 7. Deployment (Vercel)

The project is configured for Vercel using `vercel.json`.

*   **Rewrites**:
    *   `/api/*` requests are routed to `api/index.js`.
    *   Specific routes like `/blogs/:id` and `/jobs/:id` are also forced to the backend to handle the meta-tag injection.
    *   All other routes fall back to `index.html` (Client-Side Routing).

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/blogs/:id", "destination": "/api/index.js" },
    { "source": "/jobs/:id", "destination": "/api/index.js" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

## 8. Development Tips

*   **Styling**: The tailwind config is actually injected inside `index.html` within a `<script>` tag. If you need to change colors or fonts, look there.
*   **Icons**: We use `lucide-react`.
*   **Brutal Components**: Use the pre-built `BrutalBox`, `BrutalButton`, `BrutalInput` in `components/BrutalComponents.tsx` to maintain the design language.
