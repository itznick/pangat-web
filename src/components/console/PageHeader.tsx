import * as React from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  /** Short section name shown in the breadcrumb, e.g. "Reports" */
  crumb: string
  title: string
  actions?: React.ReactNode
}

/** The one page header every console screen uses (same height, padding, border and type as Floor & Tables). */
export function PageHeader({ crumb, title, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 gap-3">
      <div className="min-w-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink>Admin</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>{crumb}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">{title}</h1>
      </div>
      {actions && <div className={cn("flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto justify-start sm:justify-end")}>{actions}</div>}
    </div>
  )
}

/** Standard page shell: header + padded, full-width content area (matches Floor & Tables). */
export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col min-h-full overflow-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">{children}</div>
}
