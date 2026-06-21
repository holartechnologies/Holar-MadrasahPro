"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  code: z.string().min(1, "Class code is required"),
  teacherId: z.string().optional(),
  status: z.string().min(1, "Status is required"),
})

type FormInput = z.infer<typeof formSchema>
import { PageHeader } from "@/components/shared/page-header"
import { FormField } from "@/components/shared/form-field"
import { PageLoading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/toaster"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

function generateCode(name: string): string {
  const parts = name.split(" ")
  if (parts.length < 2) return name.substring(0, 4).toUpperCase()
  const prefix = parts[0].substring(0, 3).toUpperCase()
  return `${prefix}${parts[parts.length - 1]}`
}

interface TeacherOption {
  id: string
  staffId: string
  fullName: string
}

export default function NewClassPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      teacherId: "",
      status: "Active",
    },
  })

  const selectedName = watch("name")
  const generatedCode = useMemo(() => {
    if (!selectedName) return ""
    return generateCode(selectedName)
  }, [selectedName])

  useEffect(() => {
    if (generatedCode) {
      setValue("code", generatedCode)
    }
  }, [generatedCode, setValue])

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await fetch("/api/teachers")
        if (!res.ok) throw new Error("Failed to load teachers")
        const data = await res.json()
        setTeachers(data)
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load teachers",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchTeachers()
  }, [toast])

  async function onSubmit(data: FormInput) {
    try {
      setSubmitting(true)
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to create class")
      }
      toast({ title: "Success", description: "Class created successfully" })
      router.push("/classes")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create class",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <PageHeader title="Add Class" description="Create a new class or grade level">
        <Button variant="outline" asChild>
          <Link href="/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Class Name" error={errors.name?.message} required>
                <Input
                  value={selectedName}
                  onChange={(e) => setValue("name", e.target.value)}
                  placeholder="e.g. Tahfiz 1, Ibtidaiyyah 2"
                />
              </FormField>

              <FormField label="Class Code" error={errors.code?.message} required>
                <Input
                  value={watch("code")}
                  onChange={(e) => setValue("code", e.target.value)}
                  placeholder="Auto-generated"
                />
              </FormField>

              <FormField label="Class Teacher" error={errors.teacherId?.message}>
                <Select
                  value={watch("teacherId") || ""}
                  onValueChange={(value) => setValue("teacherId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName} ({teacher.staffId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Status" error={errors.status?.message} required>
                <Select
                  value={watch("status") || "Active"}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Class
              </Button>
              <Button variant="outline" asChild>
                <Link href="/classes">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
