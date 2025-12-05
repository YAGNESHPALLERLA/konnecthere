import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create ADMIN user
  const adminEmail = "admin@konnecthere.com"
  const adminPassword = "admin123" // Change this in production!
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
      password: hashedAdminPassword,
    },
    create: {
      email: adminEmail,
      name: "Admin User",
      password: hashedAdminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Created/updated ADMIN user: ${admin.email}`)

  // Create HR user
  const hrEmail = "hr@konnecthere.com"
  const hrPassword = "hr123" // Change this in production!
  const hashedHrPassword = await bcrypt.hash(hrPassword, 10)

  const hr = await prisma.user.upsert({
    where: { email: hrEmail },
    update: {
      role: "HR",
      status: "ACTIVE",
      password: hashedHrPassword,
    },
    create: {
      email: hrEmail,
      name: "HR User",
      password: hashedHrPassword,
      role: "HR",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Created/updated HR user: ${hr.email}`)

  // Create a sample company for HR to manage
  const company = await prisma.company.upsert({
    where: { slug: "sample-company" },
    update: {
      hrId: hr.id,
    },
    create: {
      name: "Sample Company",
      slug: "sample-company",
      description: "A sample company for HR testing",
      ownerId: hr.id, // HR owns the company
      hrId: hr.id, // HR also manages it
      verified: true,
    },
  })

  console.log(`✅ Created/updated company: ${company.name}`)

  // Create a sample USER for testing
  const userEmail = "user@konnecthere.com"
  const userPassword = "user123" // Change this in production!
  const hashedUserPassword = await bcrypt.hash(userPassword, 10)

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      role: "USER",
      status: "ACTIVE",
      password: hashedUserPassword,
    },
    create: {
      email: userEmail,
      name: "Test User",
      password: hashedUserPassword,
      role: "USER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Created/updated USER: ${user.email}`)

  console.log("\n📋 Seed Summary:")
  console.log(`   ADMIN: ${adminEmail} / ${adminPassword}`)
  console.log(`   HR: ${hrEmail} / ${hrPassword}`)
  console.log(`   USER: ${userEmail} / ${userPassword}`)
  console.log("\n⚠️  Remember to change these passwords in production!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




