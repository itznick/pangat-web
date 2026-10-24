import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const Breadcrumb = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <nav aria-label="breadcrumb" className={cn("", className)} {...props} />
)

const BreadcrumbList = ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
  <ol
    className={cn("flex flex-wrap items-center gap-1.5 text-sm text-zinc-400", className)}
    {...props}
  />
)

const BreadcrumbItem = ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li className={cn("inline-flex items-center gap-1.5", className)} {...props} />
)

const BreadcrumbLink = ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    className={cn("transition-colors hover:text-zinc-100 cursor-pointer", className)}
    {...props}
  />
)

const BreadcrumbPage = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-medium text-zinc-100", className)}
    {...props}
  />
)

const BreadcrumbSeparator = ({ className, children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator }
