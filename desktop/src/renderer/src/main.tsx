// src/main.tsx (o index.tsx)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.js'
import './assets/main.css'
import { AuthProvider } from './context/AuthContext.js' // <-- Importar

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
