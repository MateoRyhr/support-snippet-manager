import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu correo electrónico...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se encontró ningún token de verificación en el enlace.');
      return;
    }

    const verifyWithApi = async () => {
      try {
        // NOTA: Reemplaza esto con la URL real de tu API en Render
        // Lo ideal es usar import.meta.env.VITE_API_URL
        const response = await fetch(`https://code-snippet-manager-api.onrender.com/api/auth/verify?token=${token}`);
        
        if (response.ok) {
          setStatus('success');
          setMessage('¡Tu cuenta ha sido verificada con éxito!');
        } else {
          const data = await response.json();
          setStatus('error');
          setMessage(data.message || 'El enlace es inválido o ha expirado.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error de conexión con el servidor. Inténtalo de nuevo más tarde.');
      }
    };

    verifyWithApi();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md w-full text-center shadow-xl">
        
        {status === 'loading' && (
          <div className="animate-pulse text-cyan-400 mb-4 text-4xl">⏳</div>
        )}
        {status === 'success' && (
          <div className="text-green-400 mb-4 text-4xl">✅</div>
        )}
        {status === 'error' && (
          <div className="text-red-400 mb-4 text-4xl">❌</div>
        )}

        <h2 className="text-2xl font-bold mb-4 text-white">Verificación de Cuenta</h2>
        <p className="text-gray-300 mb-8">{message}</p>

        {status !== 'loading' && (
          <Link 
            to="/" 
            className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded transition-colors"
          >
            Volver al Inicio
          </Link>
        )}
      </div>
    </div>
  );
}