function App(): React.JSX.Element {
  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          Space Snippets
        </h1>
        <p className="text-slate-400 text-lg">
          Tailwind + React + Electron listos para el despegue 🚀
        </p>
      </div>
    </div>
  )
}

export default App
