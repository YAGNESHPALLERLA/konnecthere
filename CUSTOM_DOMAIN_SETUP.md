# Custom Domain Setup - konnecthere.com

## 🎉 Congratulations on connecting your custom domain!

Now you need to update environment variables and OAuth settings to use your new domain.

---

## 🔴 CRITICAL - Update Environment Variables in Vercel

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

### Update These Variables:

| Variable Name | Old Value | New Value | Environment |
|--------------|-----------|-----------|-------------|
| `NEXTAUTH_URL` | `https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app` | `https://www.konnecthere.com` | **Production** |
| `AUTH_URL` | `https://konnecthere-git-main-yagnesh-pallerlas-projects.vercel.app` | `https://www.konnecthere.com` | **Production, Preview, Development** |

**Important:**
- Keep the old Vercel URL for **Preview** and **Development** environments
- Only update **Production** environment to use `https://www.konnecthere.com`

---

## 🟡 OPTIONAL - Update OAuth Provider Settings

If you're using LinkedIn or Google OAuth, update the callback URLs:

### LinkedIn OAuth

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to **Auth** tab
4. Under **Authorized redirect URLs for your app**, add:
   ```
   https://www.konnecthere.com/api/auth/callback/linkedin
   ```
5. Remove the old Vercel URL if you want
6. Click **Update**

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   ```
   https://www.konnecthere.com/api/auth/callback/google
   ```
6. Remove the old Vercel URL if you want
7. Click **Save**

---

## ✅ Step-by-Step Instructions

### Step 1: Update Environment Variables

1. Go to **Vercel Dashboard** → **konnecthere** project
2. Click **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL`:
   - Click the **pencil icon** (edit)
   - Change **Production** value to: `https://www.konnecthere.com`
   - Keep **Preview** and **Development** as they are (or use Vercel URLs)
   - Click **Save**
4. Find `AUTH_URL`:
   - Click the **pencil icon** (edit)
   - Change **Production** value to: `https://www.konnecthere.com`
   - Change **Preview** value to: `https://www.konnecthere.com` (or keep Vercel URL)
   - Change **Development** value to: `http://localhost:3000`
   - Click **Save**

### Step 2: Redeploy

After updating environment variables:

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 3: Test

1. Visit `https://www.konnecthere.com`
2. Try logging in with test credentials:
   - Email: `admin@konnecthere.com`
   - Password: `admin123`
3. Verify authentication works correctly

---

## 📋 Complete Environment Variables Checklist

After updates, your **Production** environment should have:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:yagnesh_0504@db.vstltyehsgjtcvcxphoh.supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | `I62bfzGD9SmEst8tIxhRCN04ISJNimRVTeHuZ1VJB6Y=` |
| `NEXTAUTH_URL` | `https://www.konnecthere.com` ✅ **UPDATED** |
| `AUTH_URL` | `https://www.konnecthere.com` ✅ **UPDATED** |

---

## 🔍 Verify Domain Configuration

### Check Vercel Domain Settings

1. Go to **Vercel Dashboard** → **Settings** → **Domains**
2. Verify `www.konnecthere.com` is listed
3. Check DNS configuration is correct:
   - Should point to Vercel's servers
   - SSL certificate should be active (automatic with Vercel)

### Test SSL Certificate

Visit `https://www.konnecthere.com` - it should load with HTTPS (green lock icon)

---

## 🆘 Troubleshooting

### Issue: Login still redirects to old Vercel URL

**Solution:**
1. Clear browser cookies for `konnecthere.com`
2. Make sure you redeployed after updating environment variables
3. Check Vercel logs to verify `NEXTAUTH_URL` is being used

### Issue: OAuth login not working

**Solution:**
1. Verify callback URLs are updated in OAuth provider settings
2. Make sure you added `https://www.konnecthere.com/api/auth/callback/[provider]`
3. Wait a few minutes for OAuth provider to update their settings

### Issue: Mixed content warnings

**Solution:**
- Make sure all URLs use `https://` (not `http://`)
- Check that `NEXTAUTH_URL` and `AUTH_URL` both use `https://`

---

## 📝 Summary

**What you need to do:**
1. ✅ Update `NEXTAUTH_URL` to `https://www.konnecthere.com` (Production)
2. ✅ Update `AUTH_URL` to `https://www.konnecthere.com` (Production)
3. ✅ Update OAuth callback URLs (if using OAuth)
4. ✅ Redeploy your app
5. ✅ Test login functionality

**After these changes, your app will be fully configured for your custom domain!** 🎉

