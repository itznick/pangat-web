import { io, Socket } from 'socket.io-client'

const rawWsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:4000'
export const WS_BASE_URL = rawWsUrl.replace(/\/+$/, '')
export const WS_URL = WS_BASE_URL

export const socket: Socket = io(WS_BASE_URL, {
  transports: ['websocket', 'polling'], // Allow fallback if WebSockets encounter proxy lag
  autoConnect: true,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
})

socket.on('connect', () => {
  console.log('⚡ Connected to Pangat WebSocket gateway:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected from Pangat WebSocket gateway:', reason)
})

export function getSocket(): Socket {
  return socket
}

export function joinKdsRoom(restaurantSlug: string = 'pangat') {
  socket.emit('join:kds', { restaurantSlug })
}

export function joinOrderRoom(orderId: string) {
  socket.emit('join:order', { orderId })
}
