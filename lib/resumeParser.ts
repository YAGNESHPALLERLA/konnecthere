export type ParsedResume = {
  name?: string | null
  email?: string | null
  phone?: string | null
  title?: string | null
  skills?: string[]
  experienceYears?: number | null
  rawText?: string
}

export async function parseResumeFromService(fileUrl: string): Promise<ParsedResume | null> {
  const parserUrl = process.env.RESUME_PARSER_URL
  if (!parserUrl) return null

  const response = await fetch(`${parserUrl.replace(/\/$/, "")}/parse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file_url: fileUrl }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Resume parser error: ${response.status}`)
  }

  const data = (await response.json()) as ParsedResume
  return data
}
