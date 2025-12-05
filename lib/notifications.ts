import { prisma } from "./prisma"
import { sendEmail } from "./email"

export async function notifyCompanyOfNewApplication(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          company: {
            select: {
              name: true,
              owner: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: { name: true, email: true },
      },
      resume: {
        select: { fileName: true, fileUrl: true },
      },
    },
  })

  if (!application?.job.company.owner?.email) {
    return
  }

  const owner = application.job.company.owner
  const job = application.job
  const candidate = application.user

  await sendEmail({
    to: owner.email,
    subject: `New applicant for ${job.title}`,
    html: `
      <p>Hi ${owner.name || "there"},</p>
      <p>${candidate?.name || "A candidate"} just applied to <strong>${job.title}</strong>.</p>
      <p><strong>Candidate email:</strong> ${candidate?.email || "Not provided"}</p>
      <p>You can review the application in your dashboard.</p>
    `,
  })
}
