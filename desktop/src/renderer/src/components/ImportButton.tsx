import { useState } from 'react'
import { useApi } from '../hooks/useApi'

// Definimos el contrato de las props
interface ImportButtonProps {
  selectedFolderId: string | null
  onImportSuccess: () => void
}

export default function ImportButton({ selectedFolderId, onImportSuccess }: ImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false)
  const { createSnippet } = useApi()

  const handleImportDirectory = async () => {
    try {
      setIsImporting(true)

      const files = await window.api.openDirectory()

      if (files.length === 0) {
        setIsImporting(false)
        return
      }

      // PREGUNTA DE UX: ¿Público o Privado?
      // window.confirm devuelve true si el usuario hace clic en "Aceptar" y false en "Cancelar"
      const makePublic = window.confirm(
        `Vas a importar ${files.length} archivos.\n\n¿Deseas que estos snippets sean PÚBLICOS para la comunidad?\n\n(Clic en 'Aceptar' para Público, 'Cancelar' para Privado)`
      )

      await Promise.all(
        files.map((file) =>
          createSnippet({
            title: file.title,
            content: file.content,
            tags: [file.language],
            folderId: selectedFolderId,
            language: file.language,
            isPublic: makePublic
          })
        )
      )

      alert(`¡${files.length} snippets importados con éxito!`)

      // AVISAMOS AL PADRE (Dashboard) QUE TERMINAMOS
      onImportSuccess()
    } catch (error) {
      console.error('Error al importar:', error)
      alert('Hubo un error al importar los archivos.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <button
      onClick={handleImportDirectory}
      disabled={isImporting}
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
      {isImporting ? 'Importando...' : 'Importar Carpeta'}
    </button>
  )
}
