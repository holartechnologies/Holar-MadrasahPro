"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { TableLoading } from "@/components/shared/loading"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toaster"
import {
  Plus, BookCopy, Pencil, Trash2, MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SubjectClass {
  id: string
  classId: string
  class: { id: string; name: string; code: string }
}

interface SubjectTeacher {
  id: string
  teacherId: string
  teacher: { id: string; staffId: string; fullName: string }
}

interface Subject {
  id: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  classes: SubjectClass[]
  teachers: SubjectTeacher[]
}

export default function SubjectsPage() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  async function fetchSubjects() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/subjects")
      if (!res.ok) throw new Error("Failed to fetch subjects")
      const data = await res.json()
      setSubjects(data)
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
      const res = await fetch(`/api/subjects?id=${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete subject")
      toast({ title: "Success", description: "Subject deleted successfully" })
      setSubjects((prev) => prev.filter((s) => s.id !== deleteId))
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete subject",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Subject>[] = [
    { accessorKey: "name", header: "Subject Name" },
    { accessorKey: "code", header: "Code" },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="max-w-[250px] truncate block">
          {row.original.description || "—"}
        </span>
      ),
    },
    {
      id: "classes",
      header: "Classes",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.classes.length}</span>
      ),
    },
    {
      id: "teachers",
      header: "Teachers",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.teachers.length}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
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
              <Link href={`/subjects/${row.original.id}/edit`}>
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
      <PageHeader title="Subjects" description="Manage all subjects offered in the curriculum">
        <Button asChild>
          <Link href="/subjects/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <TableLoading />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="p-4 bg-destructive/10 rounded-full">
            <BookCopy className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={fetchSubjects}>
            Try Again
          </Button>
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookCopy}
          title="No subjects found"
          description="Add subjects to build your school's curriculum."
          actionLabel="Add Subject"
          actionHref="/subjects/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={subjects}
          searchKey="name"
          searchPlaceholder="Search subjects..."
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This action cannot be undone."
        onConfirm={handleDelete}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </div>
  )
}
