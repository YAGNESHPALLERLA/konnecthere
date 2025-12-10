import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    await requireAdmin()
    const { type } = await params

    let csv = ""
    let filename = ""

    switch (type) {
      case "users": {
        const users = await prisma.user.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            location: true,
            createdAt: true,
          },
        })

        csv = [
          ["ID", "Name", "Email", "Role", "Status", "Location", "Created At"].join(","),
          ...users.map((u) =>
            [
              u.id,
              u.name || "",
              u.email,
              u.role,
              u.status,
              u.location || "",
              u.createdAt.toISOString(),
            ].join(",")
          ),
        ].join("\n")
        filename = "users"
        break
      }

      case "jobs": {
        const jobs = await prisma.job.findMany({
          where: { deletedAt: null },
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        })

        csv = [
          ["ID", "Title", "Company", "Status", "Location", "Created At"].join(","),
          ...jobs.map((j) =>
            [
              j.id,
              j.title,
              j.company.name,
              j.status,
              j.location || "",
              j.createdAt.toISOString(),
            ].join(",")
          ),
        ].join("\n")
        filename = "jobs"
        break
      }

      case "applications": {
        const applications = await prisma.application.findMany({
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            job: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        })

        csv = [
          ["ID", "Candidate", "Email", "Job", "Company", "Status", "Applied At"].join(","),
          ...applications.map((a) =>
            [
              a.id,
              a.user.name || "",
              a.user.email,
              a.job.title,
              a.job.company.name,
              a.status,
              a.createdAt.toISOString(),
            ].join(",")
          ),
        ].join("\n")
        filename = "applications"
        break
      }

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Error exporting data:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

