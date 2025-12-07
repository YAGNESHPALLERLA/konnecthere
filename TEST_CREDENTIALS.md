# Test Credentials

## 🔐 Test User Accounts

These test accounts have been created in your database. Use them to test different user roles and features.

---

## 👤 Admin Account

**Email:** `admin@konnecthere.com`  
**Password:** `admin123`  
**Role:** ADMIN  
**Access:** Full admin access to all features

**Use for:**
- Testing admin dashboard
- Managing users
- System administration

---

## 💼 HR / Employer Account

**Email:** `hr@konnecthere.com`  
**Password:** `hr123`  
**Role:** HR  
**Access:** Employer features - post jobs, manage applications

**Use for:**
- Posting job listings
- Managing job applications
- Viewing candidate resumes
- Employer dashboard

**Company:** Sample Company (already created)

---

## 👨‍💼 Candidate / Job Seeker Account

**Email:** `user@konnecthere.com`  
**Password:** `user123`  
**Role:** USER (Candidate)  
**Access:** Job seeker features - browse jobs, apply, upload resume

**Use for:**
- Browsing job listings
- Applying to jobs
- Uploading resumes
- Candidate dashboard
- Saving jobs

---

## 📋 Quick Reference Table

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | `admin@konnecthere.com` | `admin123` | Full system access |
| **HR/Employer** | `hr@konnecthere.com` | `hr123` | Post jobs, manage applications |
| **Candidate** | `user@konnecthere.com` | `user123` | Browse and apply to jobs |

---

## 🧪 Testing Scenarios

### Test Employer Flow:
1. Login as `hr@konnecthere.com` / `hr123`
2. Go to Employer Dashboard
3. Create/Post a new job
4. View applications for posted jobs

### Test Candidate Flow:
1. Login as `user@konnecthere.com` / `user123`
2. Browse jobs
3. Apply to a job
4. Upload resume
5. Save jobs for later

### Test Admin Flow:
1. Login as `admin@konnecthere.com` / `admin123`
2. Access admin dashboard
3. Manage users and companies

---

## ⚠️ Security Note

**These are test credentials only!**

- Change passwords in production
- Do not use these credentials in production
- These accounts are for development/testing only

---

## 🔄 Re-seed Database

To recreate test users (if deleted), run:

```bash
npm run db:seed
```

Or with custom DATABASE_URL:

```bash
DATABASE_URL="your-connection-string" npm run db:seed
```

---

## 📝 Create Additional Test Users

You can also create new test users through the signup page:
- Go to `/auth/signup`
- Fill in the form
- Choose role (CANDIDATE or EMPLOYER)

