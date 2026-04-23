// src/App.tsx
import React from 'react'
import { useAuth } from './context/AuthContext'
import { AuthScreen } from './components/AuthScreen'
import { Dashboard } from './components/Dashboard'

function App(): React.JSX.Element {
  const { token } = useAuth()

  // Guardián de Rutas: Sin token, no hay paraíso.
  if (!token) {
    return <AuthScreen />
  }

  // Si hay token, renderizamos la app principal
  return <Dashboard />
}

export default App
