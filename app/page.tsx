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
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">GURPS Manager</h1>
      <form action={handleSubmit} className="flex flex-col gap-4 w-64">
        <input
          name="username"
          placeholder="Nome do Jogador"
          className="p-2 rounded text-black"
          required
        />
        <input
          name="pin"
          type="password"
          maxLength={4}
          placeholder="PIN (4 dígitos)"
          className="p-2 rounded text-black"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 p-2 rounded hover:bg-blue-500"
        >
          Entrar
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </main>
  );
}
