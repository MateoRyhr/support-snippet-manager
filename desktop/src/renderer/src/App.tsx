// src/App.tsx
import React, { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'

function App(): React.JSX.Element {
  const { token } = useAuth()

  // --- LÓGICA DE ZOOM GLOBAL ---
  useEffect(() => {
    // 16px es el tamaño estándar por defecto de los navegadores
    let currentBaseSize = 16

    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitamos interferir si no están presionando Control (o Command en Mac)
      if (!e.ctrlKey && !e.metaKey) return

      // Aumentar Zoom (Ctrl + '+' o Ctrl + '=')
      // (Se incluye '=' porque en muchos teclados el '+' requiere presionar Shift)
      if (e.key === '+' || e.key === '=') {
        e.preventDefault() // Evitamos el comportamiento por defecto del navegador
        currentBaseSize = Math.min(currentBaseSize + 2, 32) // Límite máximo: 32px
        document.documentElement.style.fontSize = `${currentBaseSize}px`
      }

      // Disminuir Zoom (Ctrl + '-')
      if (e.key === '-') {
        e.preventDefault()
        currentBaseSize = Math.max(currentBaseSize - 2, 10) // Límite mínimo: 10px
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

    // Limpieza del event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Guardián de Rutas: Sin token, no hay paraíso.
  if (!token) {
    return <AuthScreen />
  }

  // Si hay token, renderizamos la app principal
  return <Dashboard />
}

export default App
