// src/components/AuthScreen.tsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi' // <-- Importamos nuestro hook

export const AuthScreen = () => {
  const { login } = useAuth()
  const { request } = useApi() // <-- Instanciamos request

  const [isLogin, setIsLogin] = useState(true)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Ajustamos la ruta para que se concatene bien con la de useApi
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    const payload = isLogin ? { email, password } : { username, email, password }

    try {
      // ¡Mira qué limpio queda usando nuestro hook!
      const data = await request<any>(endpoint, {
        method: 'POST',
        body: payload
      })

      if (isLogin) {
        // MODO LOGIN: Iniciamos sesión globalmente
        login(data.token, data.user)
      } else {
        // MODO REGISTRO: Mostramos mensaje de revisar correo
        setIsEmailSent(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // --- NUEVA VISTA: Mensaje de confirmación de email ---
  if (isEmailSent) {
    return (
      <div className="flex h-screen bg-[#1e1e1e] items-center justify-center font-sans">
        <div className="bg-[#252526] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#333] text-center">
          <div className="w-16 h-16 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-900/50">
            <svg
              className="w-8 h-8 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Revisa tu correo</h2>
          <p className="text-gray-400 text-sm mb-6">
            Hemos enviado un enlace de verificación a <br />
            <span className="text-white font-medium">{email}</span>
          </p>
          <button
            onClick={() => {
              setIsEmailSent(false)
              setIsLogin(true)
            }}
            className="w-full bg-[#333] hover:bg-[#444] text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    )
  }

  // --- VISTA NORMAL (Login/Register) ---
  return (
    <div className="flex h-screen bg-[#1e1e1e] items-center justify-center font-sans">
      <div className="bg-[#252526] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#333]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100">
            {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h1>
          <p className="text-cyan-400 text-sm mt-2">Code Snippet Manager</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-300 text-sm mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-[#333] rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#333] rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#333] rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-md transition-colors mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Cargando...' : isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
            }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
