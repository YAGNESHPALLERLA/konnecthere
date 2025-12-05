# 🚀 Deployment Checklist - KonnectHere.com

Follow these steps in order to deploy your website to production.

## ✅ Step 1: Push to GitHub

- [ ] Generate GitHub Personal Access Token (or set up SSH)
- [ ] Run: `git push -u origin main`
- [ ] Verify code is on GitHub: https://github.com/YAGNESHPALLERLA/konnecthere

**Help:** See `PUSH_TO_GITHUB.md` for detailed instructions

---

## ✅ Step 2: Set Up Production Database

Choose one:

- [ ] **Supabase** (Recommended - Free tier)
  - Create account at https://supabase.com
  - Create new project
  - Copy connection string from Settings → Database
  - Save for Step 3

- [ ] **Railway** (Alternative)
  - Create account at https://railway.app
  - Create PostgreSQL database
  - Copy connection string
  - Save for Step 3

- [ ] **Neon** (Alternative)
  - Create account at https://neon.tech
  - Create PostgreSQL database
  - Copy connection string
  - Save for Step 3

---

## ✅ Step 3: Deploy to Vercel

### 3.1 Import Project
- [ ] Go to https://vercel.com and sign in
- [ ] Click "Add New..." → "Project"
- [ ] Import repository: `YAGNESHPALLERLA/konnecthere`
- [ ] Click "Import"

### 3.2 Add Environment Variables

Add these in Vercel → Settings → Environment Variables:

**Required:**
- [ ] `DATABASE_URL` = (your production database URL from Step 2)
- [ ] `NEXTAUTH_SECRET` = (generate with: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` = `https://konnecthere.com`
- [ ] `AUTH_URL` = `https://konnecthere.com`
- [ ] `AUTH_TRUST_HOST` = `true`

**For Resume Uploads:**
- [ ] `AWS_REGION` = `us-east-1`
- [ ] `AWS_ACCESS_KEY_ID` = (your AWS key)
- [ ] `AWS_SECRET_ACCESS_KEY` = (your AWS secret)
- [ ] `AWS_S3_BUCKET_NAME` = `konnecthere-resumes`

**Optional (add if you have):**
- [ ] `LINKEDIN_CLIENT_ID` = (if using LinkedIn login)
- [ ] `LINKEDIN_CLIENT_SECRET` = (if using LinkedIn login)
- [ ] `GOOGLE_CLIENT_ID` = (if using Google login)
- [ ] `GOOGLE_CLIENT_SECRET` = (if using Google login)
- [ ] `SMTP_HOST` = (if using email)
- [ ] `SMTP_PASSWORD` = (if using email)
- [ ] `ALGOLIA_APP_ID` = (if using Algolia search)
- [ ] `ALGOLIA_API_KEY` = (if using Algolia search)

### 3.3 Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Note the deployment URL: `https://konnecthere-xxxxx.vercel.app`

---

## ✅ Step 4: Run Database Migrations

- [ ] Open terminal
- [ ] Run: `export DATABASE_URL="your-production-database-url"`
- [ ] Run: `npx prisma migrate deploy`
- [ ] Verify migrations completed successfully

---

## ✅ Step 5: Connect Domain

### 5.1 Add Domain in Vercel
- [ ] Go to Vercel project → Settings → Domains
- [ ] Enter: `konnecthere.com`
- [ ] Click "Add"

### 5.2 Configure DNS

Go to your domain registrar (where you bought konnecthere.com) and add:

**For apex domain (konnecthere.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 Verify Domain
- [ ] Wait 5-60 minutes for DNS propagation
- [ ] Check Vercel dashboard - domain should show "Valid Configuration"
- [ ] Visit https://konnecthere.com to verify

### 5.4 Update Environment Variables
- [ ] After domain is verified, ensure these are set:
  - `NEXTAUTH_URL=https://konnecthere.com`
  - `AUTH_URL=https://konnecthere.com`
- [ ] Redeploy if needed

---

## ✅ Step 6: Test Production Site

- [ ] Visit https://konnecthere.com
- [ ] Test user registration
- [ ] Test login
- [ ] Test job posting (HR role)
- [ ] Test job application (USER role)
- [ ] Test resume upload (if AWS configured)

---

## ✅ Step 7: Set Up Continuous Deployment

- [ ] Verify that pushing to `main` branch auto-deploys
- [ ] Test by making a small change and pushing
- [ ] Confirm deployment appears in Vercel dashboard

---

## 🎉 Success!

Your website is now live at: **https://konnecthere.com**

---

## 📚 Need Help?

- See `DEPLOYMENT.md` for detailed instructions
- See `PUSH_TO_GITHUB.md` for GitHub push help
- Check Vercel logs if deployment fails
- Check DNS propagation: https://dnschecker.org

---

## 🔐 Security Reminders

- ✅ Never commit `.env` file
- ✅ Use different secrets for production
- ✅ Keep your Personal Access Token secure
- ✅ Rotate secrets periodically
- ✅ Enable 2FA on GitHub and Vercel accounts

