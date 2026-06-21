"use client"

import { useState, useEffect } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import {
  DollarSign,
  Plus,
  Pencil,
  Banknote,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Printer,
  Search,
} from "lucide-react"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { FormField } from "@/components/shared/form-field"
import { StatCard } from "@/components/shared/stat-card"
import { PageLoading } from "@/components/shared/loading"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { feeSchema, paymentSchema } from "@/schemas"
import { useToast } from "@/components/ui/toaster"

type Fee = {
  id: string
  name: string
  amount: number
  description: string | null
  status?: string
  createdAt: string
  updatedAt: string
  payments: {
    id: string
    studentId: string
    amountPaid: number
    paymentMethod: string
    receiptNumber: string
    paymentDate: string
    student: {
      id: string
      firstName: string
      lastName: string
      admissionNumber: string
    }
  }[]
  _count: { payments: number }
}

type Payment = {
  id: string
  studentId: string
  feeId: string
  amount: number
  amountPaid: number
  balance: number
  receiptNumber: string
  paymentMethod: string
  paymentDate: string
  notes: string | null
  createdAt: string
  student: {
    id: string
    firstName: string
    lastName: string
    admissionNumber: string
  }
  fee: {
    id: string
    name: string
    amount: number
    description: string | null
  }
}

type Student = {
  id: string
  firstName: string
  lastName: string
  admissionNumber: string
}

const feeFormSchema = feeSchema
type FeeFormData = z.infer<typeof feeFormSchema>

const paymentFormSchema = paymentSchema
type PaymentFormData = z.infer<typeof paymentFormSchema>

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [feeDialogOpen, setFeeDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<Fee | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [paymentFilter, setPaymentFilter] = useState<string>("all")

  const { toast } = useToast()

  const feeForm = useForm<FeeFormData>({
    resolver: zodResolver(feeFormSchema),
    defaultValues: { name: "", amount: 0, description: "" },
  })

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: "",
      feeId: "",
      amountPaid: 0,
      paymentMethod: "Cash",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  async function fetchData() {
    try {
      setLoading(true)
      const [feesRes, paymentsRes, studentsRes] = await Promise.all([
        fetch("/api/fees"),
        fetch("/api/payments"),
        fetch("/api/students"),
      ])
      if (!feesRes.ok) throw new Error("Failed to fetch fees")
      if (!paymentsRes.ok) throw new Error("Failed to fetch payments")
      if (!studentsRes.ok) throw new Error("Failed to fetch students")
      const [feesData, paymentsData, studentsData] = await Promise.all([
        feesRes.json(),
        paymentsRes.json(),
        studentsRes.json(),
      ])
      setFees(feesData)
      setPayments(paymentsData)
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
  }

  useEffect(() => { fetchData() }, [])

  function openAddFeeDialog() {
    setEditingFee(null)
    feeForm.reset({ name: "", amount: 0, description: "" })
    setFeeDialogOpen(true)
  }

  function openEditFeeDialog(fee: Fee) {
    setEditingFee(fee)
    feeForm.reset({
      name: fee.name,
      amount: fee.amount,
      description: fee.description || "",
    })
    setFeeDialogOpen(true)
  }

  async function onFeeSubmit(data: FeeFormData) {
    try {
      setSubmitting(true)
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save fee")
      }
      toast({
        title: "Success",
        description: editingFee ? "Fee updated successfully" : "Fee created successfully",
      })
      setFeeDialogOpen(false)
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

  function openAddPaymentDialog() {
    paymentForm.reset({
      studentId: "",
      feeId: "",
      amountPaid: 0,
      paymentMethod: "Cash",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    })
    setPaymentDialogOpen(true)
  }

  async function onPaymentSubmit(data: PaymentFormData) {
    try {
      setSubmitting(true)
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to record payment")
      }
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
      setPaymentDialogOpen(false)
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

  function handlePrintReceipt(payment: Payment) {
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
      <head>
        <title>Receipt - ${payment.receiptNumber}</title>
        <style>
          body { font-family: monospace; padding: 40px; max-width: 400px; margin: auto; }
          h1 { font-size: 20px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          td { padding: 6px 4px; }
          td:last-child { text-align: right; }
          .line { border-top: 1px dashed #000; }
          .total td { font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>RECEIPT</h1>
        <p style="text-align:center">${payment.receiptNumber}</p>
        <hr/>
        <table>
          <tr><td>Student:</td><td>${payment.student.firstName} ${payment.student.lastName}</td></tr>
          <tr><td>Admission No:</td><td>${payment.student.admissionNumber}</td></tr>
          <tr><td>Fee Type:</td><td>${payment.fee.name}</td></tr>
          <tr><td>Amount:</td><td>${payment.fee.amount.toLocaleString()}</td></tr>
          <tr><td>Amount Paid:</td><td>${payment.amountPaid.toLocaleString()}</td></tr>
          <tr><td>Balance:</td><td>${payment.balance.toLocaleString()}</td></tr>
          <tr><td>Method:</td><td>${payment.paymentMethod}</td></tr>
          <tr><td>Date:</td><td>${format(new Date(payment.paymentDate), "dd MMM yyyy")}</td></tr>
        </table>
        <hr/>
        <p class="footer">Thank you for your payment</p>
        <script>window.print()</script>
      </body>
      </html>
    `)
    win.document.close()
  }

  const totalCollected = payments.reduce((sum, p) => sum + p.amountPaid, 0)
  const totalOutstanding = payments.reduce((sum, p) => sum + p.balance, 0)
  const studentsWithBalance = new Set(
    payments.filter((p) => p.balance > 0).map((p) => p.studentId)
  ).size

  const filteredPayments =
    paymentFilter === "all"
      ? payments
      : payments.filter((p) => p.fee.name === paymentFilter)

  const feeColumns: ColumnDef<Fee>[] = [
    { accessorKey: "name", header: "Fee Name" },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium tabular-nums">
          {row.original.amount.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>
          {row.original.status || "Active"}
        </Badge>
      ),
    },
    {
      header: "Total Collected",
      cell: ({ row }) => {
        const total = row.original.payments.reduce((s, p) => s + p.amountPaid, 0)
        return (
          <span className="tabular-nums">
            {total.toLocaleString()}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => openEditFeeDialog(row.original)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: "receiptNumber",
      header: "Receipt No",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.receiptNumber}</span>
      ),
    },
    {
      accessorKey: "student",
      header: "Student",
      cell: ({ row }) => {
        const s = row.original.student
        return (
          <span className="font-medium">
            {s.firstName} {s.lastName}
          </span>
        )
      },
    },
    {
      accessorKey: "fee",
      header: "Fee Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.fee.name}</Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.original.amount.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "amountPaid",
      header: "Amount Paid",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium text-green-600 dark:text-green-400">
          {row.original.amountPaid.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => {
        const bal = row.original.balance
        return (
          <span className={cn("tabular-nums", bal > 0 ? "text-destructive font-medium" : "text-muted-foreground")}>
            {bal.toLocaleString()}
          </span>
        )
      },
    },
    {
      accessorKey: "paymentDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.paymentDate), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.paymentMethod}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePrintReceipt(row.original)}
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees Management"
        description="Manage fee structures and track payments"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Collected"
          value={totalCollected.toLocaleString()}
          icon={TrendingUp}
          description="Across all fee types"
        />
        <StatCard
          title="Total Outstanding"
          value={totalOutstanding.toLocaleString()}
          icon={Wallet}
          description="Pending balance"
        />
        <StatCard
          title="Students with Balance"
          value={studentsWithBalance}
          icon={AlertTriangle}
          description="Have outstanding payments"
        />
      </div>

      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="structure">
            <Banknote className="h-4 w-4 mr-1.5" />
            Fee Structure
          </TabsTrigger>
          <TabsTrigger value="payments">
            <DollarSign className="h-4 w-4 mr-1.5" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {fees.length} fee type{fees.length !== 1 ? "s" : ""} configured
            </p>
            <Button onClick={openAddFeeDialog} size="sm">
              <Plus className="h-4 w-4" />
              Add Fee
            </Button>
          </div>

          {fees.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="No Fee Structures"
              description="Create fee types to start tracking payments."
              actionLabel="Add Fee"
              actionHref="#"
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <DataTable columns={feeColumns} data={fees} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fee Types</SelectItem>
                  {fees.map((f) => (
                    <SelectItem key={f.id} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button onClick={openAddPaymentDialog} size="sm">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </div>

          {filteredPayments.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No Payments Recorded"
              description="Record the first payment to begin tracking."
              actionLabel="Record Payment"
              actionHref="#"
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <DataTable
                  columns={paymentColumns}
                  data={filteredPayments}
                  searchKey="student"
                  searchPlaceholder="Search by student or receipt..."
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Fee Dialog */}
      <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFee ? "Edit Fee" : "Add New Fee"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={feeForm.handleSubmit(onFeeSubmit)} className="space-y-4">
            <FormField label="Fee Name" required error={feeForm.formState.errors.name?.message}>
              <Input {...feeForm.register("name")} placeholder="e.g. Tuition Fee" />
            </FormField>
            <FormField label="Amount" required error={feeForm.formState.errors.amount?.message}>
              <Input
                type="number"
                min={0}
                {...feeForm.register("amount", { valueAsNumber: true })}
              />
            </FormField>
            <FormField label="Description" error={feeForm.formState.errors.description?.message}>
              <Textarea {...feeForm.register("description")} rows={3} />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFeeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingFee ? "Update" : "Create Fee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
            <FormField label="Student" required error={paymentForm.formState.errors.studentId?.message}>
              <Select
                value={paymentForm.watch("studentId")}
                onValueChange={(v) => paymentForm.setValue("studentId", v)}
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

            <FormField label="Fee Type" required error={paymentForm.formState.errors.feeId?.message}>
              <Select
                value={paymentForm.watch("feeId")}
                onValueChange={(v) => paymentForm.setValue("feeId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type..." />
                </SelectTrigger>
                <SelectContent>
                  {fees.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} - {f.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Amount Paid" required error={paymentForm.formState.errors.amountPaid?.message}>
              <Input
                type="number"
                min={0}
                {...paymentForm.register("amountPaid", { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Payment Method" required>
              <Select
                value={paymentForm.watch("paymentMethod")}
                onValueChange={(v) => paymentForm.setValue("paymentMethod", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Payment Date" required error={paymentForm.formState.errors.paymentDate?.message}>
              <Input
                type="date"
                {...paymentForm.register("paymentDate", { valueAsNumber: false })}
                defaultValue={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) =>
                  paymentForm.setValue("paymentDate", e.target.value)
                }
              />
            </FormField>

            <FormField label="Notes" error={paymentForm.formState.errors.notes?.message}>
              <Textarea {...paymentForm.register("notes")} rows={2} />
            </FormField>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Processing..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
