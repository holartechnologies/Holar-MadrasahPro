"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { useToast } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import {
  Settings,
  School,
  BookOpen,
  Bell,
  Save,
  CheckCircle2,
  GraduationCap,
  ClipboardList,
  BarChart3,
} from "lucide-react"

interface GeneralSettings {
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  schoolMotto: string
}

interface AcademicSettings {
  currentYear: string
  currentTerm: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  defaultLanguage: string
}

const defaultGeneral: GeneralSettings = {
  schoolName: "Ihya'us Sunnah Islamic School",
  schoolAddress: "No. 1, Islamic Avenue, Madinah Quarter",
  schoolPhone: "+234-800-SUNNAH",
  schoolEmail: "info@ihyaahussunah.com",
  schoolMotto: "Reviving the Sunnah through Knowledge and Action",
}

const defaultAcademic: AcademicSettings = {
  currentYear: "2025/2026",
  currentTerm: "1st",
}

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  defaultLanguage: "English",
}

const LANGUAGES = ["English", "Arabic", "Hausa", "French"] as const
const TERMS = ["1st", "2nd", "3rd"] as const

const gradingScale = [
  { grade: "A", range: "70% - 100%", remark: "Excellent" },
  { grade: "B", range: "60% - 69%", remark: "Very Good" },
  { grade: "C", range: "50% - 59%", remark: "Good" },
  { grade: "D", range: "45% - 49%", remark: "Fair" },
  { grade: "E", range: "40% - 44%", remark: "Pass" },
  { grade: "F", range: "0% - 39%", remark: "Fail" },
]

const assessmentStructure = [
  { component: "Test 1", weight: 10 },
  { component: "Test 2", weight: 10 },
  { component: "Assignment", weight: 10 },
  { component: "Examination", weight: 70 },
]

export default function SettingsPage() {
  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneral)
  const [academic, setAcademic] = useState<AcademicSettings>(defaultAcademic)
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      try {
        localStorage.setItem("school-general", JSON.stringify(general))
        localStorage.setItem("school-academic", JSON.stringify(academic))
        localStorage.setItem("school-notifications", JSON.stringify(notifications))
        toast({
          title: "Settings Saved",
          description: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              All settings have been saved successfully.
            </div>
          ) as unknown as string,
        })
      } catch {
        toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
      } finally {
        setSaving(false)
      }
    }, 400)
  }

  function handleGeneralChange<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) {
    setGeneral((prev) => ({ ...prev, [key]: value }))
  }

  function handleAcademicChange<K extends keyof AcademicSettings>(key: K, value: AcademicSettings[K]) {
    setAcademic((prev) => ({ ...prev, [key]: value }))
  }

  function handleNotificationChange<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure system preferences"
      >
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </PageHeader>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Academic</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <School className="h-5 w-5 text-primary" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={general.schoolName}
                  onChange={(e) => handleGeneralChange("schoolName", e.target.value)}
                  dir="auto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolAddress">School Address</Label>
                <Textarea
                  id="schoolAddress"
                  value={general.schoolAddress}
                  onChange={(e) => handleGeneralChange("schoolAddress", e.target.value)}
                  rows={3}
                  dir="auto"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">School Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={general.schoolPhone}
                    onChange={(e) => handleGeneralChange("schoolPhone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">School Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={general.schoolEmail}
                    onChange={(e) => handleGeneralChange("schoolEmail", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolMotto">School Motto</Label>
                <Input
                  id="schoolMotto"
                  value={general.schoolMotto}
                  onChange={(e) => handleGeneralChange("schoolMotto", e.target.value)}
                  dir="auto"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold text-primary">150+</p>
                  <p className="text-xs text-muted-foreground mt-1">Students Enrolled</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-xs text-muted-foreground mt-1">Qualified Teachers</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-2xl font-bold text-primary">6</p>
                  <p className="text-xs text-muted-foreground mt-1">Active Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-primary" />
                Session Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentYear">Current Academic Year</Label>
                  <Input
                    id="currentYear"
                    value={academic.currentYear}
                    onChange={(e) => handleAcademicChange("currentYear", e.target.value)}
                    placeholder="2025/2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentTerm">Current Term</Label>
                  <Select
                    value={academic.currentTerm}
                    onValueChange={(value) => handleAcademicChange("currentTerm", value)}
                  >
                    <SelectTrigger id="currentTerm">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {TERMS.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term} Term
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Grading Scale (Reference)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Grade</th>
                      <th className="text-left p-3 font-medium">Range</th>
                      <th className="text-left p-3 font-medium">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradingScale.map((item) => (
                      <tr key={item.grade} className="border-t border-border/50">
                        <td className="p-3 font-semibold">{item.grade}</td>
                        <td className="p-3 text-muted-foreground">{item.range}</td>
                        <td className="p-3">{item.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Grading scale is configured at the system level. Contact an administrator to modify.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-primary" />
                Assessment Structure (Reference)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium">Component</th>
                      <th className="text-left p-3 font-medium">Weight (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentStructure.map((item) => (
                      <tr key={item.component} className="border-t border-border/50">
                        <td className="p-3">{item.component}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="font-semibold">{item.weight}</span>
                            <span className="text-muted-foreground">marks</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-border/50 bg-muted/30">
                      <td className="p-3 font-semibold">Total</td>
                      <td className="p-3 font-semibold">
                        {assessmentStructure.reduce((sum, i) => sum + i.weight, 0)} marks
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Assessment weights are configured at the system level. Contact an administrator to modify.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive system alerts and reports via email
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send SMS alerts for attendance and fee updates
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notifications.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("smsNotifications", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <Select
                  value={notifications.defaultLanguage}
                  onValueChange={(value) => handleNotificationChange("defaultLanguage", value)}
                >
                  <SelectTrigger id="defaultLanguage" className="max-w-xs">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sets the default language for the system interface and communications.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Islamic decorative footer */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card/30">
        <div className="absolute inset-0 opacity-[0.03]">
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
        <div className="relative p-5 text-center">
          <p className="text-sm text-muted-foreground" dir="rtl">
            رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Our Lord, give us in this world good and in the Hereafter good and protect us from the punishment of the Fire
          </p>
        </div>
      </div>
    </div>
  )
}
