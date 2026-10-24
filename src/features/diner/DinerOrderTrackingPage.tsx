import { useParams } from "react-router"
import { OrderTrackingView } from "./components/OrderTrackingView"
import { useOrderTrackingStore } from "@/stores/useCartStore"

export function DinerOrderTrackingPage() {
  const { restaurantSlug = "pangat" } = useParams<{
    restaurantSlug: string
    orderId: string
  }>()

  const order = useOrderTrackingStore((s) => s.order)

  return (
    <OrderTrackingView
      restaurantSlug={restaurantSlug}
      tableId={order?.tableNumber ?? "04"}
    />
  )
}
