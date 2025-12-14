import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        bio: true,
        location: true,
        currentTitle: true,
        website: true,
        linkedin: true,
        github: true,
        twitter: true,
        education: true,
        experience: true,
        skills: true,
        availability: true,
        salaryExpectation: true,
        preferredLocation: true,
        experienceLevel: true,
        yearsOfExperience: true,
        dateOfBirth: true,
        gender: true,
        languages: true,
        certifications: true,
        portfolioUrl: true,
        image: true,
        emailVerified: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  currentTitle: z.string().max(255).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  linkedin: z.string().url().optional().nullable().or(z.literal("")),
  github: z.string().url().optional().nullable().or(z.literal("")),
  twitter: z.string().url().optional().nullable().or(z.literal("")),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string().optional(),
    field: z.string().optional(),
    startDate: z.string().optional(), // ISO date string (YYYY-MM-DD)
    endDate: z.string().optional(), // ISO date string (YYYY-MM-DD)
    description: z.string().optional(),
  })).optional().nullable(),
  experience: z.array(z.object({
    company: z.string(),
    title: z.string(),
    startDate: z.string().optional(), // ISO date string (YYYY-MM-DD)
    endDate: z.string().optional(), // ISO date string (YYYY-MM-DD), should be undefined if current is true
    current: z.boolean().optional(),
    description: z.string().optional(),
  })).optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  availability: z.string().max(255).optional().nullable(),
  salaryExpectation: z.string().max(255).optional().nullable(),
  preferredLocation: z.string().max(255).optional().nullable(),
  experienceLevel: z.enum(["FRESHER", "EXPERIENCED"]).optional().nullable(),
  yearsOfExperience: z.number().int().min(0).max(50).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(), // ISO date string
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  languages: z.array(z.string()).optional().nullable(),
  certifications: z.array(z.string()).optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable().or(z.literal("")),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    // Validate and normalize dates in education and experience
    if (data.education) {
      for (const edu of data.education) {
        if (edu.startDate && edu.endDate) {
          const start = new Date(edu.startDate)
          const end = new Date(edu.endDate)
          if (start > end) {
            return NextResponse.json(
              { error: "Education start date must be before or equal to end date" },
              { status: 400 }
            )
          }
        }
        // Ensure dates are in ISO format (YYYY-MM-DD)
        if (edu.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(edu.startDate)) {
          const date = new Date(edu.startDate)
          if (!isNaN(date.getTime())) {
            edu.startDate = date.toISOString().split('T')[0]
          }
        }
        if (edu.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(edu.endDate)) {
          const date = new Date(edu.endDate)
          if (!isNaN(date.getTime())) {
            edu.endDate = date.toISOString().split('T')[0]
          }
        }
      }
    }

    if (data.experience) {
      for (const exp of data.experience) {
        // If current is true, clear endDate
        if (exp.current) {
          exp.endDate = undefined
        }
        if (exp.startDate && exp.endDate && !exp.current) {
          const start = new Date(exp.startDate)
          const end = new Date(exp.endDate)
          if (start > end) {
            return NextResponse.json(
              { error: "Experience start date must be before or equal to end date" },
              { status: 400 }
            )
          }
          // End date cannot be in the future unless current is true
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (end > today) {
            return NextResponse.json(
              { error: "Experience end date cannot be in the future unless 'Present' is checked" },
              { status: 400 }
            )
          }
        }
        // Ensure dates are in ISO format (YYYY-MM-DD)
        if (exp.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(exp.startDate)) {
          const date = new Date(exp.startDate)
          if (!isNaN(date.getTime())) {
            exp.startDate = date.toISOString().split('T')[0]
          }
        }
        if (exp.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(exp.endDate)) {
          const date = new Date(exp.endDate)
          if (!isNaN(date.getTime())) {
            exp.endDate = date.toISOString().split('T')[0]
          }
        }
      }
    }

    // Prepare update data, converting empty strings to null
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.bio !== undefined) updateData.bio = data.bio || null
    if (data.location !== undefined) updateData.location = data.location || null
    if (data.currentTitle !== undefined) updateData.currentTitle = data.currentTitle || null
    if (data.website !== undefined) updateData.website = data.website || null
    if (data.linkedin !== undefined) updateData.linkedin = data.linkedin || null
    if (data.github !== undefined) updateData.github = data.github || null
    if (data.twitter !== undefined) updateData.twitter = data.twitter || null
    if (data.education !== undefined) updateData.education = data.education || null
    if (data.experience !== undefined) updateData.experience = data.experience || null
    if (data.skills !== undefined) updateData.skills = data.skills || []
    if (data.availability !== undefined) updateData.availability = data.availability || null
    if (data.salaryExpectation !== undefined) updateData.salaryExpectation = data.salaryExpectation || null
    if (data.preferredLocation !== undefined) updateData.preferredLocation = data.preferredLocation || null
    if (data.experienceLevel !== undefined) updateData.experienceLevel = data.experienceLevel || null
    if (data.yearsOfExperience !== undefined) updateData.yearsOfExperience = data.yearsOfExperience ?? null
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null
    if (data.gender !== undefined) updateData.gender = data.gender || null
    if (data.languages !== undefined) updateData.languages = data.languages || []
    if (data.certifications !== undefined) updateData.certifications = data.certifications || []
    if (data.portfolioUrl !== undefined) updateData.portfolioUrl = data.portfolioUrl || null

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        bio: true,
        location: true,
        currentTitle: true,
        website: true,
        linkedin: true,
        github: true,
        twitter: true,
        education: true,
        experience: true,
        skills: true,
        availability: true,
        salaryExpectation: true,
        preferredLocation: true,
        experienceLevel: true,
        yearsOfExperience: true,
        dateOfBirth: true,
        gender: true,
        languages: true,
        certifications: true,
        portfolioUrl: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

