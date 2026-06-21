"use client"

import { useState, useEffect, useCallback } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ClipboardCheck,
  Plus,
  Pencil,
  Scale,
  Clock,
  HeartHandshake,
  Hand,
  Users,
  Sparkles,
} from "lucide-react"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { FormField } from "@/components/shared/form-field"
import { StatCard } from "@/components/shared/stat-card"
import { PageLoading } from "@/components/shared/loading"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { characterAssessmentSchema } from "@/schemas"
import { useToast } from "@/components/ui/toaster"

type Rating = "Excellent" | "Very Good" | "Good" | "Fair" | "Poor"

type Assessment = {
  id: string
  studentId: string
  discipline: Rating
  punctuality: Rating
  respect: Rating
  akhlaq: Rating
  leadership: Rating
  cleanliness: Rating
  teacherRemarks: string | null
  assessedById: string | null
  updatedAt: string
  student: {
    id: string
    firstName: string
    lastName: string
    admissionNumber: string
  }
}

type Student = {
  id: string
  firstName: string
  lastName: string
  admissionNumber: string
}

const ratingValues: Record<Rating, number> = {
  Excellent: 5,
  "Very Good": 4,
  Good: 3,
  Fair: 2,
  Poor: 1,
}

const ratingColors: Record<Rating, string> = {
  Excellent: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  "Very Good": "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
  Good: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
  Fair: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
  Poor: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700",
}

const areaLabels = [
  { key: "discipline" as const, label: "Discipline", icon: Scale },
  { key: "punctuality" as const, label: "Punctuality", icon: Clock },
  { key: "respect" as const, label: "Respect", icon: HeartHandshake },
  { key: "akhlaq" as const, label: "Akhlaq", icon: Hand },
  { key: "leadership" as const, label: "Leadership", icon: Users },
  { key: "cleanliness" as const, label: "Cleanliness", icon: Sparkles },
]

const ratings: Rating[] = ["Excellent", "Very Good", "Good", "Fair", "Poor"]

const formSchema = characterAssessmentSchema

type FormData = z.infer<typeof formSchema>

function RatingBadge({ value }: { value: Rating }) {
  return (
    <Badge variant="outline" className={cn("font-medium", ratingColors[value])}>
      {value}
    </Badge>
  )
}

function RateSelect({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {ratings.map((r) => (
            <SelectItem key={r} value={r}>
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      discipline: "Good",
      punctuality: "Good",
      respect: "Good",
      akhlaq: "Good",
      leadership: "Good",
      cleanliness: "Good",
      teacherRemarks: "",
    },
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [assessmentsRes, studentsRes] = await Promise.all([
        fetch("/api/assessments"),
        fetch("/api/students"),
      ])
      if (!assessmentsRes.ok) throw new Error("Failed to fetch assessments")
      if (!studentsRes.ok) throw new Error("Failed to fetch students")
      const [assessmentsData, studentsData] = await Promise.all([
        assessmentsRes.json(),
        studentsRes.json(),
      ])
      setAssessments(assessmentsData)
      setStudents(studentsData)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function openAddDialog() {
    setEditingAssessment(null)
    form.reset({
      studentId: "",
      discipline: "Good",
      punctuality: "Good",
      respect: "Good",
      akhlaq: "Good",
      leadership: "Good",
      cleanliness: "Good",
      teacherRemarks: "",
    })
    setDialogOpen(true)
  }

  function openEditDialog(assessment: Assessment) {
    setEditingAssessment(assessment)
    form.reset({
      studentId: assessment.studentId,
      discipline: assessment.discipline,
      punctuality: assessment.punctuality,
      respect: assessment.respect,
      akhlaq: assessment.akhlaq,
      leadership: assessment.leadership,
      cleanliness: assessment.cleanliness,
      teacherRemarks: assessment.teacherRemarks || "",
    })
    setDialogOpen(true)
  }

  async function onSubmit(data: FormData) {
    try {
      setSubmitting(true)

      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save assessment")
      }

      toast({
        title: "Success",
        description: editingAssessment
          ? "Assessment updated successfully"
          : "Assessment created successfully",
      })

      setDialogOpen(false)
      fetchData()
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  function calcAverageRating(area: keyof Pick<Assessment, "discipline" | "punctuality" | "respect" | "akhlaq" | "leadership" | "cleanliness">): number {
    if (assessments.length === 0) return 0
    const total = assessments.reduce((sum, a) => sum + ratingValues[a[area]], 0)
    return Math.round((total / assessments.length) * 10) / 10
  }

  const averageRatings = areaLabels.map(({ key, label, icon }) => ({
    key,
    label,
    icon,
    value: calcAverageRating(key),
  }))

  const columns: ColumnDef<Assessment>[] = [
    {
      accessorKey: "student",
      header: "Student Name",
      cell: ({ row }) => {
        const s = row.original.student
        return (
          <div>
            <p className="font-medium">{s.firstName} {s.lastName}</p>
            <p className="text-xs text-muted-foreground">{s.admissionNumber}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "class",
      header: "Class",
      cell: ({ row }) => {
        return <span className="text-sm">{/* Class info would need to be joined */}</span>
      },
    },
    ...areaLabels.map(({ key, label }) => ({
      accessorKey: key,
      header: label,
      cell: ({ row }: { row: { original: Assessment } }) => (
        <RatingBadge value={row.original[key]} />
      ),
    })),
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openEditDialog(row.original)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Character Assessments"
        description="Evaluate and track students' character development"
      >
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          New Assessment
        </Button>
      </PageHeader>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {averageRatings.map(({ label, icon: Icon, value }) => (
          <StatCard
            key={label}
            title={label}
            value={value.toFixed(1)}
            icon={Icon}
            description={`Avg rating / 5`}
          />
        ))}
      </div>

      {assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No Assessments Yet"
          description="Start evaluating students by creating the first character assessment."
          actionLabel="New Assessment"
          actionHref="#"
        />
      ) : (
        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={assessments}
              searchKey="student"
              searchPlaceholder="Search by student name..."
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAssessment ? "Edit Character Assessment" : "New Character Assessment"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Student" required error={form.formState.errors.studentId?.message}>
              <Select
                value={form.watch("studentId")}
                onValueChange={(v) => form.setValue("studentId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              {areaLabels.map(({ key, label, icon: Icon }) => (
                <FormField key={key} label={label}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <RateSelect
                      value={form.watch(key)}
                      onChange={(v) => form.setValue(key, v as Rating)}
                      error={form.formState.errors[key]?.message}
                    />
                  </div>
                </FormField>
              ))}
            </div>

            <FormField label="Teacher Remarks" error={form.formState.errors.teacherRemarks?.message}>
              <Textarea
                {...form.register("teacherRemarks")}
                rows={3}
                placeholder="Additional comments about the student's character..."
              />
            </FormField>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingAssessment ? "Update Assessment" : "Save Assessment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
