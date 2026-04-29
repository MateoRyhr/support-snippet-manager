export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* --- HERO SECTION --- */}
      <section className="flex-1 flex flex-col justify-center items-center text-center p-8 mt-16">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-cyan-400 drop-shadow-md">
          Code Snippet Manager
        </h1>

        {/* App Demo GIF Container */}
        <div className="w-full max-w-4xl my-8 rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 flex items-center justify-center min-h-[300px] md:min-h-[500px]">
          {/* TODO: Place your recorded demo.gif in the public folder and update the src */}
          <img
            src='/code-snippet-manager/demo.gif'
            alt="Code Snippet Manager Demo"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback UI if the GIF is not yet in the public folder
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('p-8');
              e.currentTarget.parentElement!.innerHTML = '<span class="text-gray-500 font-mono text-lg">GIF Placeholder (demo.gif)</span>';
            }}
          />
        </div>

        <p className="text-xl text-gray-400 max-w-2xl mb-10">
          Tu conocimiento, siempre a mano. Organiza, busca y reutiliza tus fragmentos de código al instante con nuestra aplicación de escritorio ultrarrápida.
        </p>
      </section>

      {/* --- DOWNLOAD SECTION --- */}
      <section id="download" className="py-20 bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-12">Disponible para tu sistema</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Windows */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-cyan-500 transition-colors flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">Windows</h3>
                <p className="text-gray-400 mb-6 text-sm">Windows 10 / 11 (.exe)</p>
              </div>
              <a
                href="https://github.com/MateoRyhr/code-snippet-manager/releases/download/v1.1.1/CodeSnippetManager-v1.1.1.exe"
                download
                className="w-full inline-block bg-cyan-700 hover:bg-cyan-600 text-white font-semibold py-2 rounded transition-colors"
              >
                Descargar .exe
              </a>
            </div>

            {/* Mac (Temporarily disabled) */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 opacity-60 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">macOS</h3>
                <p className="text-gray-400 mb-6 text-sm">Apple Silicon & Intel (.dmg)</p>
              </div>
              <button
                disabled
                className="w-full bg-gray-700 text-gray-400 py-2 rounded cursor-not-allowed"
              >
                Próximamente
              </button>
            </div>

            {/* Linux */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-cyan-500 transition-colors flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">Linux</h3>
                <p className="text-gray-400 mb-6 text-sm">Ubuntu / Debian (.AppImage)</p>
              </div>
              <a
                href="https://github.com/MateoRyhr/code-snippet-manager/releases/download/v1.1.1/CodeSnippetManager-v1.1.1.AppImage"
                download
                className="w-full inline-block bg-cyan-700 hover:bg-cyan-600 text-white font-semibold py-2 rounded transition-colors"
              >
                Descargar .AppImage
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}