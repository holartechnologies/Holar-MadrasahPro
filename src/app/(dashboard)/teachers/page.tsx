"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoading, TableLoading } from "@/components/shared/loading"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toaster"
import { Plus, Eye, Pencil, Trash2, Users, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"

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

export default function TeachersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchTeachers()
  }, [])

  async function fetchTeachers() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/teachers")
      if (!res.ok) throw new Error("Failed to fetch teachers")
      const data = await res.json()
      setTeachers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      setDeleting(true)
      const res = await fetch(`/api/teachers/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete teacher")
      toast({ title: "Success", description: "Teacher deleted successfully" })
      setTeachers((prev) => prev.filter((t) => t.id !== deleteId))
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to delete", variant: "destructive" })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Teacher>[] = [
    { accessorKey: "staffId", header: "Staff ID" },
    { accessorKey: "fullName", header: "Full Name" },
    { accessorKey: "phoneNumber", header: "Phone" },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email || "—" },
    { accessorKey: "qualification", header: "Qualification", cell: ({ row }) => row.original.qualification || "—" },
    {
      id: "assignedClass",
      header: "Assigned Class",
      cell: ({ row }) =>
        row.original.classes && row.original.classes.length > 0
          ? row.original.classes.map((c) => c.name).join(", ")
          : "—",
    },
    {
      id: "subjects",
      header: "Subjects",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.subjects.length > 0
            ? row.original.subjects.map((s) => (
                <Badge key={s.id} variant="secondary" className="text-xs">
                  {s.subject.name}
                </Badge>
              ))
            : "—"}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/teachers/${row.original.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/teachers/${row.original.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Teachers" description="Manage all teachers and staff members">
        <Button asChild>
          <Link href="/teachers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <TableLoading />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="p-4 bg-destructive/10 rounded-full">
            <Users className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={fetchTeachers}>
            Try Again
          </Button>
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teachers found"
          description="Get started by adding your first teacher to the system."
          actionLabel="Add Teacher"
          actionHref="/teachers/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={teachers}
          searchKey="fullName"
          searchPlaceholder="Search teachers..."
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Teacher"
        description="Are you sure you want to delete this teacher? This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </div>
  )
}
