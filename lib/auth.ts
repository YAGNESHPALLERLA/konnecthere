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
      try {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) {
          console.log("[AUTH] Missing email or password")
          // Return null to trigger CredentialsSignin error
          return null
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() }
        })

        if (!user) {
          console.log("[AUTH] User not found:", email)
          // Return null to trigger CredentialsSignin error
          return null
        }

        if (!user.password) {
          console.log("[AUTH] User has no password set:", email)
          // Return null to trigger CredentialsSignin error
          return null
        }

        if (user.status !== "ACTIVE") {
          console.log("[AUTH] User account is not active:", email, "Status:", user.status)
          // Return null to trigger AccessDenied error
          return null
        }

        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          console.log("[AUTH] Invalid password for user:", email)
          // Return null to trigger CredentialsSignin error
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

        console.log("[AUTH] Successful authentication for:", email, "Role:", role)

        // Return user object with role for JWT token
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role,
        }
      } catch (error) {
        console.error("[AUTH] Credentials authorize error:", error)
        // Return null on any unexpected error to trigger CredentialsSignin
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
      // CRITICAL: Never redirect to /api/auth/* routes - this causes infinite loops
      // Check both relative and absolute URLs
      if (url.includes("/api/auth") || url.includes("/api/auth/")) {
        if (process.env.NODE_ENV === "development") {
          console.log("[AUTH] Redirect callback blocked redirect to /api/auth/*:", url)
        }
        return baseUrl
      }

      // If url is relative, make it absolute
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`
        // Double-check the full URL doesn't contain /api/auth
        if (fullUrl.includes("/api/auth")) {
          if (process.env.NODE_ENV === "development") {
            console.log("[AUTH] Redirect callback blocked relative URL that resolves to /api/auth/*:", url)
          }
          return baseUrl
        }
        return fullUrl
      }
      
      // If url is absolute, validate it's same origin
      try {
        const urlObj = new URL(url)
        // Block if it's an /api/auth route
        if (urlObj.pathname.startsWith("/api/auth")) {
          if (process.env.NODE_ENV === "development") {
            console.log("[AUTH] Redirect callback blocked absolute URL to /api/auth/*:", url)
          }
          return baseUrl
        }
        // Only allow same-origin URLs
        if (urlObj.origin === baseUrl) {
          return url
        }
        // Different origin - return baseUrl to prevent redirect loops
        if (process.env.NODE_ENV === "development") {
          console.log("[AUTH] Redirect callback blocked cross-origin URL:", url)
        }
        return baseUrl
      } catch (error) {
        // Invalid URL - return baseUrl
        if (process.env.NODE_ENV === "development") {
          console.log("[AUTH] Redirect callback blocked invalid URL:", url, error)
        }
        return baseUrl
      }
    },
    async signIn({ user, account, profile }) {
      try {
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

        return true
      } catch (error) {
        console.error("[AUTH] SignIn callback error:", error)
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
        } else if (trigger === "update") {
          // Refresh user data from DB if needed
          const userId = token.sub || token.id
          if (userId) {
            const dbUser = await prisma.user.findUnique({
              where: { id: userId as string },
              select: { role: true, status: true, email: true }
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
        }
        return session
      } catch (error) {
        console.error("[AUTH] Session callback error:", error)
        return session
      }
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
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

