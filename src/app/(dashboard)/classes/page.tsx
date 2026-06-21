"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Plus, BookOpen, Eye, Pencil, Trash2, MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ClassData {
  id: string
  name: string
  code: string
  teacherId: string | null
  status: string
  teacher: { id: string; staffId: string; fullName: string } | null
  _count: { students: number }
}

export default function ClassesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  async function fetchClasses() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/classes")
      if (!res.ok) throw new Error("Failed to fetch classes")
      const data = await res.json()
      setClasses(data)
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
      const res = await fetch(`/api/classes?id=${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete class")
      toast({ title: "Success", description: "Class deleted successfully" })
      setClasses((prev) => prev.filter((c) => c.id !== deleteId))
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete class",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<ClassData>[] = [
    { accessorKey: "name", header: "Class Name" },
    { accessorKey: "code", header: "Code" },
    {
      id: "classTeacher",
      header: "Class Teacher",
      cell: ({ row }) => row.original.teacher?.fullName || "—",
    },
    {
      id: "studentsCount",
      header: "Students Count",
      cell: ({ row }) => (
        <span className="font-medium">{row.original._count.students}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>
          {row.original.status}
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
              <Link href={`/classes/${row.original.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Students
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/classes/${row.original.id}/edit`}>
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
      <PageHeader title="Classes" description="Manage all classes and grade levels">
        <Button asChild>
          <Link href="/classes/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Link>
        </Button>
      </PageHeader>

      {loading ? (
        <TableLoading />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="p-4 bg-destructive/10 rounded-full">
            <BookOpen className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={fetchClasses}>
            Try Again
          </Button>
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No classes found"
          description="Create your first class to get started."
          actionLabel="Add Class"
          actionHref="/classes/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={classes}
          searchKey="name"
          searchPlaceholder="Search classes..."
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Class"
        description="Are you sure you want to delete this class? This action cannot be undone and may affect associated records."
        onConfirm={handleDelete}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </div>
  )
}
