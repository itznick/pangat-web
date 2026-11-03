import { lazy, Suspense } from "react"
import { createBrowserRouter, Navigate } from "react-router"
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary"

const PageLoadingFallback = () => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      <span className="text-xs text-zinc-500 font-mono">Loading Pangat...</span>
    </div>
  </div>
)

const Lazy = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Component />
  </Suspense>
)

// Landing & Auth
const LandingPage = lazy(() => import("@/features/landing").then((m) => ({ default: m.LandingPage })))
const LoginPage = lazy(() => import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })))
const KdsPinLoginPage = lazy(() => import("@/features/auth/KdsPinLoginPage").then((m) => ({ default: m.KdsPinLoginPage })))

// Super Admin
const SuperAdminLayout = lazy(() => import("@/features/super-admin").then((m) => ({ default: m.SuperAdminLayout })))
const SuperAdminDashboardPage = lazy(() => import("@/features/super-admin").then((m) => ({ default: m.SuperAdminDashboardPage })))

// Diner Flow
const DinerMenuPage = lazy(() => import("@/features/diner").then((m) => ({ default: m.DinerMenuPage })))
const DinerOrderTrackingPage = lazy(() => import("@/features/diner").then((m) => ({ default: m.DinerOrderTrackingPage })))

// KDS Station
const KDSPage = lazy(() => import("@/features/kds").then((m) => ({ default: m.KDSPage })))

// Merchant Admin Portal
const AdminLayout = lazy(() => import("@/features/admin").then((m) => ({ default: m.AdminLayout })))
const AdminDashboardPage = lazy(() => import("@/features/admin").then((m) => ({ default: m.AdminDashboardPage })))
const AdminTablesPage = lazy(() => import("@/features/admin").then((m) => ({ default: m.AdminTablesPage })))
const AdminMenuPage = lazy(() => import("@/features/admin").then((m) => ({ default: m.AdminMenuPage })))
const AdminOrdersPage = lazy(() => import("@/features/admin").then((m) => ({ default: m.AdminOrdersPage })))
const AdminFeedbackPage = lazy(() => import("@/features/admin").then((m) => ({ default: m.AdminFeedbackPage })))
const AdminSettingsPage = lazy(() => import("@/features/admin").then((m) => ({ default: m.AdminSettingsPage })))
const AdminInventoryPage = lazy(() => import("@/features/inventory").then((m) => ({ default: m.AdminInventoryPage })))
const AdminSubscriptionPage = lazy(() => import("@/features/subscriptions").then((m) => ({ default: m.AdminSubscriptionPage })))

export const router = createBrowserRouter([
  // ─── Public / Landing ────────────────────────────────────────────────────
  {
    path: "/",
    element: Lazy(LandingPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/onboarding",
    element: <Navigate to="/?demo=true" replace />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: Lazy(LoginPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/kds-login",
    element: Lazy(KdsPinLoginPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/signup",
    element: <Navigate to="/?demo=true" replace />,
    errorElement: <RouteErrorBoundary />,
  },

  // ─── Super-Admin / Platform Operations Portal ────────────────────────────
  {
    path: "/super-admin",
    element: Lazy(SuperAdminLayout),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: Lazy(SuperAdminDashboardPage),
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },

  // ─── Diner Flow ──────────────────────────────────────────────────────────
  {
    path: "/r/:restaurantSlug",
    element: Lazy(DinerMenuPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/r/:restaurantSlug/t/:tableId",
    element: Lazy(DinerMenuPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/r/:restaurantSlug/order/:orderId",
    element: Lazy(DinerOrderTrackingPage),
    errorElement: <RouteErrorBoundary />,
  },

  // ─── KDS (Kitchen Display System) ────────────────────────────────────────
  {
    path: "/kds/:restaurantSlug",
    element: Lazy(KDSPage),
    errorElement: <RouteErrorBoundary />,
  },

  // ─── Admin Portal (wrapped in AdminLayout with sidebar) ──────────────────
  {
    path: "/admin",
    element: Lazy(AdminLayout),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: Lazy(AdminDashboardPage),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "tables",
        element: Lazy(AdminTablesPage),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "menu",
        element: Lazy(AdminMenuPage),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "orders",
        element: Lazy(AdminOrdersPage),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "inventory",
        element: Lazy(AdminInventoryPage),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "subscription",
        element: Lazy(AdminSubscriptionPage),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "feedback",
        element: Lazy(AdminFeedbackPage),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings",
        element: Lazy(AdminSettingsPage),
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
