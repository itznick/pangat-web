import { useEffect } from "react"
import { useParams, useSearchParams } from "react-router"
import { OrderTrackingView } from "./components/OrderTrackingView"
import { useOrderTrackingStore } from "@/stores/useCartStore"

export function DinerOrderTrackingPage() {
  const { restaurantSlug = "pangat", orderId } = useParams<{
    restaurantSlug: string
    orderId: string
  }>()
  const [searchParams] = useSearchParams()
  const trackingToken = searchParams.get("token") || undefined

  const order = useOrderTrackingStore((s) => s.order)
  const clear = useOrderTrackingStore((s) => s.clear)

  // The browser remembers the last order it placed. A link to a different order (or another restaurant) must show THAT order,
  // never the remembered one, so forget it and let the tracker load the one in the link.
  const remembered = order && orderId && (order.id !== orderId || (order.restaurantSlug && order.restaurantSlug !== restaurantSlug))
  useEffect(() => {
    if (remembered) clear()
  }, [remembered, clear])
  if (remembered) return null

  // only a table order belongs to a table; takeaway and delivery have none
  const tableId = order?.tableNumber && order.orderType !== "TAKEAWAY" && order.orderType !== "DELIVERY" ? order.tableNumber : undefined

  return (
    <OrderTrackingView
      key={orderId}
      restaurantSlug={restaurantSlug}
      tableId={tableId}
      orderId={orderId}
      trackingToken={trackingToken}
    />
  )
}
