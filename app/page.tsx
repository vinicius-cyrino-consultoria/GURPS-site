"use client";
import { login } from "./actions";
import { useState } from "react";

export default function Home() {
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const res = await login(formData);
    if (res?.error) setError(res.error);
  }

  return (
    // O fundo principal (bg-gray-900) já vem do layout, aqui centralizamos
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Container do "Cartão" de Login */}
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight">
            GURPS Manager
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Acesse sua ficha de personagem
          </p>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-5">
          {/* Campo Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome do Jogador
            </label>
            <input
              name="username"
              placeholder="Ex: Legolas"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Campo PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              PIN de Acesso
            </label>
            <input
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors duration-200 mt-2 shadow-lg"
          >
            Entrar
          </button>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center animate-pulse">
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Rodapé simples */}
      <footer className="mt-8 text-gray-600 text-xs">
        Sistema v1.0 • GURPS 4ª Edição
      </footer>
    </main>
  );
}
