"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toaster"
import {
  ArrowLeft,
  Plus,
  Users,
  BookOpen,
  GraduationCap,
  Hash,
  User,
  Activity,
  UserPlus,
} from "lucide-react"

interface ClassData {
  id: string
  name: string
  code: string
  teacherId: string | null
  status: string
  teacher: { id: string; staffId: string; fullName: string } | null
  _count: { students: number }
}

interface StudentData {
  id: string
  admissionNumber: string
  firstName: string
  lastName: string
  gender: string
  status: string
  classId: string | null
  class: { id: string; name: string; code: string } | null
}

export default function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { toast } = useToast()
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [classesRes, studentsRes] = await Promise.all([
          fetch("/api/classes"),
          fetch(`/api/students?classId=${id}`),
        ])
        if (!classesRes.ok || !studentsRes.ok) {
          throw new Error("Failed to fetch class data")
        }
        const classesData: ClassData[] = await classesRes.json()
        const found = classesData.find((c) => c.id === id)
        if (!found) throw new Error("Class not found")
        setClassData(found)
        const studentsData: StudentData[] = await studentsRes.json()
        setStudents(studentsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <PageLoading />

  if (error || !classData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <BookOpen className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium">{error || "Class not found"}</p>
        <Button variant="outline" asChild>
          <Link href="/classes">Back to Classes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={classData.name}
        description={`Code: ${classData.code} — Manage students and class information`}
      >
        <Button variant="outline" asChild>
          <Link href="/classes">Back to Classes</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Hash className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Class Code
              </CardTitle>
              <p className="text-2xl font-bold">{classData.code}</p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Class Teacher
              </CardTitle>
              <p className="text-lg font-semibold">
                {classData.teacher?.fullName || "Not assigned"}
              </p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enrolled Students
              </CardTitle>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
              <Badge
                variant={classData.status === "Active" ? "default" : "secondary"}
                className="mt-1"
              >
                {classData.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Enrolled Students
          </CardTitle>
          <Button asChild>
            <Link href={`/students/new?classId=${id}`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 bg-muted rounded-full mb-3">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No students enrolled in this class yet.
              </p>
              <Button asChild>
                <Link href={`/students/new?classId=${id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Student
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Admission No.
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Full Name
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Gender
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-3 text-sm font-medium">
                        {student.admissionNumber}
                      </td>
                      <td className="p-3 text-sm">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="p-3 text-sm capitalize">{student.gender}</td>
                      <td className="p-3">
                        <Badge
                          variant={student.status === "Active" ? "default" : "secondary"}
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/students/${student.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
