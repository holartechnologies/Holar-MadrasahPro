"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/toaster"
import { formatDate } from "@/lib/utils"
import {
  ArrowLeft,
  Pencil,
  Printer,
  User,
  BadgeIcon,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  BookOpen,
  Users,
} from "lucide-react"

interface SubjectTeacher {
  id: string
  subjectId: string
  subject: {
    id: string
    name: string
    code: string
  }
}

interface Teacher {
  id: string
  staffId: string
  fullName: string
  phoneNumber: string
  email: string | null
  qualification: string | null
  dateEmployed: string
  classes: { id: string; name: string; code: string }[]
  subjects: SubjectTeacher[]
}

export default function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { toast } = useToast()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeacher() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/teachers/${id}`)
        if (!res.ok) throw new Error("Failed to fetch teacher")
        const data = await res.json()
        setTeacher(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchTeacher()
  }, [id])

  if (loading) return <PageLoading />

  if (error || !teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <User className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium">{error || "Teacher not found"}</p>
        <Button variant="outline" asChild>
          <Link href="/teachers">Back to Teachers</Link>
        </Button>
      </div>
    )
  }

  const detailItems = [
    { icon: BadgeIcon, label: "Staff ID", value: teacher.staffId },
    { icon: Phone, label: "Phone Number", value: teacher.phoneNumber },
    { icon: Mail, label: "Email", value: teacher.email || "—" },
    { icon: GraduationCap, label: "Qualification", value: teacher.qualification || "—" },
    { icon: Calendar, label: "Date Employed", value: formatDate(teacher.dateEmployed) },
    {
      icon: Users,
      label: "Assigned Class",
      value: teacher.classes && teacher.classes.length > 0
        ? teacher.classes.map((c) => `${c.name} (${c.code})`).join(", ")
        : "—",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Teacher Profile" description={`Details for ${teacher.fullName}`}>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button asChild>
          <Link href={`/teachers/${teacher.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <User className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-xl">{teacher.fullName}</CardTitle>
            <p className="text-sm text-muted-foreground">{teacher.staffId}</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {teacher.subjects.map((s) => (
                <Badge key={s.id} variant="secondary">
                  {s.subject.name}
                </Badge>
              ))}
              {teacher.subjects.length === 0 && (
                <span className="text-sm text-muted-foreground">No subjects assigned</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailItems.map((item) => (
              <div key={item.label}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium mt-0.5">{item.value}</p>
                  </div>
                </div>
                <Separator className="mt-3" />
              </div>
            ))}

            <div className="pt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subjects Taught
              </p>
              {teacher.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((s) => (
                    <Badge key={s.id}>{s.subject.name}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subjects assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
