"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { PageHeader } from "@/components/shared/page-header"
import { FormField } from "@/components/shared/form-field"
import { PageLoading } from "@/components/shared/loading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toaster"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  description: z.string().optional(),
  classIds: z.array(z.string()),
  teacherIds: z.array(z.string()),
})

type FormInput = z.infer<typeof formSchema>

interface ClassOption {
  id: string
  name: string
  code: string
}

interface TeacherOption {
  id: string
  staffId: string
  fullName: string
}

export default function NewSubjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
      classIds: [],
      teacherIds: [],
    },
  })

  const selectedClassIds = watch("classIds")
  const selectedTeacherIds = watch("teacherIds")

  useEffect(() => {
    async function fetchData() {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/teachers"),
        ])
        if (!classesRes.ok || !teachersRes.ok) throw new Error("Failed to load form data")
        const classesData = await classesRes.json()
        const teachersData = await teachersRes.json()
        setClasses(classesData)
        setTeachers(teachersData)
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load form data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  function toggleArray(
    value: string[],
    item: string,
    setter: (val: string[]) => void
  ) {
    if (value.includes(item)) {
      setter(value.filter((v) => v !== item))
    } else {
      setter([...value, item])
    }
  }

  async function onSubmit(data: FormInput) {
    try {
      setSubmitting(true)
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to create subject")
      }
      toast({ title: "Success", description: "Subject created successfully" })
      router.push("/subjects")
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create subject",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <PageHeader title="Add Subject" description="Add a new subject to the curriculum">
        <Button variant="outline" asChild>
          <Link href="/subjects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Subject Name" error={errors.name?.message} required>
                <Input {...register("name")} placeholder="e.g. Quran Memorization" />
              </FormField>

              <FormField label="Subject Code" error={errors.code?.message} required>
                <Input {...register("code")} placeholder="e.g. QRN-101" />
              </FormField>
            </div>

            <FormField label="Description" error={errors.description?.message}>
              <Textarea
                {...register("description")}
                placeholder="Brief description of the subject"
                rows={3}
              />
            </FormField>

            <FormField label="Assigned Classes">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
                {classes.map((cls) => {
                  const isSelected = (selectedClassIds || []).includes(cls.id)
                  return (
                    <Button
                      key={cls.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        toggleArray(selectedClassIds || [], cls.id, (val) =>
                          setValue("classIds", val)
                        )
                      }
                      className="justify-start"
                    >
                      {cls.name}
                    </Button>
                  )
                })}
              </div>
            </FormField>

            <FormField label="Assigned Teachers">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
                {teachers.map((teacher) => {
                  const isSelected = (selectedTeacherIds || []).includes(teacher.id)
                  return (
                    <Button
                      key={teacher.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        toggleArray(selectedTeacherIds || [], teacher.id, (val) =>
                          setValue("teacherIds", val)
                        )
                      }
                      className="justify-start"
                    >
                      {teacher.fullName}
                    </Button>
                  )
                })}
              </div>
            </FormField>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Subject
              </Button>
              <Button variant="outline" asChild>
                <Link href="/subjects">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
