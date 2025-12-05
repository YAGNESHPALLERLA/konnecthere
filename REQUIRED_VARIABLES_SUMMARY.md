# Required Environment Variables - Quick Summary

## 🔴 MUST HAVE (App won't start without these)

```bash
# 1. Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# 2. NextAuth (Generate secret: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
```

## 🟡 IMPORTANT (For resume uploads to work)

```bash
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_S3_BUCKET_NAME="konnecthere-resumes"
```

## 🟢 OPTIONAL (Can add later)

### OAuth Login
```bash
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### Email Authentication
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD=""
SMTP_FROM="noreply@konnecthere.com"
```

### Search
```bash
ALGOLIA_APP_ID=""
ALGOLIA_API_KEY=""
ALGOLIA_INDEX_NAME="jobs"
```

### Resume Parser
```bash
RESUME_PARSER_URL="http://localhost:8001"
```

---

## Quick Setup Commands

```bash
# 1. Create .env file
cp .env.example .env

# 2. Generate NextAuth secret
openssl rand -base64 32

# 3. Edit .env and add minimum required variables above

# 4. Generate Prisma client
npm run db:generate

# 5. Run migrations
npm run db:migrate

# 6. Start server
npm run dev
```

See `ENVIRONMENT_VARIABLES_COMPLETE.md` for detailed instructions.







