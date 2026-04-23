// En src/components/Dashboard.tsx
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PersonalWorkspace } from './PersonalWorkspace'

// Importaremos estos componentes en el siguiente paso
// import { PersonalWorkspace } from './PersonalWorkspace';
// import { CommunityExplorer } from './CommunityExplorer';

export const Dashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'personal' | 'community'>('personal')

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-gray-300 font-sans">
      {/* --- SIDEBAR PRINCIPAL --- */}
      <aside className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-lg font-bold text-gray-100">Code Snippets</h2>
          <p className="text-xs text-cyan-400 mt-1">Hola, @{user?.username}</p>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={`w-full flex items-center text-left px-3 py-2 rounded-md transition-colors ${
              activeTab === 'personal' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e]'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Mis Snippets
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`w-full flex items-center text-left px-3 py-2 rounded-md transition-colors ${
              activeTab === 'community' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e]'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            Explorar Comunidad
          </button>
        </nav>

        <div className="p-4 border-t border-[#333]">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-md transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- ÁREA DE CONTENIDO DINÁMICO --- */}
      <main className="flex-1 overflow-hidden bg-[#1e1e1e] flex">
        {activeTab === 'personal' ? (
          <PersonalWorkspace /> // <-- REEMPLAZAR EL TEXTO TEMPORAL POR ESTO
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 w-full">
            Explorador de la comunidad en construcción... 🌍
          </div>
        )}
      </main>
    </div>
  )
}
