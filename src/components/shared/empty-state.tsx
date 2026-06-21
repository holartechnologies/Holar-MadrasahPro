import { LucideIcon, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  children?: React.ReactNode
}

export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, actionHref, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && actionHref ? (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : children ? (
        children
      ) : null}
    </div>
  )
}
