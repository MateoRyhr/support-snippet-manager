import React, { useState } from 'react'

function App(): React.JSX.Element {
  // Estado simulado temporal para visualizar la UI
  const [snippets] = useState([
    { id: 1, title: 'Reset Password API', language: 'javascript' },
    { id: 2, title: 'Docker Compose Base', language: 'yaml' },
    { id: 3, title: 'Tailwind Config', language: 'json' }
  ])

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans selection:bg-cyan-600 selection:text-white">
      {/* --- SIDEBAR --- */}
      <aside className="w-1/3 max-w-sm bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-100">Snippets</h1>
          <button className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-md transition-colors shadow-sm">
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
            className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-gray-200"
          />
        </div>

        {/* Lista de Snippets */}
        <div className="flex-1 overflow-y-auto">
          {snippets.map((snippet) => (
            <div
              key={snippet.id}
              className="p-4 border-b border-gray-700/50 hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <h3 className="font-medium text-gray-200 truncate">{snippet.title}</h3>
              <p className="text-xs text-cyan-400 mt-1 uppercase tracking-wider font-mono">
                {snippet.language}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL (EDITOR) --- */}
      <main className="flex-1 flex flex-col bg-gray-900">
        {/* Header del Editor */}
        <header className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
          <input
            type="text"
            defaultValue="Reset Password API"
            className="bg-transparent text-xl font-bold text-gray-100 focus:outline-none w-full"
          />
          <button className="ml-4 flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors text-sm font-medium border border-gray-600">
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
        </header>

        {/* Área de Código */}
        <div className="flex-1 p-6 relative">
          <textarea
            className="w-full h-full bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            defaultValue={'const resetPassword = async (email) => {\n  // Tu código aquí...\n};'}
            spellCheck="false"
          />
        </div>
      </main>
    </div>
  )
}

export default App
