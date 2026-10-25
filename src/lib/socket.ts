import { io, Socket } from 'socket.io-client'

export const WS_URL =
  import.meta.env.VITE_WS_URL || 'http://localhost:4000'

let socketInstance: Socket | null = null

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to Pangat WebSocket gateway:', socketInstance?.id)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Pangat WebSocket gateway:', reason)
    })
  }

  return socketInstance
}

export function joinKdsRoom(restaurantSlug: string = 'pangat') {
  const socket = getSocket()
  socket.emit('join:kds', { restaurantSlug })
}

export function joinOrderRoom(orderId: string) {
  const socket = getSocket()
  socket.emit('join:order', { orderId })
}
