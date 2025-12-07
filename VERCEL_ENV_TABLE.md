# Vercel Environment Variables - Complete Table

## Copy and paste these into Vercel Dashboard → Settings → Environment Variables

| Variable Name | Value | Environment | Required |
|--------------|-------|-------------|----------|
| `DATABASE_URL` | **For Vercel (Pooler):** Get from Supabase Dashboard → Settings → Database → Connection Pooling → Session mode<br><br>**OR use direct (tested):** `postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres` | Production, Preview, Development | ✅ Yes |
| `NEXTAUTH_SECRET` | `I62bfzGD9SmEst8tIxhRCN04ISJNimRVTeHuZ1VJB6Y=` | Production, Preview, Development | ✅ Yes |
| `NEXTAUTH_URL` | `https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app` | Production | ✅ Yes |
| `AUTH_URL` | `https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app` | Production, Preview, Development | ✅ Yes |

---

## 📋 Quick Steps:

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Click **"Add New"** for each variable
3. Copy the **Variable Name** and **Value** from the table above
4. Select the **Environment** (Production/Preview/Development) as shown
5. Click **"Save"**
6. Repeat for all 4 variables
7. **Redeploy** your app

---

## 🔄 After Adding Variables:

Run database migrations:

```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
```

Then redeploy in Vercel dashboard.

---

## ⚠️ Important Notes:

- **NEXTAUTH_URL**: Replace with your actual Vercel app URL if different
- **DATABASE_URL**: This is the connection pooler URL (port 6543) - required for Vercel
- All variables marked as "Required" must be added for the app to work

