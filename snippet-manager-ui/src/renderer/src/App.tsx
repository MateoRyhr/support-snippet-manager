import React, { useState, useEffect } from 'react'

// Define el tipo de tu Snippet basado en lo que esperarías de Prisma
interface Snippet {
  id: string | number
  title: string
  language: string
  content: string
}

// Ajusta el puerto de acuerdo a donde esté corriendo tu API de Express
const API_URL = 'http://localhost:3000/snippets'

function App(): React.JSX.Element {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Estado para el contenido editado temporalmente (antes de guardar)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // 1. CARGAR SNIPPETS AL INICIO (GET /)
  useEffect(() => {
    // Flag para evitar actualizar estados si el componente llega a desmontarse
    // (una buena práctica para evitar memory leaks)
    let isMounted = true

    const loadInitialSnippets = async (): Promise<void> => {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()

        if (isMounted) {
          setSnippets(data)
          // Si hay datos, auto-seleccionamos el primero directamente
          if (data.length > 0) {
            setSelectedSnippet(data[0])
            setEditTitle(data[0].title)
            setEditContent(data[0].content || '')
          }
        }
      } catch (error) {
        console.error('Error fetching snippets:', error)
      }
    }

    loadInitialSnippets()

    // Función de limpieza (cleanup) del effect
    return () => {
      isMounted = false
    }
  }, []) // Array vacío: solo se ejecuta una vez al montar el componente

  // Función auxiliar para seleccionar y preparar el editor
  const selectSnippet = (snippet: Snippet): void => {
    setSelectedSnippet(snippet)
    setEditTitle(snippet.title)
    setEditContent(snippet.content || '')
  }

  // 2. CREAR SNIPPET (POST /)
  const handleCreate = async (): Promise<void> => {
    const newSnippet = {
      title: 'Nuevo Snippet',
      language: 'texto',
      content: '// Escribe tu código aquí...'
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSnippet)
      })
      const createdSnippet = await res.json()
      setSnippets([...snippets, createdSnippet])
      selectSnippet(createdSnippet)
    } catch (error) {
      console.error('Error creating snippet:', error)
    }
  }

  // 3. ACTUALIZAR SNIPPET (PATCH /:id)
  const handleSave = async (): Promise<void> => {
    if (!selectedSnippet) return

    try {
      const res = await fetch(`${API_URL}/${selectedSnippet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent
          // language: 'podrías agregar un selector de lenguaje luego'
        })
      })

      const updatedSnippet = await res.json()

      // Actualizamos la lista local
      setSnippets(snippets.map((s) => (s.id === updatedSnippet.id ? updatedSnippet : s)))
      setSelectedSnippet(updatedSnippet)
      alert('¡Guardado correctamente!')
    } catch (error) {
      console.error('Error updating snippet:', error)
    }
  }

  // 4. ELIMINAR SNIPPET (DELETE /:id)
  const handleDelete = async (): Promise<void> => {
    if (!selectedSnippet) return

    if (!window.confirm('¿Seguro que deseas eliminar este snippet?')) return

    try {
      await fetch(`${API_URL}/${selectedSnippet.id}`, { method: 'DELETE' })
      const updatedList = snippets.filter((s) => s.id !== selectedSnippet.id)
      setSnippets(updatedList)

      // Seleccionar otro snippet si quedan
      if (updatedList.length > 0) {
        selectSnippet(updatedList[0])
      } else {
        setSelectedSnippet(null)
      }
    } catch (error) {
      console.error('Error deleting snippet:', error)
    }
  }

  // 5. COPIAR AL PORTAPAPELES
  const handleCopy = async (): Promise<void> => {
    if (!editContent) return
    try {
      await navigator.clipboard.writeText(editContent)
      // Podrías poner un toast notification aquí en lugar de un alert
    } catch (err) {
      console.error('Fallo al copiar!', err)
    }
  }

  // 6. BUSCADOR EN TIEMPO REAL
  const filteredSnippets = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.language.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans selection:bg-cyan-600 selection:text-white">
      {/* --- SIDEBAR --- */}
      <aside className="w-1/3 max-w-sm bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-100">Snippets</h1>
          <button
            onClick={handleCreate}
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-md transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </button>
        </div>

        {/* Barra de Búsqueda */}
        <div className="p-3">
          <input
            type="text"
            placeholder="Buscar snippet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-200"
          />
        </div>

        {/* Lista de Snippets */}
        <div className="flex-1 overflow-y-auto">
          {filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              onClick={() => selectSnippet(snippet)}
              className={`p-4 border-b border-gray-700/50 cursor-pointer transition-colors ${
                selectedSnippet?.id === snippet.id
                  ? 'bg-gray-700 border-l-4 border-l-cyan-500'
                  : 'hover:bg-gray-750'
              }`}
            >
              <h3 className="font-medium text-gray-200 truncate">{snippet.title}</h3>
              <p className="text-xs text-cyan-400 mt-1 uppercase tracking-wider font-mono">
                {snippet.language}
              </p>
            </div>
          ))}
          {filteredSnippets.length === 0 && (
            <p className="text-gray-500 text-center text-sm p-4">No hay resultados</p>
          )}
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL (EDITOR) --- */}
      <main className="flex-1 flex flex-col bg-gray-900">
        {selectedSnippet ? (
          <>
            {/* Header del Editor */}
            <header className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-transparent text-xl font-bold text-gray-100 focus:outline-none w-full"
              />
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-900/30 hover:bg-red-800/50 text-red-400 px-3 py-2 rounded-md transition-colors text-sm font-medium border border-red-900/50"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-cyan-700 hover:bg-cyan-600 px-4 py-2 rounded-md transition-colors text-sm font-medium text-white border border-cyan-600"
                >
                  <span>Guardar</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors text-sm font-medium border border-gray-600"
                >
                  <span>Copiar</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    ></path>
                  </svg>
                </button>
              </div>
            </header>

            {/* Área de Código */}
            <div className="flex-1 p-6 relative">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                spellCheck="false"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Selecciona un snippet o crea uno nuevo para empezar</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
