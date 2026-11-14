import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { router } from "@/routes"
import { Toaster, toast } from "@/components/ui/toast"
import { sessionGate, subscriptionGate } from "@/lib/api"
import { useAuthStore } from "@/stores/useAuthStore"

export default function App() {
  // An expired / revoked session (password changed elsewhere, account deactivated): sign out once and explain
  useEffect(() => {
    return sessionGate.on(() => {
      if (!useAuthStore.getState().token) return
      useAuthStore.getState().logout()
      toast.info("You were signed out. Please sign in again.")
      if (!window.location.pathname.startsWith("/login")) router.navigate("/login", { replace: true })
    })
  }, [])

  // A lapsed subscription / plan limit can come back from any call: say so once, in words
  useEffect(() => subscriptionGate.on((e) => toast.error(e.message)), [])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}
