"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import {
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Printer,
  Search,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { FormField } from "@/components/shared/form-field"
import { PageLoading } from "@/components/shared/loading"
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { paymentSchema } from "@/schemas"
import { useToast } from "@/components/ui/toaster"

type Student = {
  id: string
  firstName: string
  lastName: string
  admissionNumber: string
}

type Fee = {
  id: string
  name: string
  amount: number
  description: string | null
}

type PaymentResult = {
  id: string
  receiptNumber: string
  amount: number
  amountPaid: number
  balance: number
  paymentMethod: string
  paymentDate: string
  notes: string | null
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
  }
}

const formSchema = paymentSchema.extend({
  studentId: z.string().min(1, "Student is required"),
  feeId: z.string().min(1, "Fee type is required"),
  amountPaid: z.coerce.number().positive("Amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
})

type FormData = z.infer<typeof formSchema>

export default function NewPaymentPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<PaymentResult | null>(null)
  const [studentSearch, setStudentSearch] = useState("")

  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      feeId: "",
      amountPaid: 0,
      paymentMethod: "Cash",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  })

  const watchedFeeId = form.watch("feeId")
  const watchedAmountPaid = form.watch("amountPaid")

  const selectedFee = fees.find((f) => f.id === watchedFeeId)
  const balance = selectedFee
    ? Math.max(0, selectedFee.amount - (watchedAmountPaid || 0))
    : 0

  const filteredStudents = studentSearch
    ? students.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`
            .toLowerCase()
            .includes(studentSearch.toLowerCase()) ||
          s.admissionNumber.toLowerCase().includes(studentSearch.toLowerCase())
      )
    : students

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [studentsRes, feesRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/fees"),
      ])
      if (!studentsRes.ok) throw new Error("Failed to load students")
      if (!feesRes.ok) throw new Error("Failed to load fee structures")
      const [studentsData, feesData] = await Promise.all([
        studentsRes.json(),
        feesRes.json(),
      ])
      setStudents(studentsData)
      setFees(feesData)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function onSubmit(data: FormData) {
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
      const result: PaymentResult = await res.json()
      setReceipt(result)
      toast({
        title: "Payment Recorded",
        description: `Receipt: ${result.receiptNumber}`,
      })
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

  function handlePrint() {
    if (!receipt) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
      <html>
      <head>
        <title>Receipt - ${receipt.receiptNumber}</title>
        <style>
          body { font-family: monospace; padding: 40px; max-width: 400px; margin: auto; }
          h1 { font-size: 20px; text-align: center; margin-bottom: 4px; }
          .receipt-no { text-align: center; color: #666; margin-bottom: 20px; }
          hr { border: none; border-top: 1px dashed #000; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          td { padding: 6px 4px; }
          td:last-child { text-align: right; }
          .total td { font-weight: bold; }
          .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #666; }
          .paid { color: #16a34a; font-weight: bold; }
          .balance { color: ${receipt.balance > 0 ? "#dc2626" : "#16a34a"}; }
        </style>
      </head>
      <body>
        <h1>OFFICIAL RECEIPT</h1>
        <p class="receipt-no">${receipt.receiptNumber}</p>
        <hr/>
        <table>
          <tr><td>Student:</td><td>${receipt.student.firstName} ${receipt.student.lastName}</td></tr>
          <tr><td>Admission No:</td><td>${receipt.student.admissionNumber}</td></tr>
          <tr><td>Fee Type:</td><td>${receipt.fee.name}</td></tr>
          <tr><td>Total Fee:</td><td>${receipt.amount.toLocaleString()}</td></tr>
          <tr><td class="paid">Amount Paid:</td><td class="paid">${receipt.amountPaid.toLocaleString()}</td></tr>
          <tr><td class="balance">Balance:</td><td class="balance">${receipt.balance.toLocaleString()}</td></tr>
          <tr><td>Method:</td><td>${receipt.paymentMethod}</td></tr>
          <tr><td>Date:</td><td>${format(new Date(receipt.paymentDate), "dd MMM yyyy")}</td></tr>
        </table>
        <hr/>
        <p class="footer">Thank you for your payment</p>
        <p class="footer">Ihyaa'ussunnah School</p>
        <script>window.print()</script>
      </body>
      </html>
    `)
    win.document.close()
  }

  if (loading) return <PageLoading />

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold">Payment Successful</h2>
          <p className="text-muted-foreground">
            Receipt: <span className="font-mono font-medium">{receipt.receiptNumber}</span>
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student</span>
              <span className="font-medium">
                {receipt.student.firstName} {receipt.student.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee Type</span>
              <span>{receipt.fee.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {receipt.amountPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance</span>
              <span
                className={cn(
                  "font-medium",
                  receipt.balance > 0
                    ? "text-destructive"
                    : "text-green-600 dark:text-green-400"
                )}
              >
                {receipt.balance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{format(new Date(receipt.paymentDate), "dd MMM yyyy")}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/fees")}>
            <ArrowLeft className="h-4 w-4" />
            Back to Fees
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Record New Payment"
        description="Process a fee payment and generate a receipt"
      >
        <Button variant="outline" onClick={() => router.push("/fees")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              label="Student"
              required
              error={form.formState.errors.studentId?.message}
            >
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto border rounded-md">
                  {filteredStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3 text-center">
                      No students found
                    </p>
                  ) : (
                    filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          form.setValue("studentId", s.id)
                          setStudentSearch("")
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b last:border-b-0",
                          form.watch("studentId") === s.id && "bg-accent font-medium"
                        )}
                      >
                        {s.firstName} {s.lastName}
                        <span className="text-muted-foreground ml-2">
                          ({s.admissionNumber})
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </FormField>

            <FormField
              label="Fee Type"
              required
              error={form.formState.errors.feeId?.message}
            >
              <Select
                value={form.watch("feeId")}
                onValueChange={(v) => {
                  form.setValue("feeId", v)
                  const fee = fees.find((f) => f.id === v)
                  if (fee) {
                    form.setValue("amountPaid", fee.amount)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type..." />
                </SelectTrigger>
                <SelectContent>
                  {fees.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} — {f.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {selectedFee && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Fee Amount</p>
                  <p className="text-lg font-bold">{selectedFee.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount Paid</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {(watchedAmountPaid || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className={cn("text-lg font-bold", balance > 0 ? "text-destructive" : "text-green-600 dark:text-green-400")}>
                    {balance.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <FormField
              label="Amount Paid"
              required
              error={form.formState.errors.amountPaid?.message}
            >
              <Input
                type="number"
                min={0}
                {...form.register("amountPaid", { valueAsNumber: true })}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Payment Method" required>
                <Select
                  value={form.watch("paymentMethod")}
                  onValueChange={(v) => form.setValue("paymentMethod", v)}
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

              <FormField
                label="Payment Date"
                required
                error={form.formState.errors.paymentDate?.message}
              >
                <Input
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) =>
                    form.setValue("paymentDate", e.target.value)
                  }
                />
              </FormField>
            </div>

            <FormField label="Notes" error={form.formState.errors.notes?.message}>
              <Textarea
                {...form.register("notes")}
                rows={2}
                placeholder="Optional notes..."
              />
            </FormField>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/fees")}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Processing..." : "Record Payment & Generate Receipt"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
