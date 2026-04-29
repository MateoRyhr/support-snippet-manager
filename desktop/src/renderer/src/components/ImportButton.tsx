import { useState } from 'react'
import { useApi } from '../hooks/useApi'

interface ImportButtonProps {
  selectedFolderId: string | null
  onImportSuccess: () => void
}

export default function ImportButton({ selectedFolderId, onImportSuccess }: ImportButtonProps) {
  const { createSnippet } = useApi()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const [importMode, setImportMode] = useState<'directory' | 'files'>('directory')
  const [extensionsInput, setExtensionsInput] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  // NUEVO ESTADO: Recursividad
  const [isRecursive, setIsRecursive] = useState(false)

  const handleExecuteImport = async () => {
    try {
      setIsImporting(true)

      const extensions = extensionsInput
        .split(',')
        .map((ext) => ext.trim().toLowerCase())
        .filter((ext) => ext !== '')
        .map((ext) => (ext.startsWith('.') ? ext : `.${ext}`))

      // PASAMOS EL PARÁMETRO RECURSIVO A ELECTRON
      const files = await window.api.importFiles({
        mode: importMode,
        extensions: extensions,
        recursive: isRecursive
      })

      if (files.length === 0) {
        setIsImporting(false)
        setIsModalOpen(false)
        alert('No se encontraron archivos válidos para importar.')
        return
      }

      await Promise.all(
        files.map((file) =>
          createSnippet({
            title: file.title,
            content: file.content,
            tags: [file.language],
            folderId: selectedFolderId,
            language: file.language,
            isPublic: isPublic
          })
        )
      )

      setIsModalOpen(false)
      onImportSuccess()
      alert(`¡${files.length} snippets importados con éxito!`)
    } catch (error) {
      console.error('Error al importar:', error)
      alert('Hubo un error al importar los archivos.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full flex justify-center items-center gap-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 px-4 py-2 rounded-md border border-cyan-900/50 transition-colors mt-2 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Importar Archivos
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-[#1e1e1e] border border-[#333] rounded-xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-[#333]">
              <h3 className="text-xl font-bold text-gray-100">Opciones de Importación</h3>
              <p className="text-sm text-gray-400 mt-1">Configura cómo deseas extraer el código.</p>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modo de Selección
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setImportMode('directory')
                      // Si vuelve a modo carpeta, podemos mantener su elección anterior de recursividad
                    }}
                    className={`py-2 px-3 rounded-md border text-sm transition-colors ${
                      importMode === 'directory'
                        ? 'bg-cyan-900/40 border-cyan-500 text-cyan-300'
                        : 'bg-[#252526] border-[#333] text-gray-400 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    Carpeta Completa
                  </button>
                  <button
                    onClick={() => {
                      setImportMode('files')
                      setIsRecursive(false) // Si elige archivos sueltos, desactivamos recursividad
                    }}
                    className={`py-2 px-3 rounded-md border text-sm transition-colors ${
                      importMode === 'files'
                        ? 'bg-cyan-900/40 border-cyan-500 text-cyan-300'
                        : 'bg-[#252526] border-[#333] text-gray-400 hover:bg-[#2a2a2a]'
                    }`}
                  >
                    Archivos Específicos
                  </button>
                </div>
              </div>

              {/* NUEVO: Opción recursiva (Solo visible en modo carpeta) */}
              {importMode === 'directory' && (
                <div className="flex items-center gap-3 bg-[#2a2a2b] p-3 rounded-md border border-[#444]">
                  <input
                    type="checkbox"
                    id="isRecursive"
                    checked={isRecursive}
                    onChange={(e) => setIsRecursive(e.target.checked)}
                    className="w-5 h-5 accent-cyan-500 bg-[#1e1e1e] border-[#333] rounded cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <label
                      htmlFor="isRecursive"
                      className="text-sm font-medium text-cyan-300 cursor-pointer select-none"
                    >
                      Incluir Subcarpetas (Recursivo)
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Importará archivos de todas las carpetas internas.
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Filtrar por extensión (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: .gd, .cs, .json"
                  value={extensionsInput}
                  onChange={(e) => setExtensionsInput(e.target.value)}
                  className="w-full bg-[#252526] border border-[#333] text-gray-100 rounded-md px-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  {importMode === 'directory'
                    ? 'Solo importará los archivos que coincidan. Ideal para filtrar tu proyecto.'
                    : 'Restringirá los archivos que puedes seleccionar en el explorador.'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#252526] p-3 rounded-md border border-[#333]">
                <input
                  type="checkbox"
                  id="importPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 bg-[#1e1e1e] border-[#333] rounded cursor-pointer"
                />
                <label
                  htmlFor="importPublic"
                  className="text-sm font-medium text-gray-300 cursor-pointer select-none"
                >
                  Hacer snippets públicos en la comunidad
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-[#333] flex justify-end gap-3 bg-[#252526] rounded-b-xl">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isImporting}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isImporting}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-6 py-2 rounded-md transition-colors font-medium text-sm flex items-center gap-2"
              >
                {isImporting ? 'Importando...' : 'Comenzar Importación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
