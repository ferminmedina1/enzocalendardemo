/**
 * Login page for admin authentication
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema } from '@/utils/validations';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.issues[0].message);
        setLoading(false);
        return;
      }

      // Sign in
      const { error } = await signIn(email, password);

      if (error) {
        toast.error(error);
        setLoading(false);
        return;
      }

      toast.success('¡Bienvenido!');
      router.push('/admin');
      router.refresh();
    } catch (error) {
      toast.error('Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Fondo etéreo animado */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-linear-to-br from-white/80 via-slate-50/70 to-blue-50/80" />
      </div>

      <div className="max-w-lg w-full space-y-8 relative z-10">
        {/* Container con glassmorphism */}
        <div className={`relative bg-white/35 backdrop-blur-3xl rounded-4xl px-12 py-14 border border-white/40 shadow-2xl shadow-blue-900/10 before:absolute before:inset-0 before:rounded-4xl before:bg-linear-to-br before:from-white/50 before:via-white/30 before:to-white/10 before:pointer-events-none`}>
          
          {/* Texture overlay */}
          <div className="absolute inset-0 opacity-40 pointer-events-none rounded-4xl" 
               style={{
                 backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 1px)',
                 backgroundSize: '60px 60px'
               }} />

          {/* Icon decorativo */}
          <div className="flex justify-center mb-10">
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-blue-300/40 to-cyan-300/30 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-lg shadow-blue-300/20">
              <svg className="h-10 w-10 text-blue-600/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-3 mb-12 text-center relative z-10">
            <h2 className="text-3xl font-light tracking-tight text-slate-900">
              Panel de Administración
            </h2>
            <p className="text-slate-600/80 text-sm font-light">
              Inicia sesión para gestionar tu agenda
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-linear-to-r from-transparent via-white/40 to-transparent mb-10" />

          {/* Form */}
          <form className="space-y-7 relative z-10" onSubmit={handleSubmit}>
            {/* Email input */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 placeholder-slate-500/60 text-slate-900 font-light transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/50 focus:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 placeholder-slate-500/60 text-slate-900 font-light transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/50 focus:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-12 py-4 px-5 rounded-2xl font-light text-white transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:-translate-y-0.5 enabled:hover:scale-105 enabled:hover:-translate-y-1 enabled:hover:shadow-lg enabled:hover:shadow-blue-400/20 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:ring-offset-2 focus:ring-offset-white/30 bg-linear-to-br from-blue-400/85 via-blue-400/75 to-cyan-400/65 backdrop-blur-xl shadow-xl shadow-blue-400/25 border border-blue-300/70 before:absolute before:inset-0 before:bg-linear-to-t before:from-transparent before:to-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity`}>
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <div className="text-center text-slate-600/60 text-xs font-light relative z-10 mt-8">
          <p>Acceso restringido a administradores</p>
        </div>
      </div>

      {/* Estilos dinámicos */}
      <style jsx>{`
        @keyframes subtle-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        input:focus {
          animation: subtle-glow 0.3s ease-out;
        }

        @keyframes subtle-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
          }
        }
      `}</style>
    </div>
  );
}
