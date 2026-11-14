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

const authToken = (): string | undefined => {
  try {
    return localStorage.getItem('pangat_access_token') || undefined
  } catch {
    return undefined
  }
}

export const socket: Socket = io(WS_BASE_URL, {
  // Staff sockets prove who they are; diners connect anonymously and prove each order with its tracking token
  auth: (cb) => cb({ token: authToken() }),
  transports: ['websocket', 'polling'], // Allow fallback if WebSockets encounter proxy lag
  autoConnect: true,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1500,
})

let currentKdsSlug: string | null = null
let currentAdminSlug: string | null = null
/** orderId -> tracking token */
const activeOrderRooms = new Map<string, string | undefined>()
let connectedWithToken: string | undefined = authToken()

/** Call after sign-in / sign-out: reconnect so the handshake carries the new identity. */
export function refreshSocketAuth() {
  const t = authToken()
  if (t === connectedWithToken && socket.connected) return
  connectedWithToken = t
  if (socket.connected) socket.disconnect()
  socket.connect()
}

type JoinAck = { data?: { status?: string }; status?: string } | undefined
const denied = (ack: JoinAck) => (ack?.data?.status ?? ack?.status) === 'denied'

socket.on('connect', () => {
  console.log('⚡ Connected to Pangat WebSocket gateway:', socket.id)
  connectedWithToken = authToken()
  if (currentKdsSlug) {
    socket.emit('join:kds', { restaurantSlug: currentKdsSlug }, (ack: JoinAck) => {
      if (denied(ack)) console.warn('Kitchen feed denied: please sign in again')
    })
  }
  if (currentAdminSlug) {
    socket.emit('join:admin', { restaurantSlug: currentAdminSlug }, (ack: JoinAck) => {
      if (denied(ack)) console.warn('Live feed denied: please sign in again')
    })
  }
  for (const [orderId, token] of activeOrderRooms) {
    socket.emit('join:order', { orderId, token })
  }
})

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected from Pangat WebSocket gateway:', reason)
})

export function getSocket(): Socket {
  return socket
}

export function joinKdsRoom(restaurantSlug: string) {
  const clean = (restaurantSlug || '').trim().toLowerCase()
  if (!clean) return
  currentKdsSlug = clean
  refreshSocketAuth()
  if (socket.connected) socket.emit('join:kds', { restaurantSlug: clean })
}

export function joinAdminRoom(restaurantSlug: string) {
  const clean = (restaurantSlug || '').trim().toLowerCase()
  if (!clean) return
  currentAdminSlug = clean
  refreshSocketAuth()
  if (socket.connected) socket.emit('join:admin', { restaurantSlug: clean })
}

export function joinOrderRoom(orderId: string, trackingToken?: string) {
  if (!orderId) return
  activeOrderRooms.set(orderId, trackingToken)
  if (socket.connected) socket.emit('join:order', { orderId, token: trackingToken })
}
