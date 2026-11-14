import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useFocusTrap, useScrollLock } from "@/hooks/useModal"
import * as React from "react"
import { cn } from "@/lib/utils"

// Simple Dialog implementation
interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  useEscapeKey(open, () => onOpenChange(false))
  const ref = React.useRef<HTMLDivElement>(null)
  useScrollLock(open)
  useFocusTrap(open, ref)

  if (!open) return null

  return (
    <div ref={ref} role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg">
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "bg-zinc-900 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 p-6 max-h-[88dvh] overflow-y-auto animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)} {...props} />
)

const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold text-zinc-100", className)} {...props} />
)

const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-zinc-400 mt-1", className)} {...props} />
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex justify-end gap-2 mt-6", className)} {...props} />
)

interface DialogTriggerProps {
  asChild?: boolean
  children: React.ReactNode
  onClick?: () => void
}

const DialogTrigger = ({ children, onClick }: DialogTriggerProps) => (
  <span onClick={onClick}>{children}</span>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger }
