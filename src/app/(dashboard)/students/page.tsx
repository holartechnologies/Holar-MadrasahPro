"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { TableLoading } from "@/components/shared/loading"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useToast } from "@/components/ui/toaster"
import { StudentWithClass } from "@/types"

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        const res = await fetch(`/api/students?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch students")
        const json = await res.json()
        setStudents(json)
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load students",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => fetchStudents(), 300)
    return () => clearTimeout(timer)
  }, [search, toast])

  async function handleDelete() {
    if (!deleteId) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/students/${deleteId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete student")
      }
      toast({ title: "Success", description: "Student deleted successfully" })
      setStudents((prev) => prev.filter((s) => s.id !== deleteId))
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete student",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<StudentWithClass>[] = [
    {
      accessorKey: "admissionNumber",
      header: "Admission No",
    },
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("gender")}</span>
      ),
    },
    {
      id: "class",
      header: "Class",
      accessorFn: (row) => row.class?.name ?? "—",
    },
    {
      accessorKey: "parentPhone",
      header: "Parent Phone",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "Active" ? "default" : "secondary"}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/students/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/students/${row.original.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage all student records"
      >
        <Button asChild>
          <Link href="/students/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <TableLoading />
      ) : students.length === 0 && !search ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Add your first student to get started with student management."
          actionLabel="Add Student"
          actionHref="/students/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={students}
          searchKey="search"
          searchPlaceholder="Search by name, admission no, or parent..."
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </div>
  )
}
