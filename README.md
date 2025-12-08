# KonnectHere - Job Portal Platform

A production-ready job portal built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Tech Stack

- **Frontend & SSR**: Next.js 16 (TypeScript) + Tailwind CSS
- **Database & ORM**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js (Email + LinkedIn/Google OAuth)
- **File Storage**: AWS S3 (signed uploads)
- **Search**: Algolia (Week 2) + Postgres full-text (MVP)
- **Hosting**: Vercel (Next.js) + Managed Postgres (Supabase/RDS)

## 📋 Prerequisites

- Node.js 20.9.0 or higher (required for Next.js 16 and Prisma 7)
- PostgreSQL database
- AWS account with S3 bucket configured
- (Optional) LinkedIn/Google OAuth credentials
- (Optional) Algolia account (for Week 2)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd konnecthere
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

**Required:**
- `DATABASE_URL`: PostgreSQL connection string
  - Local: `postgresql://user:password@localhost:5432/konnecthere?schema=public`
  - Production: Your production database connection string (e.g., Supabase, Railway)
- `AUTH_SECRET`: Generate with `openssl rand -base64 32` (preferred for Auth.js v5)
- `NEXTAUTH_SECRET`: Same as AUTH_SECRET (for backward compatibility)
- `AUTH_URL`: Your app URL
  - Local: `http://localhost:3000`
  - Production: `https://konnecthere.com` (or your custom domain)
- `NEXTAUTH_URL`: Same as AUTH_URL (for backward compatibility)

**Optional:**
- `AWS_*`: S3 credentials and bucket name (for resume uploads)
- `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`: LinkedIn OAuth
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth
- `ALGOLIA_*`: App ID, API key, index (for search)
- `ALLOW_DEBUG`: Set to `"true"` to enable debug endpoints (development only)

### 3. Database Setup

**For Local Development:**

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (creates tables)
npx prisma migrate dev

# Seed the database with test users
npm run db:seed
# OR
npx prisma db seed
```

**For Production (Vercel/Deployment):**

```bash
# Run migrations against production database
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Seed production database with test users
DATABASE_URL="your-production-db-url" npm run db:seed
# OR
DATABASE_URL="your-production-db-url" npx prisma db seed
```

**Test Users Created by Seed:**
- Admin: `admin@konnecthere.com` / `admin123`
- HR: `hr@konnecthere.com` / `hr123`
- User: `user@konnecthere.com` / `user123`

⚠️ **Important**: Change these passwords in production!

**Optional: Open Prisma Studio**
```bash
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
konnecthere/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── jobs/              # Job listing and detail pages
│   ├── dashboard/         # Role-based dashboards
│   ├── hr/                # HR-specific routes
│   ├── employer/          # Employer dashboard
│   ├── candidate/         # Candidate dashboard
│   └── messages/          # Messaging system
├── components/            # React components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── auth/             # Auth utilities (roles, etc.)
│   ├── prisma.ts         # Prisma client
│   ├── s3.ts             # S3 upload utilities
│   └── utils.ts          # Helper functions
├── docs/                  # Documentation
│   └── ROUTING.md        # Routing & navigation guide
├── prisma/
│   └── schema.prisma     # Database schema
├── .github/
│   └── workflows/        # CI/CD pipelines
└── Dockerfile            # Docker configuration
```

## 🗺️ Routing & Navigation

For detailed information about routes, navigation, and role-based access control, see [docs/ROUTING.md](docs/ROUTING.md).

Key points:
- All routes are defined in the `app/` directory
- Role-based dashboards: `/dashboard` redirects to role-specific dashboards
- Protected routes use `requireRole()` from `@/lib/auth/roles`
- Messaging system supports conversations via `/messages` with query params

## 🎯 Week 1 Deliverables (Current)

✅ **Completed:**
- Next.js app with TypeScript + Tailwind CSS
- NextAuth configuration (Email + LinkedIn/Google OAuth)
- Prisma schema with all required models
- Basic UI pages:
  - Home page
  - Job listing page
  - Job detail page
  - Job post form (employer)
  - Apply flow with resume upload
- S3 signed upload for resumes
- API routes for jobs, applications, resumes, companies
- Docker configuration
- GitHub Actions CI/CD pipeline

## 🔐 Authentication

The app supports multiple authentication methods:

1. **Email/Password**: Traditional signup with hashed passwords
2. **LinkedIn OAuth**: Sign in with LinkedIn
3. **Google OAuth**: Sign in with Google

User roles:
- `USER`: Job seekers (formerly `CANDIDATE`)
- `HR`: Companies posting jobs (formerly `EMPLOYER`)
- `ADMIN`: Platform administrators

**Note**: Legacy roles (`CANDIDATE`, `EMPLOYER`) are automatically mapped to new roles for backward compatibility.

## 📝 API Routes

### Jobs
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/by-slug/[slug]` - Get job details
- `POST /api/jobs` - Create job (employer only)
- `GET /api/jobs/[id]` - Employer view (includes applicants, protected)
- `PATCH /api/jobs/[id]` - Update job metadata/status
- `DELETE /api/jobs/[id]` - Delete job
- `POST /api/jobs/[id]/share/linkedin` - Share job to LinkedIn or generate manual payload

### Applications
- `POST /api/applications` - Submit application
- `PATCH /api/applications/[id]` - Update application status/notes
- `POST /api/applications/[id]/message` - Email the candidate

### Resumes
- `GET /api/resumes` - List user's resumes
- `POST /api/resumes` - Create resume record
- `POST /api/resume/upload-url` - Get S3 presigned URL
- `GET /api/resumes/[id]/download` - Secure download for owners/employers

### Companies
- `GET /api/companies` - List user's companies
- `POST /api/companies` - Create company (employer only)

### Search
- `GET /api/search` - Instant search with facets (Algolia + Postgres fallback)
- `POST /api/search/reindex` - Admin-only bulk reindex

## 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t konnecthere .

# Run container
docker run -p 3000:3000 --env-file .env konnecthere
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run type-check

# Lint
npm run lint
```

## 🚢 Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deployments are automatic via GitHub Actions

### Manual Deployment

```bash
npm run build
npm start
```

## 📅 Roadmap

### Week 2 - Search & Indexing
- [ ] Postgres full-text search implementation
- [ ] Algolia integration and indexing hooks
- [ ] Instant search UI with facets

### Week 3 - Integrations & Employer Features
- [ ] LinkedIn Jobs/Share API integration
- [ ] Employer dashboard enhancements
- [ ] Application management

### Week 4 - Resume Parsing & Recommendations
- [ ] Resume parser microservice
- [ ] Recommendation engine
- [ ] Candidate dashboard improvements

#### Resume Parser Microservice (MVP)
- Service source: `services/resume-parser` (FastAPI + pdfplumber).
- Run locally: `cd services/resume-parser && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8001`.
- Set `RESUME_PARSER_URL` (e.g. `http://localhost:8001`) so the Next.js API can call the service after each resume upload.
- The parser accepts `{ "file_url": "https://..." }` and returns structured fields (name, email, phone, skills, etc.).

## 🔍 Week 2 – Search & Indexing (In Progress)

- Unified `/api/search` endpoint automatically switches between Algolia and Postgres full-text search
- Instant search UI with debounce, predictive suggestions, and clickable facets (location, experience, work setup, salary)
- Job CRUD hooks keep Algolia and the `SearchIndex` table consistent
- Admin-only reindex endpoint (`POST /api/search/reindex`) for full backfills
- Detailed architecture & setup guide in `docs/SEARCH.md`

## 💼 Week 3 – Employer Tools (In Progress)

- Employer dashboard links to per-job applicant management experiences
- `GET /api/jobs/[id]` returns job metadata + applicants for owners/admins
- Status + notes updates via `PATCH /api/applications/[id]`
- Candidate messaging with email delivery (`POST /api/applications/[id]/message`)
- Secure resume downloads for owners/employers (`GET /api/resumes/[id]/download`)
- LinkedIn share automation with safe manual fallback (`POST /api/jobs/[id]/share/linkedin`)

### LinkedIn OAuth Setup
1. Set `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` in `.env` (LinkedIn developer app).
2. From the employer dashboard, click the LinkedIn share button; if you're not connected, you'll be redirected to LinkedIn OAuth.
3. Once connected, shares use your LinkedIn identity by default. Set `LINKEDIN_ORGANIZATION_ID` to post as a company page instead.


## 🔒 Security Notes

- All passwords are hashed with bcrypt
- S3 uploads use presigned URLs (no direct client access)
- API routes are protected with NextAuth middleware
- Role-based access control (RBAC) implemented
- Rate limiting recommended for production

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## ⚠️ Important Notes

1. **Node.js Version**: This project requires Node.js 20.9.0+. Upgrade if needed:
   ```bash
   nvm install 20
   nvm use 20
   ```

2. **LinkedIn API**: The LinkedIn Jobs API requires a partnership. A fallback manual sharing flow is provided.

3. **Database Migrations**: Always run migrations in production:
   ```bash
   npx prisma migrate deploy
   ```

4. **Environment Variables**: Never commit `.env` files. Use Vercel environment variables or a secrets manager.

## 🆘 Troubleshooting

### Prisma Client not found
```bash
npm run db:generate
```

### Database connection errors
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check network/firewall settings

### S3 upload failures
- Verify AWS credentials
- Check bucket permissions
- Ensure CORS is configured on S3 bucket

### NextAuth errors
- Generate a secure `NEXTAUTH_SECRET`
- Verify OAuth provider credentials
- Check callback URLs match `NEXTAUTH_URL`
