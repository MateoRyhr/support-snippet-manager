// src/components/PersonalWorkspace.tsx
import React, { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Folder, Snippet } from '../types/models'

interface Props {
  selectedFolderId: string | null
  folders: Folder[]
  onFolderCreated: () => void
}

export const PersonalWorkspace = ({ selectedFolderId, folders, onFolderCreated }: Props) => {
  const { request } = useApi()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // View Modal States
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)
  const [hasCopied, setHasCopied] = useState(false)

  // Form Modal States (Shared for Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null) // NUEVO: Estado de edición

  // Actualizamos el formData para incluir folderId
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isPublic: false,
    folderId: '' // <-- Nuevo campo en el form
  })

  useEffect(() => {
    let ignore = false

    const fetchSnippets = async () => {
      setIsLoading(true) // 1. Mostramos el spinner inmediatamente

      try {
        const url = selectedFolderId
          ? `/api/snippets?folderId=${selectedFolderId}`
          : '/api/snippets'

        const data = await request<Snippet[]>(url)

        if (!ignore) {
          setSnippets(data)
        }
      } catch (err) {
        if (!ignore) console.error(err)
      } finally {
        if (!ignore) setIsLoading(false) // 2. Quitamos el spinner
      }
    }

    fetchSnippets()

    return () => {
      ignore = true
    }
  }, [request, selectedFolderId])

  // En el Form de creación:
  // Añade este bloque antes de los botones de Guardar/Cancelar

  /* JSX para el select de carpeta en el Modal */
  ;<div>
    <label className="block text-sm font-medium text-gray-300 mb-1">Carpeta</label>
    <select
      className="bg-[#252526] border border-[#333] text-gray-100 rounded-md px-4 py-2 focus:border-cyan-500 outline-none"
      value={formData.folderId}
      onChange={(e) => setFormData({ ...formData, folderId: e.target.value })}
    >
      <option value="">Sin carpeta (Sueltos)</option>
      {folders.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  </div>

  const handleOpenEdit = () => {
    if (!selectedSnippet) return

    setFormData({
      title: selectedSnippet.title,
      content: selectedSnippet.content,
      tags: selectedSnippet.tags.map((t) => t.name).join(', '),
      isPublic: selectedSnippet.isPublic,
      folderId: selectedSnippet.folderId || '' // <-- Añadimos esto
    })

    setEditingId(selectedSnippet.id)
    setSelectedSnippet(null)
    setIsModalOpen(true)
  }

  // NUEVA FUNCIÓN: Abrir modal de creación
  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      title: '',
      content: '',
      tags: '',
      isPublic: false,
      folderId: selectedFolderId || '' // <-- Pre-selecciona la carpeta en la que estás
    })
    setIsModalOpen(true)
  }

  // --- NUEVA FUNCIÓN: Cerrar formulario y limpiar ---
  const handleCloseForm = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setFormData({ title: '', content: '', tags: '', isPublic: false })
  }

  // --- ACTUALIZADO: Manejar Create y Update ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '')

      const payload = {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        isPublic: formData.isPublic,
        folderId: formData.folderId || null
      }

      if (editingId) {
        // MODO EDICIÓN
        const updatedSnippet = await request<Snippet>(`/api/snippets/${editingId}`, {
          method: 'PUT',
          body: payload
        })
        // Actualizamos el snippet modificado en nuestra lista local
        setSnippets(snippets.map((s) => (s.id === editingId ? updatedSnippet : s)))
      } else {
        // MODO CREACIÓN
        const newSnippet = await request<Snippet>('/api/snippets', {
          method: 'POST',
          body: payload
        })
        setSnippets([newSnippet, ...snippets])
        onFolderCreated()
      }

      handleCloseForm()
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy to Clipboard Logic
  const handleCopyCode = async () => {
    if (!selectedSnippet) return
    try {
      await navigator.clipboard.writeText(selectedSnippet.content)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Delete Logic
  const handleDeleteSnippet = async (id: string) => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar este snippet? Esta acción no se puede deshacer.'
    )
    if (!confirmDelete) return

    try {
      await request(`/api/snippets/${id}`, { method: 'DELETE' })
      setSnippets(snippets.filter((s) => s.id !== id))
      setSelectedSnippet(null)
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-red-400 w-full">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="relative p-8 h-full w-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Mis Snippets</h2>
          <p className="text-sm text-gray-400 mt-1">Administra tu código y configuraciones</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md transition-colors font-medium flex items-center gap-2 shadow-lg shadow-cyan-900/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Snippet
        </button>
      </div>

      {/* Snippets Grid */}
      {snippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#333] rounded-xl bg-[#252526]/50">
          <svg
            className="w-16 h-16 text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <p className="text-gray-400 font-medium">Aún no tienes snippets guardados.</p>
          <p className="text-sm text-gray-500 mt-2">Haz clic en "Nuevo Snippet" para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {snippets.map((snippet) => (
            <div
              key={snippet.id}
              onClick={() => setSelectedSnippet(snippet)}
              className="bg-[#252526] border border-[#333] p-5 rounded-xl hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-900/10 transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {snippet.title}
                </h3>
                {snippet.isPublic && (
                  <span className="text-[10px] bg-green-900/30 text-green-400 px-2.5 py-1 rounded-full border border-green-900/50 uppercase tracking-wider font-semibold ml-2 shrink-0">
                    Público
                  </span>
                )}
              </div>

              <div className="bg-[#1e1e1e] p-3 rounded-lg flex-1 mb-4 border border-[#2a2a2a]">
                <pre className="text-sm text-gray-400 line-clamp-3 font-mono whitespace-pre-wrap">
                  {snippet.content}
                </pre>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {snippet.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[0.8rem] font-medium text-cyan-400 bg-cyan-900/20 border border-cyan-900/50 px-2 py-0.5 rounded"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW SNIPPET MODAL */}
      {selectedSnippet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#333] flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-100">{selectedSnippet.title}</h3>
                  {selectedSnippet.isPublic && (
                    <span className="text-[0.6rem] bg-green-900/30 text-green-400 px-2.5 py-1 rounded-full border border-green-900/50 uppercase tracking-wider font-semibold">
                      Público
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSnippet.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs font-medium text-cyan-400 bg-cyan-900/20 border border-cyan-900/50 px-2 py-1 rounded-md"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSnippet(null)
                  setHasCopied(false)
                }}
                className="text-gray-400 hover:text-white transition-colors bg-[#252526] p-2 rounded-lg border border-[#333]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 relative group">
              <button
                onClick={handleCopyCode}
                className="absolute top-8 right-8 bg-[#333] hover:bg-[#444] text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-[#444]"
              >
                {hasCopied ? (
                  <>
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>{' '}
                    Copiado!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>{' '}
                    Copiar
                  </>
                )}
              </button>

              <pre className="bg-[#0d0d0d] border border-[#333] text-gray-300 rounded-lg p-5 overflow-x-auto font-mono text-sm shadow-inner min-h-[200px]">
                <code>{selectedSnippet.content}</code>
              </pre>
            </div>

            <div className="p-6 border-t border-[#333] flex justify-between items-center bg-[#252526] rounded-b-xl">
              <span className="text-xs text-gray-500">
                Creado el: {new Date(selectedSnippet.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteSnippet(selectedSnippet.id)}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-md transition-colors border border-transparent hover:border-red-900/50"
                >
                  Eliminar
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#333] hover:bg-[#444] rounded-md transition-colors border border-[#444]"
                  onClick={handleOpenEdit} // NUEVO: Llamamos a la función de edición
                >
                  Editar Snippet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARED CREATE/EDIT SNIPPET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#333] flex justify-between items-center">
              {/* Título Dinámico */}
              <h3 className="text-xl font-bold text-gray-100">
                {editingId ? 'Editar Snippet' : 'Crear Nuevo Snippet'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Conexión base de datos PostgreSQL"
                  className="w-full bg-[#252526] border border-[#333] text-gray-100 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">Código</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Pega tu código aquí..."
                  className="w-full bg-[#252526] border border-[#333] text-gray-100 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors font-mono text-sm resize-y"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tags (separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="node, express, prisma"
                  className="w-full bg-[#252526] border border-[#333] text-gray-100 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 bg-[#252526] p-3 rounded-md border border-[#333]">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="w-5 h-5 accent-cyan-500 bg-[#1e1e1e] border-[#333] rounded cursor-pointer"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
                <label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-gray-300 cursor-pointer select-none"
                >
                  Hacer público en la comunidad
                </label>
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-[#333]">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-colors font-medium flex items-center gap-2"
                >
                  {/* Texto de botón Dinámico */}
                  {isSubmitting
                    ? 'Guardando...'
                    : editingId
                      ? 'Actualizar Snippet'
                      : 'Guardar Snippet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
