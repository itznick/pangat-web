import { createBrowserRouter, Navigate } from "react-router"
import { LandingPage } from "@/features/landing"

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
  },

  // ─── Diner Flow ──────────────────────────────────────────────────────────
  {
    path: "/r/:restaurantSlug/t/:tableId",
    element: <DinerMenuPage />,
  },
  {
    path: "/r/:restaurantSlug/order/:orderId",
    element: <DinerOrderTrackingPage />,
  },

  // ─── KDS (Kitchen Display System) ────────────────────────────────────────
  {
    path: "/kds/:restaurantSlug",
    element: <KDSPage />,
  },

  // ─── Admin Portal (wrapped in AdminLayout with sidebar) ──────────────────
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "tables",
        element: <AdminTablesPage />,
      },
      {
        path: "menu",
        element: <AdminMenuPage />,
      },
      {
        path: "orders",
        element: <AdminOrdersPage />,
      },
      {
        path: "settings",
        element: <AdminSettingsPage />,
      },
    ],
  },

  // ─── Fallback ─────────────────────────────────────────────────────────────
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
