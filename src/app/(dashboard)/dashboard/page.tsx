"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { PageLoading } from "@/components/shared/loading"
import { PageHeader } from "@/components/shared/page-header"
import { cn } from "@/lib/utils"
import {
  Users,
  GraduationCap,
  BookOpen,
  BookCopy,
  DollarSign,
  TrendingDown,
  Activity,
  UserPlus,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import { format } from "date-fns"

interface DashboardData {
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  totalSubjects: number
  totalFeesCollected: number
  outstandingFees: number
  todayAttendance: { present: number; total: number }
  studentEnrollment: { className: string; count: number }[]
  feeCollection: { month: string; total: number }[]
  attendanceOverview: { month: string; present: number; total: number }[]
  recentActivities: {
    id: string
    action: string
    user: { username: string; fullName: string }
    createdAt: string
  }[]
  latestAdmissions: {
    id: string
    firstName: string
    lastName: string
    class: { name: string } | null
    dateAdmitted: string
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/dashboard")
        if (!res.ok) throw new Error("Failed to fetch dashboard data")
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return <PageLoading />

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <Activity className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium">{error || "No data available"}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  const {
    totalStudents,
    totalTeachers,
    totalClasses,
    totalSubjects,
    totalFeesCollected,
    outstandingFees,
    studentEnrollment,
    feeCollection,
    attendanceOverview,
    recentActivities,
    latestAdmissions,
  } = data

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Assalamu Alaikum — Welcome to Ihyaa'ussunnah School Management System"
      />

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          description="Enrolled this academic year"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Teachers"
          value={totalTeachers}
          icon={GraduationCap}
          description="Active staff members"
        />
        <StatCard
          title="Total Classes"
          value={totalClasses}
          icon={BookOpen}
          description="Across all grades"
        />
        <StatCard
          title="Total Subjects"
          value={totalSubjects}
          icon={BookCopy}
          description="Curriculum offerings"
        />
        <StatCard
          title="Fees Collected"
          value={`₦${(totalFeesCollected || 0).toLocaleString()}`}
          icon={DollarSign}
          description="Total collected"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Outstanding Fees"
          value={`₦${(outstandingFees || 0).toLocaleString()}`}
          icon={TrendingDown}
          description="Pending payments"
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student Enrollment Bar Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Student Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentEnrollment} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="className"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fee Collection Line Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Fee Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={feeCollection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    name="Collected"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Overview Area Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Present"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Recent Activities + Latest Admissions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activities
              </p>
            ) : (
              <ul className="space-y-3">
                {recentActivities.slice(0, 10).map((activity, index) => (
                  <li key={activity.id}>
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-2 h-2 mt-2 rounded-full",
                          index < 3 ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {activity.user?.fullName || activity.user?.username || "System"} —{" "}
                          {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Latest Admissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Latest Admissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestAdmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent admissions
              </p>
            ) : (
              <ul className="space-y-3">
                {latestAdmissions.slice(0, 5).map((admission) => (
                  <li key={admission.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {`${admission.firstName} ${admission.lastName}`
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{`${admission.firstName} ${admission.lastName}`}</p>
                          <p className="text-xs text-muted-foreground">
                            Class {admission.class?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(admission.dateAdmitted), "MMM d, yyyy")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Islamic-inspired decorative footer */}
      <div className="text-center text-xs text-muted-foreground/50 pt-4 border-t border-border/40">
        <span dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
        <span className="mx-2">·</span>
        Ihyaa&apos;ussunnah School Management System
      </div>
    </div>
  )
}
