// Simple in-memory rate limiter
// For production, use Redis-based solution like @upstash/ratelimit

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

type RateLimitConfig = {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

type RateLimitStore = Map<
  string,
  {
    count: number
    resetAt: number
  }
>

function cleanupExpiredEntries(store: RateLimitStore) {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) {
      store.delete(key)
    }
  }
}

export function createRateLimiter(config: RateLimitConfig) {
  // Each rate limiter instance has its own store
  const store: RateLimitStore = new Map()
  
  return (identifier: string): { allowed: boolean; remaining: number; resetAt: number } => {
    const now = Date.now()

    // Cleanup expired entries periodically
    if (Math.random() < 0.1) {
      cleanupExpiredEntries(store)
    }

    const record = store.get(identifier)

    if (!record || record.resetAt < now) {
      // New window or expired
      store.set(identifier, {
        count: 1,
        resetAt: now + config.windowMs,
      })
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      }
    }

    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt,
      }
    }

    record.count++
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetAt: record.resetAt,
    }
  }
}

// Pre-configured rate limiters
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
})

export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
})

export const searchRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
})

export function getRateLimitIdentifier(req: Request): string {
  // Try to get IP from headers (works with most proxies)
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown"
  
  // In production, you might want to use user ID if authenticated
  return ip
}

// Helper functions for route handlers
export function rateLimitAuth(req: NextRequest): NextResponse | null {
  const identifier = getRateLimitIdentifier(req)
  const result = authRateLimit(identifier)
  
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }
  
  return null
}

export function rateLimitSearch(req: NextRequest): NextResponse | null {
  const identifier = getRateLimitIdentifier(req)
  const result = searchRateLimit(identifier)
  
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }
  
  return null
}


