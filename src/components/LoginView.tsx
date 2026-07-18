/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

export const LoginView: React.FC = () => {
  const { loginWithGoogle } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al iniciar sesión con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl tracking-tighter shadow-md shadow-indigo-100">
            IN
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          ImpulsaNet Admin
        </h2>
        <p className="mt-2 text-center text-xs text-gray-500">
          Uso administrativo exclusivo e interno
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white py-8 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-200 sm:rounded-2xl sm:px-10 space-y-6"
        >
          <div className="text-center space-y-2">
            <h3 className="text-sm font-bold text-gray-700">Acceso Seguro</h3>
            <p className="text-xs text-gray-400">Inicie sesión de forma segura utilizando su cuenta de Google.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-2.5 text-xs text-red-600 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-2xs text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-hidden transition cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2 text-indigo-600" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2 text-indigo-600" />
            )}
            Iniciar Sesión con Google
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            Este sistema requiere una cuenta autorizada en la organización.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
