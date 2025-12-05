import { createRateLimiter } from "@/lib/rateLimit"

describe("Rate Limiter", () => {
  it("should allow requests within limit", () => {
    const limiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 5,
    })

    const result1 = limiter("test-id")
    expect(result1.allowed).toBe(true)
    expect(result1.remaining).toBe(4)

    const result2 = limiter("test-id")
    expect(result2.allowed).toBe(true)
    expect(result2.remaining).toBe(3)
  })

  it("should block requests exceeding limit", () => {
    const limiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 2,
    })

    limiter("test-id")
    limiter("test-id")
    const result = limiter("test-id")

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("should reset after window expires", async () => {
    const limiter = createRateLimiter({
      windowMs: 100,
      maxRequests: 2,
    })

    limiter("test-id")
    limiter("test-id")

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150))

    const result = limiter("test-id")
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(1)
  })
})


