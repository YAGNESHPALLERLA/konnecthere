# Environment Variables Setup

## Required Environment Variables

Create or update your `.env` file with the following variables:

```env
# Database Connection
# Local PostgreSQL database
DATABASE_URL="postgresql://konnect:yagnesh0504@localhost:5432/konnecthere?schema=public"

# Auth.js v5 (NextAuth v5) Configuration
# IMPORTANT: Set these to match your actual dev server URL
# If running on port 3000: http://localhost:3000
# If running on port 3001: http://localhost:3001
# Check which port your dev server is actually using!
AUTH_URL="http://localhost:3000"
AUTH_SECRET="your-32-character-secret-here"
AUTH_TRUST_HOST=true

# Legacy NextAuth v4 (for compatibility)
# Set to same values as AUTH_* variables above
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="same-as-AUTH_SECRET-above"

# Optional: OAuth Providers (only if you want OAuth login)
# LINKEDIN_CLIENT_ID=""
# LINKEDIN_CLIENT_SECRET=""
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

## How to Check Your Port

1. Start your dev server: `npm run dev`
2. Check the console output - it will show something like:
   ```
   ▲ Next.js 16.0.4
   - Local:        http://localhost:3000
   ```
3. Update `AUTH_URL` and `NEXTAUTH_URL` to match the port shown

## Generate AUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it for both `AUTH_SECRET` and `NEXTAUTH_SECRET`.

## Important Notes

- **AUTH_URL and NEXTAUTH_URL must match your actual dev server URL**
- If you see redirect loops, check that these URLs match exactly (including port)
- In production, set these to your production domain (e.g., `https://konnecthere.com`)
- `AUTH_TRUST_HOST=true` allows Auth.js to trust the host header (useful for development)

## Testing

After setting up `.env`:

1. Restart your dev server: `npm run dev`
2. Try logging in at `http://localhost:3000/auth/signin`
3. Check browser console for any errors
4. Check server logs for `[AUTH]` prefixed messages



