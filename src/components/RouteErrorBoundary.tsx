import { useRouteError, isRouteErrorResponse, Link } from "react-router"
import { AlertCircle, RefreshCw, Home, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export function RouteErrorBoundary() {
  const error = useRouteError()

  let title = "Unexpected Application Error"
  let message = "An unhandled exception occurred in the application."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    message = error.data?.message || "The requested view or resource was not found."
  } else if (error instanceof Error) {
    message = error.message
    stack = error.stack
  } else if (typeof error === "string") {
    message = error
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 shadow-xl shadow-rose-500/5">
        <ShieldAlert className="h-8 w-8 text-rose-400" />
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 border border-rose-500/30 text-rose-300 mb-3">
        Runtime Error Caught
      </span>

      <h1 className="text-xl md:text-2xl font-bold text-zinc-100 mb-2">{title}</h1>
      <p className="text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">{message}</p>

      {stack && (
        <div className="w-full max-w-2xl text-left mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-b-0 border-zinc-800 rounded-t-xl text-xs font-mono text-zinc-400">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            Stack trace details
          </div>
          <pre className="max-h-48 overflow-auto text-xs bg-zinc-900/90 border border-zinc-800 text-zinc-400 p-4 rounded-b-xl font-mono whitespace-pre-wrap selection:bg-rose-500/30">
            {stack}
          </pre>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={() => window.location.reload()}
          className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
        >
          <RefreshCw className="h-4 w-4" />
          Reload Station
        </Button>
        <Button asChild variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <Link to="/">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
