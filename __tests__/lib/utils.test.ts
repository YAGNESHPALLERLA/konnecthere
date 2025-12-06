import { slugify, formatSalary, formatRelativeTime } from "@/lib/utils"

describe("utils", () => {
  describe("slugify", () => {
    it("should convert text to slug", () => {
      expect(slugify("Software Engineer")).toBe("software-engineer")
      expect(slugify("React Developer - Remote")).toBe("react-developer-remote")
      expect(slugify("C++ Developer")).toBe("c-developer")
    })

    it("should handle special characters", () => {
      expect(slugify("Frontend/Backend Developer")).toBe("frontendbackend-developer")
      expect(slugify("Node.js & React")).toBe("nodejs-react")
    })
  })

  describe("formatSalary", () => {
    it("should format salary range", () => {
      expect(formatSalary(50000, 80000, "USD")).toBe("$50,000 - $80,000")
      expect(formatSalary(100000, null, "USD")).toBe("$100,000+")
      expect(formatSalary(null, 60000, "USD")).toBe("Up to $60,000")
    })

    it("should handle different currencies", () => {
      expect(formatSalary(50000, 80000, "EUR")).toBe("€50,000 - €80,000")
      expect(formatSalary(50000, 80000, "GBP")).toBe("£50,000 - £80,000")
    })
  })

  describe("formatRelativeTime", () => {
    it("should format recent dates", () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      expect(formatRelativeTime(oneHourAgo.toISOString())).toContain("h ago")
    })

    it("should format older dates", () => {
      const date = new Date("2024-01-01")
      expect(formatRelativeTime(date.toISOString())).toBeTruthy()
    })
  })
})


