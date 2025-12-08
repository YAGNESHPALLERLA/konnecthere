# Test Credentials for KonnectHere

## 🎯 Test Users

These users were created by the seed script and are available for testing:

### 1. Admin User
- **Email**: `admin@konnecthere.com`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Dashboard**: `/dashboard/admin`
- **Access**: Full access to all features, user management, job management

### 2. HR User
- **Email**: `hr@konnecthere.com`
- **Password**: `hr123`
- **Role**: `HR`
- **Dashboard**: `/dashboard/hr`
- **Access**: Manage companies, post jobs, review applications

### 3. Regular User
- **Email**: `user@konnecthere.com`
- **Password**: `user123`
- **Role**: `USER`
- **Dashboard**: `/dashboard/user`
- **Access**: Browse jobs, apply for jobs, manage applications

## 🧪 Testing Checklist

### Test Admin Login
1. Go to: `https://www.konnecthere.com/auth/signin`
2. Login with: `admin@konnecthere.com` / `admin123`
3. Should redirect to: `/dashboard/admin`
4. Verify: Can see all users, jobs, applications

### Test HR Login
1. Go to: `https://www.konnecthere.com/auth/signin`
2. Login with: `hr@konnecthere.com` / `hr123`
3. Should redirect to: `/dashboard/hr`
4. Verify: Can see HR dashboard, manage jobs

### Test User Login
1. Go to: `https://www.konnecthere.com/auth/signin`
2. Login with: `user@konnecthere.com` / `user123`
3. Should redirect to: `/dashboard/user`
4. Verify: Can see user dashboard, browse jobs

## 🔐 Security Note

⚠️ **These are test credentials with weak passwords!**

**For production:**
- Change all passwords to strong, unique passwords
- Consider removing test users or restricting their access
- Use proper password policies

## 📋 Quick Reference

| Role | Email | Password | Dashboard URL |
|------|-------|----------|---------------|
| ADMIN | `admin@konnecthere.com` | `admin123` | `/dashboard/admin` |
| HR | `hr@konnecthere.com` | `hr123` | `/dashboard/hr` |
| USER | `user@konnecthere.com` | `user123` | `/dashboard/user` |

---

**All test users are ready to use!** 🎉
