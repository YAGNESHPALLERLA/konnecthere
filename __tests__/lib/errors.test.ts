import { AppError, ValidationError, NotFoundError, handleError } from "@/lib/errors"
import { NextResponse } from "next/server"

describe("Error handling", () => {
  describe("AppError", () => {
    it("should create error with status code", () => {
      const error = new AppError("Test error", 400)
      expect(error.message).toBe("Test error")
      expect(error.statusCode).toBe(400)
    })
  })

  describe("ValidationError", () => {
    it("should create validation error", () => {
      const error = new ValidationError("Invalid input", { field: "email" })
      expect(error.message).toBe("Invalid input")
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe("VALIDATION_ERROR")
      expect(error.details).toEqual({ field: "email" })
    })
  })

  describe("NotFoundError", () => {
    it("should create not found error", () => {
      const error = new NotFoundError("User")
      expect(error.message).toBe("User not found")
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe("NOT_FOUND")
    })
  })

  describe("handleError", () => {
    it("should handle AppError", () => {
      const error = new ValidationError("Test")
      const response = handleError(error)
      expect(response).toBeInstanceOf(NextResponse)
    })

    it("should handle generic Error", () => {
      const error = new Error("Generic error")
      const response = handleError(error)
      expect(response).toBeInstanceOf(NextResponse)
    })

    it("should handle unknown errors", () => {
      const response = handleError("string error")
      expect(response).toBeInstanceOf(NextResponse)
    })
  })
})


