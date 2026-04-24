// src/App.tsx
import React, { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'
import { VerifyScreen } from './components/VerifyScreen' // 1. Importamos la nueva pantalla

function App(): React.JSX.Element {
  const { token } = useAuth()

  // 2. Leemos la ruta actual al cargar la aplicación
  const [currentPath] = useState(window.location.pathname)

  // --- LÓGICA DE ZOOM GLOBAL ---
  useEffect(() => {
    // 16px es el tamaño estándar por defecto de los navegadores
    let currentBaseSize = 16

    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitamos interferir si no están presionando Control (o Command en Mac)
      if (!e.ctrlKey && !e.metaKey) return

      // Aumentar Zoom (Ctrl + '+' o Ctrl + '=')
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        currentBaseSize = Math.min(currentBaseSize + 2, 32)
        document.documentElement.style.fontSize = `${currentBaseSize}px`
      }

      // Disminuir Zoom (Ctrl + '-')
      if (e.key === '-') {
        e.preventDefault()
        currentBaseSize = Math.max(currentBaseSize - 2, 10)
        document.documentElement.style.fontSize = `${currentBaseSize}px`
      }

      // Resetear Zoom (Ctrl + '0')
      if (e.key === '0') {
        e.preventDefault()
        currentBaseSize = 16
        document.documentElement.style.fontSize = `${currentBaseSize}px`
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // --- 3. NUESTRO ROUTER MANUAL ---
  // Si la URL termina en /verify, mostramos la pantalla de verificación,
  // sin importar si hay token o no.
  if (currentPath === '/verify') {
    return <VerifyScreen />
  }

  // Guardián de Rutas: Sin token, no hay paraíso.
  if (!token) {
    return <AuthScreen />
  }

  // Si hay token, renderizamos la app principal
  return <Dashboard />
}

export default App
