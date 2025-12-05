# KonnectHere - Project Structure

## File Tree

```
konnecthere/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   # NextAuth handler
│   │   │   └── signup/          # User registration
│   │   ├── applications/
│   │   │   ├── route.ts         # Create application
│   │   │   └── my/              # Get user's applications
│   │   ├── companies/
│   │   │   └── route.ts         # Company CRUD
│   │   ├── jobs/
│   │   │   ├── route.ts         # List/create jobs
│   │   │   ├── [slug]/          # Get job by slug
│   │   │   └── my/              # Get employer's jobs
│   │   ├── resumes/
│   │   │   └── route.ts         # Resume CRUD
│   │   └── resume/
│   │       └── upload-url/      # S3 presigned URL
│   ├── auth/                    # Authentication pages
│   │   ├── signin/              # Sign in page
│   │   └── signup/              # Sign up page
│   ├── candidate/               # Candidate pages
│   │   └── dashboard/           # Candidate dashboard
│   ├── employer/                # Employer pages
│   │   ├── companies/
│   │   │   └── new/             # Create company
│   │   ├── jobs/
│   │   │   └── new/             # Post new job
│   │   ├── dashboard/           # Employer dashboard
│   │   └── onboarding/          # Employer onboarding
│   ├── jobs/                    # Public job pages
│   │   ├── page.tsx             # Job listing
│   │   └── [slug]/
│   │       ├── page.tsx         # Job detail
│   │       └── apply/           # Apply to job
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── providers.tsx            # Session provider
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── Navbar.tsx               # Navigation bar
│   └── Footer.tsx               # Footer component
├── lib/                         # Utilities & configs
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client singleton
│   ├── s3.ts                    # AWS S3 utilities
│   └── utils.ts                 # Helper functions
├── prisma/
│   └── schema.prisma            # Database schema
├── docs/
│   └── SEARCH.md                # Search & indexing architecture
├── types/
│   └── next-auth.d.ts          # NextAuth type definitions
├── .github/
│   └── workflows/
│       └── ci.yml               # CI/CD pipeline
├── .dockerignore
├── .gitignore
├── Dockerfile                   # Docker configuration
├── next.config.ts              # Next.js configuration
├── package.json
├── tsconfig.json
├── README.md                    # Project documentation
├── MILESTONES.md                # 4-week milestone plan
├── services/                   # Auxiliary services (e.g. resume parser)
│   └── resume-parser/           # FastAPI-based resume parser
└── PROJECT_STRUCTURE.md         # This file
```

## Key Files Explained

### Database Schema (`prisma/schema.prisma`)
- **User**: Authentication and user profiles
- **Company**: Employer company profiles
- **Job**: Job postings with full-text search support
- **Application**: Job applications
- **Resume**: Uploaded resumes with parsed data
- **SearchIndex**: Algolia sync metadata
- **SavedSearch**: User saved searches
- **JobAlert**: Email alerts for job matches

### Authentication (`lib/auth.ts`)
- Email/password authentication
- LinkedIn OAuth
- Google OAuth
- JWT session strategy
- Role-based access control

### S3 Upload (`lib/s3.ts`)
- Presigned URL generation for uploads
- Secure file storage
- CDN integration support

### Resume Parser Service (`services/resume-parser/`)
- FastAPI microservice that accepts resume URLs and returns parsed PII/skills.
- Run via `uvicorn main:app --host 0.0.0.0 --port 8001`.
- Called from the Next.js `/api/resumes` endpoint when `RESUME_PARSER_URL` is configured.

### API Routes
All API routes follow RESTful conventions:
- `GET /api/jobs` / `POST /api/jobs` - Browse & create jobs
- `GET /api/jobs/by-slug/[slug]` - Public job detail
- `GET|PATCH|DELETE /api/jobs/[id]` - Employer job management
- `POST /api/jobs/[id]/share/linkedin` - LinkedIn share automation + fallback
- `POST /api/applications` - Submit application
- `PATCH /api/applications/[id]` - Update application status
- `POST /api/applications/[id]/message` - Email the candidate
- `POST /api/resume/upload-url` - Get S3 upload URL
- `GET /api/resumes/[id]/download` - Secure download
- `GET /api/search` - Instant search with facets
- `POST /api/search/reindex` - Admin-only reindex hook

### Pages
- **Public**: Home, job listing, job detail
- **Auth**: Sign in, sign up
- **Candidate**: Dashboard, applications
- **Employer**: Dashboard, post jobs, manage applications

## Environment Variables

See `.env.example` for all required variables:
- Database connection
- NextAuth configuration
- AWS S3 credentials
- OAuth provider credentials
- Algolia (Week 2)
- Email/SMTP settings

## Database Models

### User
- Supports multiple roles (CANDIDATE, EMPLOYER, ADMIN)
- Email/password or OAuth
- Linked to companies, applications, resumes

### Company
- Owned by employer users
- Has many jobs
- Company profile information

### Job
- Full-text search enabled
- Status workflow (DRAFT → PUBLISHED → CLOSED)
- Application tracking
- Social sharing metadata

### Application
- One per user per job
- Status tracking
- Linked resume
- Cover letter support

### Resume
- S3 file storage
- Parsed fields (for Week 4)
- Linked to applications

## Security Features

- Password hashing (bcrypt)
- JWT sessions
- Role-based access control
- S3 presigned URLs (no direct access)
- API route protection
- CSRF protection (Next.js built-in)

## Deployment

### Vercel (Recommended)
- Automatic deployments from GitHub
- Environment variables in dashboard
- Prisma migrations on deploy

### Docker
- Multi-stage build
- Optimized for production
- Non-root user
- Standalone Next.js output

### CI/CD
- GitHub Actions workflow
- Lint and test on PR
- Build verification
- Deploy to Vercel preview/production

## Next Steps (Week 2+)

1. **Search Implementation**
   - Postgres full-text search
   - Algolia integration
   - Search UI components

2. **Integrations**
   - LinkedIn API
   - Social sharing
   - Email notifications

3. **Resume Parsing**
   - Python microservice
   - Profile auto-fill
   - Recommendations


