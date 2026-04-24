// src/components/CommunityDashboard.tsx
import React, { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Tag, Snippet } from '../types/models'

export const CommunityDashboard = () => {
  const { request } = useApi()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // --- NUEVOS ESTADOS ---
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)
  // Usamos un string (el ID) en lugar de un booleano para saber EXACTAMENTE qué elemento se copió
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchPublicSnippets = async (search = '') => {
    setIsLoading(true)
    try {
      const endpoint = search
        ? `/api/snippets/community?search=${search}`
        : '/api/snippets/community'
      const data = await request<Snippet[]>(endpoint)
      setSnippets(data)
    } catch (err) {
      console.error('Error fetching community snippets:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicSnippets()
  }, [request])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPublicSnippets(searchTerm)
  }

  // --- LÓGICA DE COPIADO ---
  const handleCopyCode = async (content: string, id: string, e?: React.MouseEvent) => {
    // Si el evento existe, evitamos que el click se propague hacia la tarjeta padre
    if (e) e.stopPropagation()

    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      // Reseteamos el estado de copiado después de 2 segundos
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="relative flex-1 p-8 w-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-100">Explorar Comunidad</h2>
        <p className="text-sm text-gray-400 mt-1">
          Snippets públicos compartidos por otros desarrolladores
        </p>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="Buscar por título o contenido..."
          className="flex-1 bg-[#252526] border border-[#333] text-gray-100 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="bg-[#333] hover:bg-[#444] text-white px-6 py-2 rounded-md transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Lista de Snippets */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {snippets.map((snippet) => (
            <div
              key={snippet.id}
              onClick={() => setSelectedSnippet(snippet)} // Abrir modal al hacer clic
              className="bg-[#252526] border border-[#333] p-5 rounded-xl flex flex-col group hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-900/10 transition-all cursor-pointer relative"
            >
              <div className="flex justify-between items-start mb-2 pr-8">
                <h3 className="text-lg font-medium text-gray-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {snippet.title}
                </h3>
              </div>
              <span className="text-[0.8rem] text-gray-500 italic mb-3 block">
                by @{snippet.author.username}
              </span>

              <div className="relative bg-[#1e1e1e] rounded-lg border border-[#2a2a2a] mb-4 flex-1">
                {/* BOTÓN DE COPIAR EN LA TARJETA */}
                <button
                  onClick={(e) => handleCopyCode(snippet.content, snippet.id, e)}
                  className="absolute top-2 right-2 p-1.5 bg-[#333] hover:bg-[#444] text-gray-400 hover:text-white rounded-md transition-colors border border-[#444]"
                  title="Copiar código"
                >
                  {copiedId === snippet.id ? (
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
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
                <pre className="p-3 text-xs text-gray-400 font-mono line-clamp-4 whitespace-pre-wrap mt-2">
                  {snippet.content}
                </pre>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {snippet.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[] font-medium text-cyan-400 bg-cyan-900/20 border border-cyan-900/50 px-2 py-0.5 rounded"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DE VISUALIZACIÓN --- */}
      {selectedSnippet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            {/* Header del Modal */}
            <div className="p-6 border-b border-[#333] flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold text-gray-100">{selectedSnippet.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Compartido por{' '}
                  <span className="text-cyan-400">@{selectedSnippet.author.username}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSnippet.tags.map((tag, i) => (
                    <span
                      key={i}
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
                  setCopiedId(null)
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

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto flex-1 relative group">
              {/* BOTÓN DE COPIAR EN EL MODAL */}
              <button
                onClick={() => handleCopyCode(selectedSnippet.content, selectedSnippet.id)}
                className="absolute top-8 right-8 bg-[#333] hover:bg-[#444] text-gray-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-[#444]"
              >
                {copiedId === selectedSnippet.id ? (
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
                    </svg>
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
                    </svg>
                    Copiar
                  </>
                )}
              </button>

              <pre className="bg-[#0d0d0d] border border-[#333] text-gray-300 rounded-lg p-5 overflow-x-auto font-mono text-sm shadow-inner min-h-[200px]">
                <code>{selectedSnippet.content}</code>
              </pre>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-[#333] flex justify-between items-center bg-[#252526] rounded-b-xl">
              <span className="text-xs text-gray-500">
                Publicado el: {new Date(selectedSnippet.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => setSelectedSnippet(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
