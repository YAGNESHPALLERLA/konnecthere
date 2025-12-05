import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the most recent resume with parsed data
    const resume = await prisma.resume.findFirst({
      where: {
        userId,
        parsedName: { not: null },
      },
      orderBy: { createdAt: "desc" },
    })

    if (!resume) {
      return NextResponse.json(
        { error: "No parsed resume found. Please upload a resume first." },
        { status: 404 }
      )
    }

    // Update user profile with parsed resume data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: resume.parsedName || undefined,
        // Note: email is unique and shouldn't be overwritten
        // image: could be added if we parse profile picture from resume
      },
    })

    // Return what was auto-filled
    return NextResponse.json({
      success: true,
      autoFilled: {
        name: resume.parsedName,
        title: resume.parsedTitle,
        skills: resume.parsedSkills,
        experience: resume.parsedExperience,
      },
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })
  } catch (error) {
    console.error("Error auto-filling profile:", error)
    return NextResponse.json(
      { error: "Failed to auto-fill profile" },
      { status: 500 }
    )
  }
}


