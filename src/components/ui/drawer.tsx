import * as React from "react"
import { cn } from "@/lib/utils"

// Drawer / Sheet - bottom sheet implementation
interface DrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

const Drawer = ({ open, onClose, children, className }: DrawerProps) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-zinc-900 border-t border-zinc-800 shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-zinc-700 mb-4" />
        {children}
      </div>
    </>
  )
}

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-4 pb-2", className)} {...props} />
)

const DrawerTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold text-zinc-100", className)} {...props} />
)

const DrawerDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-zinc-400", className)} {...props} />
)

const DrawerContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-4", className)} {...props} />
)

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-4 pt-2 pb-6", className)} {...props} />
)

export { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter }
