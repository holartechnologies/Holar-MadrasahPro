"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studentSchema, StudentInput } from "@/schemas"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormField } from "@/components/shared/form-field"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoading } from "@/components/shared/loading"
import { useToast } from "@/components/ui/toaster"
import { formatDate } from "@/lib/utils"

interface ClassOption {
  id: string
  name: string
  code: string
}

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loadingStudent, setLoadingStudent] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
  })

  const gender = watch("gender")
  const status = watch("status")
  const classId = watch("classId")

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentRes, classesRes] = await Promise.all([
          fetch(`/api/students/${params.id}`),
          fetch("/api/classes"),
        ])

        if (!studentRes.ok) {
          const err = await studentRes.json()
          throw new Error(err.error || "Failed to fetch student")
        }

        const student = await studentRes.json()
        if (classesRes.ok) {
          const json = await classesRes.json()
          setClasses(json)
        }

        reset({
          admissionNumber: student.admissionNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          otherName: student.otherName || "",
          gender: student.gender,
          dateOfBirth: student.dateOfBirth
            ? new Date(student.dateOfBirth).toISOString().split("T")[0]
            : "",
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          parentEmail: student.parentEmail || "",
          address: student.address,
          classId: student.classId || "",
          status: student.status,
        })
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load student",
          variant: "destructive",
        })
      } finally {
        setLoadingStudent(false)
      }
    }
    fetchData()
  }, [params.id, reset, toast])

  async function onSubmit(data: StudentInput) {
    try {
      setSubmitting(true)
      const res = await fetch(`/api/students/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update student")
      }
      toast({ title: "Success", description: "Student updated successfully" })
      router.push(`/students/${params.id}`)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update student",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingStudent) return <PageLoading />

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Student" description="Update student information">
        <Button variant="outline" asChild>
          <Link href={`/students/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Admission Number" error={undefined}>
                  <Input {...register("admissionNumber")} disabled className="text-muted-foreground" />
                </FormField>
                <FormField label="Status" error={errors.status?.message}>
                  <Select
                    value={status}
                    onValueChange={(v) => setValue("status", v)}
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

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="First Name" error={errors.firstName?.message} required>
                  <Input {...register("firstName")} placeholder="First name" />
                </FormField>
                <FormField label="Last Name" error={errors.lastName?.message} required>
                  <Input {...register("lastName")} placeholder="Last name" />
                </FormField>
                <FormField label="Other Name" error={errors.otherName?.message}>
                  <Input {...register("otherName")} placeholder="Other name (optional)" />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Gender" error={errors.gender?.message} required>
                  <Select
                    value={gender}
                    onValueChange={(v) => setValue("gender", v as "male" | "female")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Date of Birth" error={errors.dateOfBirth?.message} required>
                  <Input
                    type="date"
                    {...register("dateOfBirth", { valueAsDate: false })}
                  />
                </FormField>
                <FormField label="Class" error={errors.classId?.message}>
                  <Select
                    value={classId || ""}
                    onValueChange={(v) => setValue("classId", v || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passport Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/30">
                  <div className="text-center p-4">
                    <p className="text-xs text-muted-foreground">Photo Preview</p>
                  </div>
                </div>
                <Input type="file" accept="image/*" className="text-xs" />
                <p className="text-xs text-muted-foreground text-center">
                  Upload a passport photograph (visual preview only)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Parent / Guardian Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Parent Name" error={errors.parentName?.message} required>
                <Input {...register("parentName")} placeholder="Full name" />
              </FormField>
              <FormField label="Parent Phone" error={errors.parentPhone?.message} required>
                <Input {...register("parentPhone")} placeholder="Phone number" />
              </FormField>
              <FormField label="Parent Email" error={errors.parentEmail?.message}>
                <Input {...register("parentEmail")} type="email" placeholder="Email (optional)" />
              </FormField>
            </div>
            <FormField label="Address" error={errors.address?.message} required>
              <Textarea {...register("address")} placeholder="Home address" rows={3} />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 mt-6">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Student
              </>
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/students/${params.id}`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
