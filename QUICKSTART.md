# Quick Start Guide

## Prerequisites Check

```bash
# Check Node.js version (requires 20.9.0+)
node --version

# If not 20+, install nvm and upgrade:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Database

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (if not installed)
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# macOS:
brew install postgresql

# Create database
createdb konnecthere

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/konnecthere?schema=public"
```

### Option B: Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string to `.env`

## 3. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Generate NextAuth secret
openssl rand -base64 32

# Edit .env and fill in:
# - DATABASE_URL
# - NEXTAUTH_SECRET (use generated value)
# - NEXTAUTH_URL (http://localhost:3000 for dev)
# - AWS credentials (for resume uploads)
```

## 4. Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

## 5. Set Up AWS S3 (for Resume Uploads)

1. Create S3 bucket in AWS Console
2. Configure CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```
3. Create IAM user with S3 permissions
4. Add credentials to `.env`

## 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 7. Create Test Accounts

### Option A: Via UI
1. Go to `/auth/signup`
2. Create candidate account
3. Create employer account (separate email)

### Option B: Via Prisma Studio
```bash
npm run db:studio
# Manually create users in the User table
```

## 8. Test Core Flows

### As Employer:
1. Sign up as employer
2. Create company (`/employer/companies/new`)
3. Post a job (`/employer/jobs/new`)
4. View dashboard (`/employer/dashboard`)

### As Candidate:
1. Sign up as candidate
2. Browse jobs (`/jobs`)
3. Upload resume (when applying)
4. Apply to job
5. View applications (`/candidate/dashboard`)

## Common Issues

### "Prisma Client not found"
```bash
npm run db:generate
```

### "Database connection error"
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

### "S3 upload fails"
- Verify AWS credentials
- Check bucket permissions
- Ensure CORS is configured

### "NextAuth error"
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- For OAuth: verify provider credentials

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t konnecthere .

# Run container
docker run -p 3000:3000 --env-file .env konnecthere
```

## Next Steps

- See `MILESTONES.md` for Week 2-4 tasks
- Review `README.md` for detailed documentation
- Check `PROJECT_STRUCTURE.md` for code organization


