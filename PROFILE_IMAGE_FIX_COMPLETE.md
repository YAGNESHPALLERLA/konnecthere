# Profile Image Upload & Navbar Alignment - Complete Fix

## ✅ Issues Fixed

### 1. Profile Image Upload Flow
**Problem:** Images uploaded to S3 but not displaying in UI

**Root Causes:**
- S3 objects were not publicly accessible (missing ACL)
- Next.js Image component couldn't load S3 images (missing domain configuration)
- Session wasn't properly refreshing after upload

**Solutions Implemented:**

#### A. Backend/DB (`app/api/profile/upload-picture/route.ts`)
- ✅ Added `ACL: "public-read"` to S3 PutObjectCommand so images are publicly accessible
- ✅ Correctly constructs S3 URL: `https://{bucket}.s3.{region}.amazonaws.com/{key}`
- ✅ Updates Prisma `User.image` field with the S3 URL
- ✅ Returns updated user data in API response

#### B. Next.js Image Configuration (`next.config.ts`)
- ✅ Added S3 bucket domains to `images.remotePatterns`:
  - `*.s3.*.amazonaws.com` (standard S3 URLs)
  - `*.s3.amazonaws.com` (alternative format)
  - CDN URL support if `AWS_S3_CDN_URL` is configured
- ✅ Enables Next.js Image optimization for S3-hosted images

#### C. Auth Session (`lib/auth.ts`)
- ✅ JWT callback includes `user.image` in token
- ✅ On session update (`trigger === "update"`), fetches fresh user data from DB
- ✅ Session callback always includes `image` field (even if null)
- ✅ Ensures `useSession()` always has latest profile image

#### D. Frontend Components
- ✅ `ProfilePictureUpload` component:
  - Uses `session.user.image` as primary source
  - Falls back to `currentImage` prop
  - Shows initials in circle when no image
  - Adds `crossOrigin="anonymous"` for CORS compatibility
- ✅ Dashboard page uses `userDetails?.image` from Prisma
- ✅ Navbar uses `session.user?.image` from session

### 2. Navbar User Chip Alignment
**Problem:** Avatar, name, role, and Sign out button were misaligned

**Solution:**
- ✅ Changed container to `rounded-full` with `shadow-sm` for pill shape
- ✅ Consistent `gap-2` spacing between all elements
- ✅ Proper vertical alignment with `items-center`
- ✅ Name uses `text-sm font-medium` with `truncate`
- ✅ Role badge uses `text-[11px] font-semibold uppercase tracking-wide`
- ✅ Sign out button has `ml-2` spacing
- ✅ Applied to both desktop and mobile navbars

## 📁 Files Modified

1. **`next.config.ts`**
   - Added S3 image domain configuration

2. **`app/api/profile/upload-picture/route.ts`**
   - Added `ACL: "public-read"` to S3 upload

3. **`components/Navbar.tsx`**
   - Fixed user chip alignment (desktop + mobile)
   - Updated styling to match requirements

4. **`components/ui/ProfilePictureUpload.tsx`**
   - Added `crossOrigin="anonymous"`
   - Updated border color to `border-slate-200`

## 🔄 Complete Upload Flow

1. User clicks camera icon → File picker opens
2. User selects image → Preview shows immediately (FileReader)
3. File uploads to S3:
   - Path: `profile-pictures/{userId}/{timestamp}-{filename}`
   - ACL: `public-read` (publicly accessible)
   - Content-Type: Preserved from file
4. Database updated:
   - `User.image` = S3 URL
5. Session refreshed:
   - `updateSession()` triggers JWT callback
   - JWT callback fetches fresh user from DB
   - Session callback includes updated image
6. UI updates:
   - Preview shows new image
   - Success toast appears
   - Page reloads after 2 seconds
   - Image appears everywhere (navbar, dashboard)

## 🎨 Navbar User Chip Styling

**Desktop:**
```tsx
<div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 shadow-sm">
  <Avatar /> {/* 32px */}
  <div className="flex flex-col leading-tight">
    <span className="text-sm font-medium text-slate-900 truncate">
      {name}
    </span>
    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {role}
    </span>
  </div>
</div>
<Button variant="outline" size="sm" className="ml-2">
  Sign out
</Button>
```

**Mobile:** Same styling, full-width button below

## 🔐 S3 Configuration

**Required:**
- S3 bucket must allow public read access (or use ACL: "public-read" on upload)
- Bucket CORS policy should allow requests from your domain

**Environment Variables:**
- `AWS_ACCESS_KEY_ID` - Required
- `AWS_SECRET_ACCESS_KEY` - Required
- `AWS_REGION` - Defaults to `us-east-1`
- `AWS_S3_BUCKET_NAME` - Defaults to `konnecthere-resumes`
- `AWS_S3_CDN_URL` - Optional, for CDN URLs

## ✅ Testing Checklist

- [x] Profile image uploads to S3 successfully
- [x] Image URL is stored in database
- [x] Image appears in navbar user chip
- [x] Image appears on dashboard profile page
- [x] Image persists after page reload
- [x] Session updates correctly after upload
- [x] Fallback initials show when no image
- [x] Navbar user chip is properly aligned
- [x] Mobile navbar alignment is correct
- [x] Build passes without errors
- [x] No TypeScript errors

## 🚀 Next Steps (Optional)

1. **S3 Bucket Policy:** Ensure bucket allows public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/profile-pictures/*"
       }
     ]
   }
   ```

2. **CDN Setup:** For better performance, configure CloudFront:
   - Create CloudFront distribution
   - Set `AWS_S3_CDN_URL` to CloudFront URL
   - Images will be served via CDN

3. **Image Optimization:** Consider adding image resizing:
   - Resize large images before upload
   - Generate thumbnails for different sizes
   - Use Next.js Image component for optimization

## 📝 Notes

- Profile pictures are stored in the same bucket as resumes
- Images are publicly accessible (ACL: "public-read")
- Maximum file size: 5MB
- Allowed formats: JPEG, PNG, WebP, GIF
- Session refresh happens automatically via NextAuth
- All components use session or DB user data for images

