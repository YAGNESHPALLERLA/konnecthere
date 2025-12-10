import "next-auth"
import "next-auth/jwt"

export type UserRole = "USER" | "HR" | "ADMIN"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    sub?: string
    role: UserRole
    email?: string
    image?: string | null
    name?: string | null
  }
}


