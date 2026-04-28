// src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import { PersonalWorkspace } from './PersonalWorkspace'
import { CommunityDashboard } from './CommunityDashboard'
import { Folder } from '../types/models'
import ImportButton from './ImportButton'

export const Dashboard = () => {
  const { user, logout } = useAuth()
  // Cleanly destructure only the methods we need
  const { getFolders, createFolder, deleteFolder } = useApi()

  const [activeTab, setActiveTab] = useState<'personal' | 'community'>('personal')
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const [refreshCount, setRefreshCount] = useState(0)

  // Folder Modal States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const fetchFolders = async () => {
    try {
      // Direct and strongly typed domain call
      const data = await getFolders()
      setFolders(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [getFolders]) // Updated dependency

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Direct domain call hiding the POST method and payload structure
      const newFolder = await createFolder(newFolderName)
      setFolders([newFolder, ...folders])
      setNewFolderName('')
      setIsFolderModalOpen(false)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteFolder = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la carpeta "${name}"?\n\nEsta acción eliminará permanentemente la carpeta y TODOS los snippets que contiene.`
    )

    if (!confirmDelete) return

    try {
      await deleteFolder(id)

      // Update local state: remove the folder from the list
      setFolders(folders.filter((f) => f.id !== id))

      // If we were inside the deleted folder, redirect to "All Snippets"
      if (selectedFolderId === id) {
        setSelectedFolderId(null)
      }
    } catch (err: any) {
      alert(`Error al eliminar la carpeta: ${err.message}`)
    }
  }

  return (
    <div className="flex w-full w-screen h-screen bg-[#1e1e1e] text-gray-300 font-sans">
      <aside className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
        <div className="p-4 border-b border-[#333]">
          <h2 className="text-lg font-bold text-gray-100">Code Snippets</h2>
          <p className="text-xs text-cyan-400 mt-1">@{user?.username}</p>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* GENERAL BUTTON: MY SNIPPETS */}
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

          <div className="px-2 mb-4">
            <ImportButton
              selectedFolderId={selectedFolderId}
              onImportSuccess={() => {
                // 1. Force PersonalWorkspace to re-fetch the snippets
                setRefreshCount((prev) => prev + 1)
                // 2. Force the Sidebar to re-fetch the folders to update the counters
                fetchFolders()
              }}
            />
          </div>

          {/* FOLDERS SECTION */}
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
              <div
                key={folder.id}
                className={`group flex justify-between items-center px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedFolderId === folder.id
                    ? 'bg-cyan-900/20 text-cyan-400'
                    : 'hover:bg-[#2a2d2e]'
                }`}
              >
                {/* Folder Selection Button */}
                <button
                  onClick={() => {
                    setActiveTab('personal')
                    setSelectedFolderId(folder.id)
                  }}
                  className="flex-1 flex items-center truncate mr-2 text-left"
                >
                  <svg
                    className="w-3.5 h-3.5 mr-2 opacity-70"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="truncate">{folder.name}</span>
                </button>

                {/* Counter / Delete Actions Container */}
                <div className="flex items-center shrink-0">
                  {/* Show count by default, hide on hover to show trash icon */}
                  <span className="text-[0.8rem] opacity-50 group-hover:hidden">
                    {folder._count?.snippets || 0}
                  </span>

                  {/* Delete Button: Hidden by default, shown on group hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Prevent folder selection
                      handleDeleteFolder(folder.id, folder.name)
                    }}
                    className="hidden group-hover:block text-red-500 hover:text-red-400 transition-colors"
                    title="Eliminar carpeta y contenido"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
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

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#1e1e1e]">
        {activeTab === 'personal' ? (
          <PersonalWorkspace
            key={`${selectedFolderId || 'all-snippets'}-${refreshCount}`}
            selectedFolderId={selectedFolderId}
            folders={folders}
            onWorkspaceUpdate={fetchFolders} // Refresh if a folder is created inside
          />
        ) : (
          <CommunityDashboard />
        )}
      </main>

      {/* --- CREATE FOLDER MODAL --- */}
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
