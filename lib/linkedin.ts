import { prisma } from "./prisma"

const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"

async function refreshLinkedInToken(account: any) {
  if (!account.refresh_token) {
    return null
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: account.refresh_token,
    client_id: process.env.LINKEDIN_CLIENT_ID || "",
    client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
  })

  const response = await fetch(LINKEDIN_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to refresh LinkedIn token: ${errorBody}`)
  }

  const data = await response.json() as {
    access_token: string
    expires_in: number
  }

  const expiresAt = Math.floor(Date.now() / 1000) + data.expires_in

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      expires_at: expiresAt,
    },
  })

  return updated
}

export async function getLinkedInAccess(userId: string) {
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    return null
  }

  let account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "linkedin",
    },
  })

  if (!account || !account.access_token) {
    return null
  }

  const isExpired = account.expires_at && Date.now() / 1000 > account.expires_at - 60

  if (isExpired) {
    try {
      account = await refreshLinkedInToken(account)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  return {
    accessToken: account?.access_token,
    authorUrn: `urn:li:person:${account?.providerAccountId}`,
  }
}
