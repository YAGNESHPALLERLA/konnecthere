# Debug Login Issue - Step by Step

## ✅ What We Know Works:
- ✅ User exists in database: `admin@konnecthere.com`
- ✅ Password is correct: `admin123`
- ✅ User status is ACTIVE
- ✅ Password hash is valid

## 🔍 Likely Issues in Vercel:

### Issue 1: DATABASE_URL Format
Vercel might be using the **connection pooler URL** which we haven't tested. 

**Check in Vercel Dashboard:**
1. Go to Settings → Environment Variables
2. Check your `DATABASE_URL` value
3. If it uses port `6543` (pooler), it might not be working

**Solution:** Use the **direct connection** URL that we tested:
```
postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres
```

### Issue 2: Missing AUTH_URL
Make sure `AUTH_URL` is set in Vercel (same as `NEXTAUTH_URL`)

### Issue 3: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "View Function Logs" or check "Runtime Logs"
4. Look for `[AUTH]` log messages to see what's failing

---

## 🔧 Quick Fix Steps:

### Step 1: Verify Environment Variables in Vercel

Make sure you have ALL of these:

| Variable | Value | Status |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres` | ✅ Check |
| `NEXTAUTH_SECRET` | `I62bfzGD9SmEst8tIxhRCN04ISJNimRVTeHuZ1VJB6Y=` | ✅ Check |
| `NEXTAUTH_URL` | `https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app` | ✅ Check |
| `AUTH_URL` | `https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app` | ⚠️ **ADD THIS** |

### Step 2: Update DATABASE_URL to Direct Connection

If your `DATABASE_URL` in Vercel uses the pooler (port 6543), change it to:

```
postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres
```

### Step 3: Redeploy

After updating environment variables:
1. Go to Deployments
2. Click "..." → "Redeploy"

### Step 4: Check Logs

After redeploy, try logging in and check:
- Vercel Function Logs for `[AUTH]` messages
- Browser console for errors

---

## 🧪 Test Database Connection from Vercel

If you want to test if Vercel can connect to the database, you can temporarily add a test API route:

```typescript
// app/api/test-db/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@konnecthere.com" }
    })
    return NextResponse.json({ 
      success: true, 
      user: user ? { email: user.email, role: user.role } : null 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
```

Then visit: `https://your-app.vercel.app/api/test-db`

---

## 📋 Checklist:

- [ ] `AUTH_URL` is set in Vercel
- [ ] `DATABASE_URL` uses direct connection (port 5432, not 6543)
- [ ] All 4 environment variables are set
- [ ] App has been redeployed after adding variables
- [ ] Checked Vercel logs for `[AUTH]` error messages

---

## 🆘 If Still Not Working:

1. **Check Vercel Function Logs** - Look for database connection errors
2. **Verify DATABASE_URL** - Make sure it's exactly: `postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres`
3. **Check Supabase Network Settings** - Make sure your database allows connections from Vercel IPs
4. **Try creating a new user** via signup page to test if database writes work

