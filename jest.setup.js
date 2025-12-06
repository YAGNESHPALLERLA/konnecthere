// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"

// Polyfill for Node.js globals needed by Next.js server-side code
// These are required when importing from 'next/server' in tests
// Node.js 18+ has fetch built-in, but jsdom environment doesn't expose Request/Response
if (typeof globalThis.Request === "undefined") {
  // Minimal polyfill for Request, Response, and Headers
  globalThis.Headers = class Headers extends Map {
    constructor(init) {
      super()
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value))
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value))
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value))
        }
      }
    }
    get(name) {
      return super.get(String(name).toLowerCase())
    }
    set(name, value) {
      return super.set(String(name).toLowerCase(), String(value))
    }
    has(name) {
      return super.has(String(name).toLowerCase())
    }
    delete(name) {
      return super.delete(String(name).toLowerCase())
    }
  }

  globalThis.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === "string" ? input : input?.url || ""
      this.method = (init.method || "GET").toUpperCase()
      this.headers = new Headers(init.headers)
      this.body = init.body || null
      this.bodyUsed = false
    }
    clone() {
      return new Request(this.url, { method: this.method, headers: this.headers, body: this.body })
    }
  }

  globalThis.Response = class Response {
    constructor(body, init = {}) {
      this.status = init.status || 200
      this.statusText = init.statusText || "OK"
      this.headers = new Headers(init.headers)
      this.body = body
      this.bodyUsed = false
      this.ok = this.status >= 200 && this.status < 300
    }
    async json() {
      if (this.bodyUsed) {
        throw new TypeError("Body already consumed")
      }
      this.bodyUsed = true
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body
    }
    clone() {
      return new Response(this.body, { status: this.status, statusText: this.statusText, headers: this.headers })
    }
    // Static method used by NextResponse.json()
    static json(body, init = {}) {
      const headers = new Headers(init.headers)
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json")
      }
      return new Response(JSON.stringify(body), {
        ...init,
        headers,
      })
    }
  }
}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return "/"
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  SessionProvider: ({ children }) => children,
}))


