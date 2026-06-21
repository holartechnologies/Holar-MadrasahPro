"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { PageLoading } from "@/components/shared/loading"
import { EmptyState } from "@/components/shared/empty-state"
import { StatCard } from "@/components/shared/stat-card"
import { cn, formatDate } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Printer,
  Download,
  Search,
  Filter,
  FileText,
} from "lucide-react"

interface ClassItem {
  id: string
  name: string
  code: string
}

interface AttendanceReportRecord {
  id: string
  date: string
  status: string
  remarks: string | null
  student: {
    id: string
    firstName: string
    lastName: string
    admissionNumber: string
  }
}

interface ReportSummary {
  totalPresent: number
  totalAbsent: number
  totalLate: number
  totalExcused: number
  totalRecords: number
}

export default function AttendanceReportsPage() {
  const { toast } = useToast()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [classId, setClassId] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [records, setRecords] = useState<AttendanceReportRecord[]>([])
  const [summary, setSummary] = useState<ReportSummary>({
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalExcused: 0,
    totalRecords: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes")
        if (!res.ok) throw new Error("Failed to fetch classes")
        const json = await res.json()
        setClasses(Array.isArray(json) ? json : json.classes ?? [])
      } catch {
        toast({ title: "Error", description: "Failed to load classes", variant: "destructive" })
      }
    }
    fetchClasses()
  }, [toast])

  const loadReport = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (classId) params.set("classId", classId)
      if (dateFrom) params.set("dateFrom", dateFrom)
      if (dateTo) params.set("dateTo", dateTo)
      if (studentSearch) params.set("studentSearch", studentSearch)

      const res = await fetch(`/api/attendance/reports?${params}`)
      if (!res.ok) throw new Error("Failed to fetch attendance report")
      const json = await res.json()

      const recs: AttendanceReportRecord[] = json.records ?? json.data ?? json ?? []
      setRecords(recs)

      const present = recs.filter((r) => r.status === "Present").length
      const absent = recs.filter((r) => r.status === "Absent").length
      const late = recs.filter((r) => r.status === "Late").length
      const excused = recs.filter((r) => r.status === "Excused").length

      setSummary({
        totalPresent: present,
        totalAbsent: absent,
        totalLate: late,
        totalExcused: excused,
        totalRecords: recs.length,
      })
    } catch {
      toast({ title: "Error", description: "Failed to load report", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [classId, dateFrom, dateTo, studentSearch, toast])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCsv = () => {
    if (records.length === 0) return
    const headers = ["Date", "Student Name", "Admission No", "Status", "Remarks"]
    const rows = records.map((r) => [
      formatDate(r.date),
      `${r.student.lastName} ${r.student.firstName}`,
      r.student.admissionNumber,
      r.status,
      r.remarks ?? "",
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-report-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Reports" description="View and export attendance records">
        <Button variant="outline" onClick={handlePrint} disabled={records.length === 0}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button variant="outline" onClick={handleExportCsv} disabled={records.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-2">
              <Label>Student</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-48 pl-8"
                />
              </div>
            </div>
            <Button onClick={loadReport}>
              <Filter className="mr-2 h-4 w-4" />
              Load Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {summary.totalRecords > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Present"
            value={summary.totalPresent}
            icon={CheckCircle2}
            className="border-green-200"
          />
          <StatCard
            title="Absent"
            value={summary.totalAbsent}
            icon={XCircle}
            className="border-red-200"
          />
          <StatCard
            title="Late"
            value={summary.totalLate}
            icon={Clock}
            className="border-yellow-200"
          />
          <StatCard
            title="Excused"
            value={summary.totalExcused}
            icon={ShieldAlert}
            className="border-blue-200"
          />
        </div>
      )}

      {loading && <PageLoading />}

      {!loading && records.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No Records"
          description="Select filters and click 'Load Report' to view attendance data."
        />
      )}

      {!loading && records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Attendance Records
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({summary.totalRecords} records)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S/N</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((rec, index) => (
                    <TableRow key={rec.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>{formatDate(rec.date)}</TableCell>
                      <TableCell className="font-medium">
                        {rec.student.lastName} {rec.student.firstName}
                      </TableCell>
                      <TableCell>{rec.student.admissionNumber}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            rec.status === "Present" && "bg-green-100 text-green-700",
                            rec.status === "Absent" && "bg-red-100 text-red-700",
                            rec.status === "Late" && "bg-yellow-100 text-yellow-700",
                            rec.status === "Excused" && "bg-blue-100 text-blue-700"
                          )}
                        >
                          {rec.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{rec.remarks || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
