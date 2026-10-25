import { createBrowserRouter, Navigate } from "react-router"
import { LandingPage } from "@/features/landing"
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary"

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
  AdminSettingsPage,
} from "@/features/admin"

export const router = createBrowserRouter([
  // ─── Public / Landing ────────────────────────────────────────────────────
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // ─── Diner Flow ──────────────────────────────────────────────────────────
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
