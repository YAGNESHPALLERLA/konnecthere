import type { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import LinkedInProvider from "next-auth/providers/linkedin"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Build providers array
// Only add providers if they have the required credentials to prevent errors
const providers: any[] = []

// Credentials provider - always available
providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined
      const password = credentials?.password as string | undefined

      // Never log passwords - only email and reason
      try {
        // Validate input
        if (!email || !password) {
          console.error("[AUTH] Credentials authorize: Missing email or password", {
            hasEmail: !!email,
            hasPassword: !!password,
          })
          return null
        }

        const normalizedEmail = email.toLowerCase().trim()
        console.log("[AUTH] Credentials authorize: Attempting login", { email: normalizedEmail })

        // Find user in database
        let user
        try {
          user = await prisma.user.findUnique({
            where: { email: normalizedEmail }
          })
        } catch (dbError: any) {
          console.error("[AUTH] Credentials authorize: Database connection error", {
            email: normalizedEmail,
            error: dbError.message,
            errorCode: dbError.code,
          })
          return null
        }

        if (!user) {
          console.error("[AUTH] Credentials authorize: User not found", { email: normalizedEmail })
          return null
        }

        if (!user.password) {
          console.error("[AUTH] Credentials authorize: User has no password set", {
            email: normalizedEmail,
            userId: user.id,
            role: user.role,
          })
          return null
        }

        if (user.status !== "ACTIVE") {
          console.error("[AUTH] Credentials authorize: User account is not active", {
            email: normalizedEmail,
            userId: user.id,
            status: user.status,
          })
          return null
        }

        // Verify password using bcrypt
        let isPasswordValid = false
        try {
          isPasswordValid = await bcrypt.compare(password, user.password)
        } catch (bcryptError: any) {
          console.error("[AUTH] Credentials authorize: Password comparison error", {
            email: normalizedEmail,
            error: bcryptError.message,
          })
          return null
        }

        if (!isPasswordValid) {
          console.error("[AUTH] Credentials authorize: Invalid password", {
            email: normalizedEmail,
            userId: user.id,
          })
          return null
        }

        // Map legacy roles to new roles
        let role: "USER" | "HR" | "ADMIN" = "USER"
        if (user.role === "ADMIN") {
          role = "ADMIN"
        } else if (user.role === "HR") {
          role = "HR"
        } else if (user.role === "CANDIDATE" || user.role === "USER") {
          role = "USER"
        } else if (user.role === "EMPLOYER") {
          // Map EMPLOYER to HR for backward compatibility
          role = "HR"
        }

        console.log("[AUTH] Credentials authorize: Successful authentication", {
          email: normalizedEmail,
          userId: user.id,
          role,
        })

        // Return user object with role for JWT token
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role,
        }
      } catch (error: any) {
        console.error("[AUTH] Credentials authorize: Unexpected error", {
          email: email?.toLowerCase().trim(),
          error: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        })
        return null
      }
    }
  })
)

// LinkedIn provider - only if credentials are provided
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  providers.push(
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "r_liteprofile r_emailaddress w_member_social",
        },
      },
    })
  )
}

// Google provider - only if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// Get base URL from environment or infer from request
function getBaseUrl(): string {
  // In production, use NEXTAUTH_URL or AUTH_URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL
  }
  // In development, default to localhost
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }
  // Fallback (should not happen in production)
  return "http://localhost:3000"
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as any,
  providers,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Redirect callback - prevents redirect loops by validating URLs
    // This is called when NextAuth needs to redirect (e.g., after sign-in, sign-out)
    // CRITICAL: This callback must NEVER redirect to /api/auth/* routes
    redirect({ url, baseUrl }) {
      // Use environment-based baseUrl if available, otherwise use the provided baseUrl
      const effectiveBaseUrl = getBaseUrl()
      
      // CRITICAL: Never redirect to /api/auth/* routes - this causes infinite loops
      // Check both relative and absolute URLs
      if (url.includes("/api/auth") || url.includes("/api/auth/")) {
        console.log("[AUTH] Redirect callback blocked redirect to /api/auth/*:", url)
        return effectiveBaseUrl
      }

      // If url is relative, make it absolute
      if (url.startsWith("/")) {
        const fullUrl = `${effectiveBaseUrl}${url}`
        // Double-check the full URL doesn't contain /api/auth
        if (fullUrl.includes("/api/auth")) {
          console.log("[AUTH] Redirect callback blocked relative URL that resolves to /api/auth/*:", url)
          return effectiveBaseUrl
        }
        return fullUrl
      }
      
      // If url is absolute, validate it's same origin
      try {
        const urlObj = new URL(url)
        // Block if it's an /api/auth route
        if (urlObj.pathname.startsWith("/api/auth")) {
          console.log("[AUTH] Redirect callback blocked absolute URL to /api/auth/*:", url)
          return effectiveBaseUrl
        }
        // Only allow same-origin URLs (compare with effectiveBaseUrl)
        const baseUrlObj = new URL(effectiveBaseUrl)
        if (urlObj.origin === baseUrlObj.origin) {
          return url
        }
        // Different origin - return effectiveBaseUrl to prevent redirect loops
        console.log("[AUTH] Redirect callback blocked cross-origin URL:", url)
        return effectiveBaseUrl
      } catch (error) {
        // Invalid URL - return effectiveBaseUrl
        console.log("[AUTH] Redirect callback blocked invalid URL:", url, error)
        return effectiveBaseUrl
      }
    },
    async signIn({ user, account, profile }) {
      try {
        console.log("[AUTH] SignIn callback triggered", {
          provider: account?.provider,
          userId: user?.id,
          email: user?.email,
          hasAccount: !!account,
          hasProfile: !!profile,
        })

        // For credentials provider, user should already be validated in authorize
        if (account?.provider === "credentials") {
          if (!user?.id || !user?.email) {
            console.error("[AUTH] Credentials sign-in failed: missing user data", {
              hasId: !!user?.id,
              hasEmail: !!user?.email,
            })
            // Return false to trigger CredentialsSignin error
            return false
          }
          
          // Verify user is still active in database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { status: true, role: true }
          })
          
          if (!dbUser) {
            console.error("[AUTH] User not found in database:", user.id)
            return false
          }
          
          if (dbUser.status !== "ACTIVE") {
            console.error("[AUTH] User account is not active:", user.email, "Status:", dbUser.status)
            // Return false to trigger AccessDenied error
            return false
          }
          
          // Ensure role is set correctly on user object
          if (!user.role) {
            // Map database role to user role
            if (dbUser.role === "ADMIN") {
              user.role = "ADMIN"
            } else if (dbUser.role === "HR") {
              user.role = "HR"
            } else if (dbUser.role === "CANDIDATE" || dbUser.role === "USER") {
              user.role = "USER"
            } else if (dbUser.role === "EMPLOYER") {
              user.role = "HR"
            } else {
              user.role = "USER"
            }
          }
          
          return true
        }

        // For OAuth providers, ensure user exists in DB or create it
        if (account?.provider !== "credentials" && user?.email) {
          console.log("[AUTH] Processing OAuth sign-in", {
            provider: account?.provider,
            email: user.email,
          })

          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            console.log("[AUTH] Creating new OAuth user:", user.email)
            // Create user if doesn't exist (OAuth flow)
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                emailVerified: new Date(),
                role: "USER", // Default role for OAuth users
                status: "ACTIVE",
              }
            })
          } else if (existingUser.status !== "ACTIVE") {
            console.log("[AUTH] OAuth user account is suspended:", user.email)
            // Block sign-in if user is suspended
            return false
          }
        }

        console.log("[AUTH] SignIn callback successful", {
          provider: account?.provider,
          userId: user?.id,
        })
        return true
      } catch (error: any) {
        console.error("[AUTH] SignIn callback error:", {
          error: error.message,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
          provider: account?.provider,
        })
        return false
      }
    },
    async jwt({ token, user, trigger, account }) {
      try {
        if (user) {
          // Use sub for user ID (NextAuth v5 standard)
          token.sub = user.id
          token.id = user.id
          token.role = (user.role as "USER" | "HR" | "ADMIN") || "USER"
          token.email = user.email
          token.image = user.image || null
          token.name = user.name || null
        } else if (trigger === "update") {
          // Refresh user data from DB if needed
          const userId = token.sub || token.id
          if (userId) {
            const dbUser = await prisma.user.findUnique({
              where: { id: userId as string },
              select: { role: true, status: true, email: true, image: true, name: true }
            })
            if (dbUser) {
              // Map legacy roles
              if (dbUser.role === "ADMIN") {
                token.role = "ADMIN"
              } else if (dbUser.role === "HR") {
                token.role = "HR"
              } else if (dbUser.role === "CANDIDATE" || dbUser.role === "USER") {
                token.role = "USER"
              } else if (dbUser.role === "EMPLOYER") {
                token.role = "HR"
              }
              // Update image and name from database
              token.image = dbUser.image || null
              token.name = dbUser.name || null
            }
          }
        }
        return token
      } catch (error) {
        console.error("[AUTH] JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          // Use token.sub for user ID (NextAuth v5 standard)
          session.user.id = (token.sub as string) || (token.id as string) || ""
          session.user.role = (token.role as "USER" | "HR" | "ADMIN") || "USER"
          // Include image and name from token (always set, even if null)
          session.user.image = (token.image as string | null) || null
          session.user.name = (token.name as string | null) || null
        }
        return session
      } catch (error) {
        console.error("[AUTH] Session callback error:", error)
        return session
      }
    },
  },
  // Auth.js v5 uses AUTH_SECRET, but we support NEXTAUTH_SECRET for backward compatibility
  // Fail fast if neither is set
  secret: (() => {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) {
      throw new Error(
        "Missing AUTH_SECRET or NEXTAUTH_SECRET environment variable. " +
        "Set one of these in your .env file (AUTH_SECRET is preferred for Auth.js v5)."
      )
    }
    return secret
  })(),
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  // Enable CSRF protection
  useSecureCookies: process.env.NODE_ENV === "production",
  // Ensure cookies are set correctly
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  // CRITICAL: Ensure session endpoint never redirects
  // This prevents redirect loops when SessionProvider fetches /api/auth/session
  experimental: {
    enableWebAuthn: false,
  },
}

