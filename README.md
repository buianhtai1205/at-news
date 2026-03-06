<div align="center">

# 📰 AT-News

**A bilingual news platform for learning English naturally**

Built with Next.js 15 · Supabase · Google Gemini AI · Tailwind CSS

</div>

---

## Overview

AT-News is a bilingual (English–Vietnamese) news platform designed for Vietnamese learners of English. Users read real-world news articles with side-by-side translations, improving vocabulary and comprehension naturally. It also serves as a creator marketplace where writers publish bilingual content and earn money from subscriber views.

## Features

### 📖 Bilingual Reader
- Configurable **side-by-side** or **stacked** English/Vietnamese view
- Controls for font size, font family (sans / serif / mono), text alignment, and line spacing

### 🤖 AI-Powered Bilingual Generation
- Uses **Google Gemini 2.5 Flash** to split English text into sentences and generate Vietnamese translations
- Supports input via **pasted text**, **URL scraping**, or **file upload** (PDF, DOCX, TXT)

### ✍️ Article Management
- Full CRUD with editorial statuses: `DRAFT → APPLIED → APPROVED / REJECTED`
- Authors can create, edit (if not yet published), and resubmit articles
- Only approved articles appear publicly

### 🛡️ Admin Moderation
- Admin panel with tabs for Pending / Approved / Rejected / Draft articles
- Admins can approve, reject (with reason), or delete any article

### 💎 Premium Content & Paywall
- Articles can be marked **Premium** with a configurable `premiumStartIndex`
- Free users see only the first N sentences; the rest is locked behind a gradient paywall overlay

### 💰 Creator Earnings
- When a Pro subscriber reads a premium article, the creator earns **$0.05 per unique view**
- Real-time earnings tracking on the creator dashboard

### 🏷️ Categories
- Articles are organized into categories with slug-based filtering

### 🌙 Dark Mode
- Full dark / light theme support

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4, Lucide React icons, Motion |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Custom JWT (jose) + bcryptjs, HTTP-only cookies |
| **AI** | Google Gemini 2.5 Flash (`@google/genai`) |
| **File Processing** | pdf-parse, mammoth (DOCX), Mozilla Readability + jsdom |
| **Validation** | Zod |
| **Forms** | react-hook-form + @hookform/resolvers |
| **File Upload** | react-dropzone |

---

## Architecture

The project follows **Clean Architecture** with clear separation of concerns:

```
src/core/            ← Domain layer (entities, interfaces, services, DTOs, errors)
src/infrastructure/  ← Infrastructure layer (Supabase repos, JWT, DI container)
app/                 ← Presentation layer (Next.js pages + API routes)
```

- **Dependency Injection** — A singleton container wires Supabase repository implementations to service-layer interfaces
- **Repository Pattern** — Each entity has an interface and a Supabase implementation
- **DTO Pattern** — Input/output shapes defined in `src/core/dtos/`
- **Custom Error Handling** — `AppError` class with structured error codes and centralized API error handling

---

## Database Schema

| Table | Description |
|---|---|
| **users** | User accounts with email, password hash, and role (ADMIN / USER) |
| **profiles** | Subscription status, creator balance — auto-created via trigger on user insert |
| **categories** | Article categories with name, slug, and description |
| **articles** | Core content table with `content` stored as JSONB arrays of `{en, vi}` sentence pairs |
| **article_views** | Tracks unique premium article views per user for creator earnings |

Row Level Security (RLS) is enabled on all tables. An `update_updated_at()` trigger auto-stamps modifications. A `record_premium_view()` RPC handles atomic view-insert + balance-credit.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Sign in and receive JWT |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current user from token |

### Articles
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/articles` | List articles (filterable by `?status=`) |
| POST | `/api/articles` | Create article (auth required) |
| GET | `/api/articles/mine` | List current user's articles |
| GET | `/api/articles/[id]` | Get single article |
| PUT | `/api/articles/[id]` | Update article (author or admin) |
| DELETE | `/api/articles/[id]` | Delete article |
| POST | `/api/articles/[id]/approve` | Admin: approve article |
| POST | `/api/articles/[id]/reject` | Admin: reject with reason |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/[id]` | Get single category |

### Profile & Subscription
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile` | Get current user's profile |
| POST | `/api/profile/subscribe` | Toggle Pro subscription |

### AI & File Processing
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate-bilingual` | Generate EN/VI sentence pairs from URL or text |
| POST | `/api/extract-file` | Extract text from PDF / DOCX / TXT |

---

## User Roles

| Role | Permissions |
|---|---|
| **Anonymous** | Browse published articles, view categories, preview premium content |
| **User** | Create / edit / delete own articles, submit for review, subscribe to Pro, view creator dashboard |
| **Admin** | Approve / reject / delete any article, view all articles by status |

---

## Subscription Tiers

| Tier | Price | Access |
|---|---|---|
| **Free** | $0 | Read free articles, bilingual reader, create & submit articles, preview premium snippets |
| **Pro** | $9.99/month | Unlimited premium articles, ad-free experience, support creators ($0.05/view) |

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Supabase** project (or local Supabase instance)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/at-news.git
   cd at-news
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Set up the database**

   Run the SQL setup script against your Supabase project:
   ```bash
   # Via Supabase SQL Editor or CLI
   psql -f scripts/setup-supabase.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run clean` | Clean Next.js build cache |

---

## Project Structure

```
app/                    # Next.js App Router pages & API routes
├── admin/              # Admin moderation panel
├── articles/           # Article listing, detail, and creation pages
├── categories/         # Category browsing
├── dashboard/          # Creator dashboard
├── pricing/            # Subscription pricing page
├── login/              # Login page
├── register/           # Registration page
└── api/                # REST API routes
src/
├── components/         # React components (articles, auth, layout, ui)
├── core/               # Domain layer (entities, services, DTOs, errors, repos)
└── infrastructure/     # Supabase repos, JWT, DI container
lib/                    # Shared utilities (Supabase client, helpers)
scripts/                # Database migration & setup scripts
hooks/                  # Custom React hooks
```

---

## License

This project is private and not licensed for public distribution.
