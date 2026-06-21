"use client"

import { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  error?: string
  children: ReactNode
  required?: boolean
  className?: string
}

export function FormField({ label, error, children, required, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
