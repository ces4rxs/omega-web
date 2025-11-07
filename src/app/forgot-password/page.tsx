'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { forgotPassword } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Correo Enviado!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace de recuperación a:
          </p>
          
          <p className="text-blue-600 font-semibold mb-8">
            {email}
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </p>
          
          <div className="space-y-3">
            
              href="/login"
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
            >
              Volver al Login
            </a>
            
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="block w-full text-blue-600 hover:text-blue-700 py-2 text-sm font-medium"
            >
              Enviar a otro correo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="/images/omega-logo.png" 
              alt="OMEGA Logo" 
              width={100} 
              height={100}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Recuperar Contraseña</h1>
          <p className="text-gray-600 mt-2">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
          >
            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
          </button>
        </form>

        <div className="mt-6">
          <a 
            href="/login" 
            className="flex items-center justify-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Login
          </a>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium underline">
            Regístrate
          </a>
        </div>
      </div>
    </div>
  );
}