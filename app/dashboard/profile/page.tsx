"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import Link from "next/link"

type EducationEntry = {
  school: string
  degree?: string
  field?: string
  startDate?: string // ISO date string (YYYY-MM-DD)
  endDate?: string // ISO date string (YYYY-MM-DD)
  description?: string
}

type ExperienceEntry = {
  company: string
  title: string
  startDate?: string // ISO date string (YYYY-MM-DD)
  endDate?: string // ISO date string (YYYY-MM-DD)
  current?: boolean
  description?: string
}

type UserProfile = {
  id: string
  name: string | null
  email: string
  phone: string | null
  bio: string | null
  location: string | null
  currentTitle: string | null
  website: string | null
  linkedin: string | null
  github: string | null
  twitter: string | null
  education: EducationEntry[] | null
  experience: ExperienceEntry[] | null
  skills: string[]
  availability: string | null
  salaryExpectation: string | null
  preferredLocation: string | null
  experienceLevel: string | null
  yearsOfExperience: number | null
  dateOfBirth: string | null
  gender: string | null
  languages: string[]
  certifications: string[]
  portfolioUrl: string | null
  image: string | null
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"basic" | "education" | "experience" | "skills" | "preferences">("basic")
  const [dateErrors, setDateErrors] = useState<{ [key: string]: string }>({})

  // Form state
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [currentTitle, setCurrentTitle] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [github, setGithub] = useState("")
  const [twitter, setTwitter] = useState("")
  const [education, setEducation] = useState<EducationEntry[]>([])
  const [experience, setExperience] = useState<ExperienceEntry[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [availability, setAvailability] = useState("")
  const [salaryExpectation, setSalaryExpectation] = useState("")
  const [preferredLocation, setPreferredLocation] = useState("")
  const [experienceLevel, setExperienceLevel] = useState<"FRESHER" | "EXPERIENCED" | "">("")
  const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY" | "">("")
  const [languages, setLanguages] = useState<string[]>([])
  const [languageInput, setLanguageInput] = useState("")
  const [certifications, setCertifications] = useState<string[]>([])
  const [certificationInput, setCertificationInput] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")

  // Helper function to convert various date formats to YYYY-MM-DD for date inputs
  const convertToDateInput = (dateStr: string): string => {
    if (!dateStr) return ""
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
    // Try to parse as ISO date
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]
    }
    // If it's just a year (e.g., "2018"), use January 1st
    if (/^\d{4}$/.test(dateStr)) {
      return `${dateStr}-01-01`
    }
    // If it's "MMM YYYY" format (e.g., "Jan 2020"), try to parse
    const monthYearMatch = dateStr.match(/(\w+)\s+(\d{4})/)
    if (monthYearMatch) {
      const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
      const month = monthNames.indexOf(monthYearMatch[1].toLowerCase().substring(0, 3))
      if (month !== -1) {
        return `${monthYearMatch[2]}-${String(month + 1).padStart(2, '0')}-01`
      }
    }
    return ""
  }

  // Helper function to convert date input (YYYY-MM-DD) to ISO string for storage
  const convertToISOString = (dateStr: string): string | undefined => {
    if (!dateStr) return undefined
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return undefined
    return date.toISOString().split('T')[0] // Return YYYY-MM-DD format
  }

  // Validate dates
  const validateDates = (type: "education" | "experience", index: number, startDate?: string, endDate?: string, current?: boolean): string | null => {
    const key = `${type}-${index}`
    if (!startDate && !endDate) return null // Both optional

    if (startDate && endDate && !current) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start > end) {
        return "Start date must be before or equal to end date"
      }
    }

    if (endDate && !current && type === "experience") {
      const end = new Date(endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (end > today) {
        return "End date cannot be in the future unless 'Present' is checked"
      }
    }

    return null
  }

  useEffect(() => {
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    if (!session?.user) return

    try {
      const res = await fetch("/api/profile")
      if (!res.ok) throw new Error("Failed to fetch profile")
      const data = await res.json()
      const user = data.user as UserProfile
      setProfile(user)

      // Populate form fields
      setName(user.name || "")
      setPhone(user.phone || "")
      setBio(user.bio || "")
      setLocation(user.location || "")
      setCurrentTitle(user.currentTitle || "")
      setWebsite(user.website || "")
      setLinkedin(user.linkedin || "")
      setGithub(user.github || "")
      setTwitter(user.twitter || "")
      // Convert education dates to ISO format (YYYY-MM-DD) for date inputs
      const educationData = ((user.education as EducationEntry[]) || []).map((edu) => ({
        ...edu,
        startDate: edu.startDate ? convertToDateInput(edu.startDate) : "",
        endDate: edu.endDate ? convertToDateInput(edu.endDate) : "",
      }))
      setEducation(educationData)

      // Convert experience dates to ISO format (YYYY-MM-DD) for date inputs
      const experienceData = ((user.experience as ExperienceEntry[]) || []).map((exp) => ({
        ...exp,
        startDate: exp.startDate ? convertToDateInput(exp.startDate) : "",
        endDate: exp.endDate && !exp.current ? convertToDateInput(exp.endDate) : "",
      }))
      setExperience(experienceData)
      setSkills(user.skills || [])
      setAvailability(user.availability || "")
      setSalaryExpectation(user.salaryExpectation || "")
      setPreferredLocation(user.preferredLocation || "")
      setExperienceLevel((user.experienceLevel as "FRESHER" | "EXPERIENCED") || "")
      setYearsOfExperience(user.yearsOfExperience ?? "")
      setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "")
      setGender((user.gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY") || "")
      setLanguages(user.languages || [])
      setCertifications(user.certifications || [])
      setPortfolioUrl(user.portfolioUrl || "")
    } catch (error) {
      console.error("Error fetching profile:", error)
      setMessage({ type: "error", text: "Failed to load profile" })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setDateErrors({})

    // Validate all dates
    const errors: { [key: string]: string } = {}
    education.forEach((edu, index) => {
      const error = validateDates("education", index, edu.startDate, edu.endDate)
      if (error) errors[`education-${index}`] = error
    })
    experience.forEach((exp, index) => {
      const error = validateDates("experience", index, exp.startDate, exp.endDate, exp.current)
      if (error) errors[`experience-${index}`] = error
    })

    if (Object.keys(errors).length > 0) {
      setDateErrors(errors)
      setMessage({ type: "error", text: "Please fix date validation errors before saving." })
      setSaving(false)
      return
    }

    try {
      // Convert date inputs to ISO strings for storage
      const educationData = education.map((edu) => ({
        ...edu,
        startDate: convertToISOString(edu.startDate || ""),
        endDate: convertToISOString(edu.endDate || ""),
      }))

      const experienceData = experience.map((exp) => ({
        ...exp,
        startDate: convertToISOString(exp.startDate || ""),
        endDate: exp.current ? undefined : convertToISOString(exp.endDate || ""),
      }))

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone || null,
          bio: bio || null,
          location: location || null,
          currentTitle: currentTitle || null,
          website: website || null,
          linkedin: linkedin || null,
          github: github || null,
          twitter: twitter || null,
          education: educationData.length > 0 ? educationData : null,
          experience: experienceData.length > 0 ? experienceData : null,
          skills: skills.length > 0 ? skills : null,
          availability: availability || null,
          salaryExpectation: salaryExpectation || null,
          preferredLocation: preferredLocation || null,
          experienceLevel: experienceLevel || null,
          yearsOfExperience: yearsOfExperience === "" ? null : Number(yearsOfExperience),
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          languages: languages.length > 0 ? languages : null,
          certifications: certifications.length > 0 ? certifications : null,
          portfolioUrl: portfolioUrl || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update profile")
      }

      setMessage({ type: "success", text: "Profile updated successfully!" })
      await update()
      await fetchProfile()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" })
    } finally {
      setSaving(false)
    }
  }

  const addEducation = () => {
    setEducation([...education, { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" }])
  }

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index))
  }

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...education]
    updated[index] = { ...updated[index], [field]: value }
    setEducation(updated)
    // Clear error for this entry
    const errorKey = `education-${index}`
    if (dateErrors[errorKey]) {
      const newErrors = { ...dateErrors }
      delete newErrors[errorKey]
      setDateErrors(newErrors)
    }
  }

  const addExperience = () => {
    setExperience([...experience, { company: "", title: "", startDate: "", endDate: "", current: false, description: "" }])
  }

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index))
  }

  const updateExperience = (index: number, field: keyof ExperienceEntry, value: string | boolean) => {
    const updated = [...experience]
    updated[index] = { ...updated[index], [field]: value }
    // If "current" is checked, clear endDate
    if (field === "current" && value === true) {
      updated[index].endDate = ""
    }
    setExperience(updated)
    // Clear error for this entry
    const errorKey = `experience-${index}`
    if (dateErrors[errorKey]) {
      const newErrors = { ...dateErrors }
      delete newErrors[errorKey]
      setDateErrors(newErrors)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const addLanguage = () => {
    if (languageInput.trim() && !languages.includes(languageInput.trim())) {
      setLanguages([...languages, languageInput.trim()])
      setLanguageInput("")
    }
  }

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang))
  }

  const addCertification = () => {
    if (certificationInput.trim() && !certifications.includes(certificationInput.trim())) {
      setCertifications([...certifications, certificationInput.trim()])
      setCertificationInput("")
    }
  }

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter((c) => c !== cert))
  }

  if (!session) {
    return (
      <PageShell title="Profile">
        <p>Please sign in to view your profile.</p>
        <Link href="/auth/signin">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </PageShell>
    )
  }

  if (loading) {
    return (
      <PageShell title="Profile">
        <p>Loading profile...</p>
      </PageShell>
    )
  }

  return (
    <PageShell title="Edit Profile" description="Update your profile information">
      <div className="max-w-4xl space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {(["basic", "education", "experience", "skills", "preferences"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          {activeTab === "basic" && (
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="currentTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Job Title
                </label>
                <Input
                  id="currentTitle"
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => {
                      const val = e.target.value as "FRESHER" | "EXPERIENCED" | ""
                      setExperienceLevel(val)
                      if (val === "FRESHER") {
                        setYearsOfExperience(0)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  >
                    <option value="">Select experience level</option>
                    <option value="FRESHER">Fresher</option>
                    <option value="EXPERIENCED">Experienced</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    max="50"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g., 5"
                    disabled={experienceLevel === "FRESHER"}
                  />
                  {experienceLevel === "FRESHER" && (
                    <p className="mt-1 text-xs text-gray-500">Automatically set to 0 for freshers</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Prefer not to say</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio / About Me
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio URL
                  </label>
                  <Input
                    id="portfolioUrl"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <Input
                    id="github"
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/yourusername"
                  />
                </div>
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter / X
                  </label>
                  <Input
                    id="twitter"
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Education */}
          {activeTab === "education" && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button type="button" variant="outline" onClick={addEducation}>
                  + Add Education
                </Button>
              </div>

              {education.map((edu, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Education Entry {index + 1}</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="School/University *"
                      value={edu.school}
                      onChange={(e) => updateEducation(index, "school", e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Degree (e.g., Bachelor's, Master's)"
                      value={edu.degree || ""}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                    />
                    <Input
                      placeholder="Field of Study"
                      value={edu.field || ""}
                      onChange={(e) => updateEducation(index, "field", e.target.value)}
                    />
                    <div>
                      <label htmlFor={`edu-start-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <Input
                        id={`edu-start-${index}`}
                        type="date"
                        value={edu.startDate || ""}
                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                        className={dateErrors[`education-${index}`] ? "border-red-500" : ""}
                      />
                    </div>
                    <div>
                      <label htmlFor={`edu-end-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <Input
                        id={`edu-end-${index}`}
                        type="date"
                        value={edu.endDate || ""}
                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                        className={dateErrors[`education-${index}`] ? "border-red-500" : ""}
                      />
                    </div>
                  </div>
                  {dateErrors[`education-${index}`] && (
                    <p className="text-sm text-red-600">{dateErrors[`education-${index}`]}</p>
                  )}
                  <textarea
                    placeholder="Description (optional)"
                    value={edu.description || ""}
                    onChange={(e) => updateEducation(index, "description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              ))}

              {education.length === 0 && (
                <p className="text-gray-500 text-center py-8">No education entries. Click "Add Education" to get started.</p>
              )}
            </Card>
          )}

          {/* Experience */}
          {activeTab === "experience" && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button type="button" variant="outline" onClick={addExperience}>
                  + Add Experience
                </Button>
              </div>

              {experience.map((exp, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Experience Entry {index + 1}</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Company *"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Job Title *"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, "title", e.target.value)}
                      required
                    />
                    <div>
                      <label htmlFor={`exp-start-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <Input
                        id={`exp-start-${index}`}
                        type="date"
                        value={exp.startDate || ""}
                        onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                        className={dateErrors[`experience-${index}`] ? "border-red-500" : ""}
                      />
                    </div>
                    <div>
                      <label htmlFor={`exp-end-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <Input
                        id={`exp-end-${index}`}
                        type="date"
                        value={exp.endDate || ""}
                        onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                        disabled={exp.current}
                        className={dateErrors[`experience-${index}`] ? "border-red-500" : ""}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`current-${index}`}
                      checked={exp.current || false}
                      onChange={(e) => updateExperience(index, "current", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`current-${index}`} className="text-sm text-gray-700">
                      Present (I currently work here)
                    </label>
                  </div>
                  {dateErrors[`experience-${index}`] && (
                    <p className="text-sm text-red-600">{dateErrors[`experience-${index}`]}</p>
                  )}
                  <textarea
                    placeholder="Description of your role and achievements"
                    value={exp.description || ""}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              ))}

              {experience.length === 0 && (
                <p className="text-gray-500 text-center py-8">No experience entries. Click "Add Experience" to get started.</p>
              )}
            </Card>
          )}

          {/* Skills */}
          {activeTab === "skills" && (
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Skills</h3>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g., JavaScript, Python, React)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <Button type="button" onClick={addSkill}>
                  Add
                </Button>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {skills.length === 0 && (
                <p className="text-gray-500 text-center py-8">No skills added yet. Add your skills above.</p>
              )}
            </Card>
          )}

          {/* Preferences */}
          {activeTab === "preferences" && (
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Job Preferences</h3>
              
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <Input
                  id="availability"
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g., Available immediately, 2 weeks notice, etc."
                />
              </div>

              <div>
                <label htmlFor="preferredLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Location
                </label>
                <Input
                  id="preferredLocation"
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g., Remote, San Francisco, CA, etc."
                />
              </div>

              <div>
                <label htmlFor="salaryExpectation" className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Expectation
                </label>
                <Input
                  id="salaryExpectation"
                  type="text"
                  value={salaryExpectation}
                  onChange={(e) => setSalaryExpectation(e.target.value)}
                  placeholder="e.g., $80,000 - $100,000, Negotiable, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a language (e.g., English, Spanish, Hindi)"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addLanguage()
                      }
                    }}
                  />
                  <Button type="button" onClick={addLanguage}>
                    Add
                  </Button>
                </div>
                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a certification (e.g., AWS Certified, PMP, etc.)"
                    value={certificationInput}
                    onChange={(e) => setCertificationInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCertification()
                      }
                    }}
                  />
                  <Button type="button" onClick={addCertification}>
                    Add
                  </Button>
                </div>
                {certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {certifications.map((cert) => (
                      <span
                        key={cert}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertification(cert)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </PageShell>
  )
}
