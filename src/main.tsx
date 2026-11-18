import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/noto-sans-devanagari/400.css'
import '@fontsource/noto-sans-devanagari/600.css'
import '@fontsource/noto-sans-devanagari/700.css'
import './index.css'
import App from './App.tsx'
import { API_BASE_URL } from '@/lib/api'
import { WS_BASE_URL } from '@/lib/socket'
import { initTheme } from '@/stores/useThemeStore'

initTheme()

// Startup environment logger for local development and debugging
if (import.meta.env.DEV) {
  console.log(
    '%c[Pangat System]%c Client environment initialized',
    'color: #10b981; font-weight: bold;',
    'color: inherit;'
  )
  console.log('🌐 Target API URL:', API_BASE_URL)
  console.log('🔌 Target WebSocket URL:', WS_BASE_URL)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
