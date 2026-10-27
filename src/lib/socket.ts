import { io, Socket } from 'socket.io-client'

export function resolveWsBaseUrl(): string {
  const envWs = import.meta.env.VITE_WS_URL?.trim();
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';

    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local') ||
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

    if (isLocalHost && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (envWs && (envWs.includes('localhost') || envWs.includes('127.0.0.1'))) {
        return envWs
          .replace(/\b(localhost|127\.0\.0\.1)\b/g, hostname)
          .replace(/\/+$/, '');
      }
      return `${protocol}//${hostname}:4000`;
    }

    if (!isLocalHost) {
      if (envWs && !envWs.includes('localhost') && !envWs.includes('127.0.0.1')) {
        return envWs.replace(/\/+$/, '');
      }
      return 'https://pangat-api.onrender.com';
    }
  }

  if (envWs) {
    return envWs.replace(/\/+$/, '');
  }

  return 'http://localhost:4000';
}

export const WS_BASE_URL = resolveWsBaseUrl()
export const WS_URL = WS_BASE_URL

export const socket: Socket = io(WS_BASE_URL, {
  transports: ['websocket', 'polling'], // Allow fallback if WebSockets encounter proxy lag
  autoConnect: true,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1500,
})

let currentKdsSlug: string | null = null
let currentAdminSlug: string | null = null
const activeOrderRooms = new Set<string>()

socket.on('connect', () => {
  console.log('⚡ Connected to Pangat WebSocket gateway:', socket.id)
  if (currentKdsSlug) {
    socket.emit('join:kds', { restaurantSlug: currentKdsSlug })
  }
  if (currentAdminSlug) {
    socket.emit('join:admin', { restaurantSlug: currentAdminSlug })
  }
  for (const orderId of activeOrderRooms) {
    socket.emit('join:order', { orderId })
  }
})

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected from Pangat WebSocket gateway:', reason)
})

export function getSocket(): Socket {
  return socket
}

export function joinKdsRoom(restaurantSlug: string = 'pangat') {
  const clean = (restaurantSlug || 'pangat').trim().toLowerCase()
  currentKdsSlug = clean
  socket.emit('join:kds', { restaurantSlug: clean })
}

export function joinAdminRoom(restaurantSlug: string = 'pangat') {
  const clean = (restaurantSlug || 'pangat').trim().toLowerCase()
  currentAdminSlug = clean
  socket.emit('join:admin', { restaurantSlug: clean })
}

export function joinOrderRoom(orderId: string) {
  if (!orderId) return
  activeOrderRooms.add(orderId)
  socket.emit('join:order', { orderId })
}
