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

  return (
    <OrderTrackingView
      restaurantSlug={restaurantSlug}
      tableId={order?.tableNumber ?? "01"}
      orderId={orderId}
      trackingToken={trackingToken}
    />
  )
}
