// src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { PersonalWorkspace } from './PersonalWorkspace'
import { CommunityDashboard } from './CommunityDashboard'
import { Folder } from '../types/models'

export const Dashboard = () => {
  const { user, logout } = useAuth()
  const { request } = useApi()

  const [activeTab, setActiveTab] = useState<'personal' | 'community'>('personal')
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  // Estados para el Modal de Carpetas
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const fetchFolders = async () => {
    try {
      const data = await request<Folder[]>('/api/folders')
      setFolders(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [request])

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newFolder = await request<Folder>('/api/folders', {
        method: 'POST',
        body: { name: newFolderName }
      })
      setFolders([newFolder, ...folders])
      setNewFolderName('')
      setIsFolderModalOpen(false)
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-gray-300 font-sans">
      <aside className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-lg font-bold text-gray-100">Code Snippets</h2>
          <p className="text-xs text-cyan-400 mt-1">@{user?.username}</p>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* BOTÓN GENERAL: MIS SNIPPETS */}
          <button
            onClick={() => {
              setActiveTab('personal')
              setSelectedFolderId(null)
            }}
            className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
              activeTab === 'personal' && !selectedFolderId
                ? 'bg-[#37373d] text-white'
                : 'hover:bg-[#2a2d2e]'
            }`}
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Todos mis Snippets
          </button>

          {/* SECCIÓN CARPETAS */}
          <div className="mt-4 mb-2 px-3 flex justify-between items-center">
            <span className="text-[0.8rem] font-bold text-gray-500 uppercase tracking-widest">
              Carpetas
            </span>
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="text-gray-500 hover:text-cyan-400 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-0.5 ml-2">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setActiveTab('personal')
                  setSelectedFolderId(folder.id)
                }}
                className={`w-full flex justify-between items-center px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedFolderId === folder.id
                    ? 'bg-cyan-900/20 text-cyan-400'
                    : 'hover:bg-[#2a2d2e]'
                }`}
              >
                <span className="truncate flex items-center">
                  <svg
                    className="w-3.5 h-3.5 mr-2 opacity-70"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  {folder.name}
                </span>
                <span className="text-[0.8rem] opacity-50">{folder._count?.snippets || 0}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#333] mt-4">
            <button
              onClick={() => {
                setActiveTab('community')
                setSelectedFolderId(null)
              }}
              className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                activeTab === 'community' ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e]'
              }`}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              Comunidad
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-[#333]">
          <button
            onClick={logout}
            className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-md transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden bg-[#1e1e1e] flex">
        {activeTab === 'personal' ? (
          <PersonalWorkspace
            selectedFolderId={selectedFolderId}
            folders={folders}
            onFolderCreated={fetchFolders} // Refrescar si se crea una carpeta desde dentro
          />
        ) : (
          <CommunityDashboard />
        )}
      </main>

      {/* --- MODAL CREAR CARPETA --- */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Nueva Carpeta</h3>
            <form onSubmit={handleCreateFolder}>
              <input
                autoFocus
                type="text"
                placeholder="Nombre de la carpeta (ej: Proyectos Godot)"
                className="w-full bg-[#252526] border border-[#333] text-white rounded-md px-4 py-2 focus:border-cyan-500 outline-none mb-4"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="text-sm text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-md text-sm font-medium"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
