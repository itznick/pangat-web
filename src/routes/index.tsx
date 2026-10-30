import { createBrowserRouter, Navigate } from "react-router"
import { LandingPage } from "@/features/landing"
import { LoginPage } from "@/features/auth/LoginPage"
import { KdsPinLoginPage } from "@/features/auth/KdsPinLoginPage"
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary"
import { SuperAdminLayout, SuperAdminDashboardPage } from "@/features/super-admin"

// Diner
import { DinerMenuPage, DinerOrderTrackingPage } from "@/features/diner"

// KDS
import { KDSPage } from "@/features/kds"

// Admin
import {
  AdminLayout,
  AdminDashboardPage,
  AdminTablesPage,
  AdminMenuPage,
  AdminOrdersPage,
  AdminFeedbackPage,
  AdminSettingsPage,
} from "@/features/admin"

export const router = createBrowserRouter([
  // ─── Public / Landing ────────────────────────────────────────────────────
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/onboarding",
    element: <Navigate to="/?demo=true" replace />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/kds-login",
    element: <KdsPinLoginPage />,
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
    element: <SuperAdminLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <SuperAdminDashboardPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },

  // ─── Diner Flow ──────────────────────────────────────────────────────────
  {
    path: "/r/:restaurantSlug",
    element: <DinerMenuPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/r/:restaurantSlug/t/:tableId",
    element: <DinerMenuPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/r/:restaurantSlug/order/:orderId",
    element: <DinerOrderTrackingPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // ─── KDS (Kitchen Display System) ────────────────────────────────────────
  {
    path: "/kds/:restaurantSlug",
    element: <KDSPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // ─── Admin Portal (wrapped in AdminLayout with sidebar) ──────────────────
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboardPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "tables",
        element: <AdminTablesPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "menu",
        element: <AdminMenuPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "orders",
        element: <AdminOrdersPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "feedback",
        element: <AdminFeedbackPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings",
        element: <AdminSettingsPage />,
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
