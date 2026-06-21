"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoading } from "@/components/shared/loading"
import { DataTable } from "@/components/shared/data-table"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  DollarSign,
  FileSpreadsheet,
  BookCopy,
  Star,
  UserCircle,
  BarChart3,
  Printer,
  Download,
  FileText,
  X,
  AlertCircle,
} from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

interface ReportType {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
}

interface StudentRecord {
  id: string
  admissionNumber: string
  firstName: string
  lastName: string
  gender: string
  class: { name: string } | null
  status: string
  parentName: string
  parentPhone: string
}

const reportTypes: ReportType[] = [
  {
    id: "student-list",
    title: "Student List",
    description: "All students with class info",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  {
    id: "teacher-list",
    title: "Teacher List",
    description: "All teachers with assignments",
    icon: GraduationCap,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
  },
  {
    id: "class-list",
    title: "Class List",
    description: "All classes with teachers and student count",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
  },
  {
    id: "attendance",
    title: "Attendance Report",
    description: "Attendance by date range",
    icon: ClipboardCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
  },
  {
    id: "fee",
    title: "Fee Report",
    description: "Fee collection summary",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  {
    id: "examination",
    title: "Examination Results",
    description: "Results by exam, class, subject",
    icon: FileSpreadsheet,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  {
    id: "hifz",
    title: "Hifz Report",
    description: "Hifz progress summary",
    icon: BookCopy,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
  },
  {
    id: "character",
    title: "Character Assessment Report",
    description: "Character ratings summary",
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  {
    id: "student-profile",
    title: "Student Profile",
    description: "Individual student report",
    icon: UserCircle,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20",
  },
  {
    id: "class-summary",
    title: "Class Summary",
    description: "Class performance overview",
    icon: BarChart3,
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-900/20",
  },
]

function generateCSV(students: StudentRecord[]): string {
  const headers = ["Admission No", "First Name", "Last Name", "Gender", "Class", "Status", "Parent Name", "Parent Phone"]
  const rows = students.map((s) => [
    s.admissionNumber,
    s.firstName,
    s.lastName,
    s.gender,
    s.class?.name ?? "N/A",
    s.status,
    s.parentName,
    s.parentPhone,
  ])
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getMockStudents(): StudentRecord[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `mock-${i + 1}`,
    admissionNumber: `ADS${String(i + 1).padStart(3, "0")}`,
    firstName: ["Ahmad", "Fatima", "Umar", "Khadija", "Ali", "Aisha", "Hassan", "Maryam", "Hussein", "Zainab"][i % 10],
    lastName: ["Abdullah", "Mohammed", "Ibrahim", "Yusuf", "Hassan", "Aliyu", "Bello", "Sani", "Usman", "Abubakar"][i % 10],
    gender: i % 2 === 0 ? "Male" : "Female",
    class: { name: `SS ${Math.min(Math.floor(i / 5) + 1, 3)}` },
    status: i % 3 === 0 ? "Inactive" : "Active",
    parentName: `Parent of ${["Ahmad", "Fatima", "Umar", "Khadija", "Ali", "Aisha", "Hassan", "Maryam", "Hussein", "Zainab"][i % 10]}`,
    parentPhone: `+234-800-${String(100 + i).slice(1)}`,
  }))
}

export default function ReportsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/students")
        if (!res.ok) throw new Error("Failed to fetch student data")
        const json = await res.json()
        setStudents(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setStudents(getMockStudents())
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  async function handleGenerateReport(report: ReportType) {
    setSelectedReport(report)
    setShowDialog(true)
    if (report.id === "student-list") return
    setPreviewLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setPreviewLoading(false)
  }

  function handlePrint() {
    window.print()
  }

  function handleExportCSV() {
    if (!selectedReport) return
    const csv = generateCSV(students)
    downloadBlob(csv, `${selectedReport.id}-report.csv`, "text/csv")
    toast({ title: "Success", description: "CSV file downloaded" })
  }

  async function handleExportPDF() {
    toast({ title: "Exporting PDF", description: "Generating PDF report..." })
    try {
      const jsPDF = (await import("jspdf")).default
      const autoTable = (await import("jspdf-autotable")).default
      const doc = new jsPDF()
      const title = selectedReport?.title ?? "Report"

      doc.setFontSize(16)
      doc.text(title, 14, 20)
      doc.setFontSize(10)
      doc.text(`Ihya'us Sunnah Islamic School - Generated ${new Date().toLocaleDateString()}`, 14, 28)

      autoTable(doc, {
        startY: 35,
        head: [["Admission No", "Name", "Gender", "Class", "Status", "Parent Name"]],
        body: students.map((s) => [
          s.admissionNumber,
          `${s.firstName} ${s.lastName}`,
          s.gender,
          s.class?.name ?? "N/A",
          s.status,
          s.parentName,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      })

      doc.save(`${selectedReport?.id}-report.pdf`)
      toast({ title: "Success", description: "PDF file downloaded" })
    } catch {
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" })
    }
  }

  const studentColumns: ColumnDef<StudentRecord>[] = [
    { accessorKey: "admissionNumber", header: "Admission No" },
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
    },
    { accessorKey: "gender", header: "Gender" },
    {
      id: "class",
      header: "Class",
      accessorFn: (row) => row.class?.name ?? "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("status") === "Active" ? "default" : "secondary"}>
          {row.getValue("status") as string}
        </Badge>
      ),
    },
    { accessorKey: "parentName", header: "Parent Name" },
  ]

  function renderPreview() {
    if (!selectedReport) return null

    if (selectedReport.id === "student-list") {
      return (
        <DataTable
          columns={studentColumns}
          data={students}
          searchKey="search"
          searchPlaceholder="Search students..."
          pageSize={5}
        />
      )
    }

    if (previewLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="p-4 rounded-full bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
        <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
          Full report generation for {selectedReport.title} will be available in a future update.
        </p>
      </div>
    )
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and export school reports"
      />

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            {error} — Showing sample data for demonstration.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {reportTypes.map((report) => {
          const Icon = report.icon
          return (
            <Card
              key={report.id}
              className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30 print:shadow-none"
              onClick={() => handleGenerateReport(report)}
            >
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={cn("p-3 rounded-xl transition-colors group-hover:scale-110 duration-200", report.bgColor)}>
                    <Icon className={cn("h-7 w-7", report.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{report.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-1">
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Islamic geometric pattern decoration */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/30">
        <div className="absolute inset-0 opacity-[0.03] print:hidden">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 40px, currentColor 40px, currentColor 41px),
                repeating-linear-gradient(90deg, transparent, transparent 40px, currentColor 40px, currentColor 41px),
                repeating-linear-gradient(45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px),
                repeating-linear-gradient(135deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)
              `,
              backgroundSize: "80px 80px",
            }}
          />
        </div>
        <div className="relative p-6 text-center">
          <p className="text-sm text-muted-foreground">
            <span dir="rtl" className="text-base ml-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <br />
            Click any report card above to generate, preview, and export
          </p>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col print:max-w-full print:max-h-full print:border-0 print:shadow-none">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2">
              {selectedReport && (() => {
                const Icon = selectedReport.icon
                return <Icon className="h-5 w-5 text-primary" />
              })()}
              {selectedReport?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedReport?.description} — Preview and export options below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4 print:overflow-visible">
            {renderPreview()}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t print:hidden">
            <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button size="sm" onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
