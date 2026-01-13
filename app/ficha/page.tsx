"use client";
import { useEffect, useState } from "react";
import { getSheet, saveSheet } from "../actions";

export default function Ficha() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado com os campos exatos que você pediu
  const [ficha, setFicha] = useState({
    name: "",
    player: "",
    point_total: 150, // Padrão GURPS heróico
    unspent_pts: 0,
    height: "",
    weight: "",
    size_modifier: 0,
    age: "",
    appearance: "",
  });

  // Carregar dados
  useEffect(() => {
    async function load() {
      const data = await getSheet();
      if (data && Object.keys(data).length > 0) {
        // Mescla os dados salvos com o estado inicial para garantir que campos novos não quebrem
        setFicha((prev) => ({ ...prev, ...data }));
      }
      setLoading(false);
    }
    load();
  }, []);

  // Salvar dados
  async function handleSave() {
    setSaving(true);
    const res = await saveSheet(ficha);
    setSaving(false);

    if (res?.success) {
      // Feedback visual simples (poderia ser um toast)
      alert("Ficha salva!");
    } else {
      alert("Erro ao salvar.");
    }
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    // Converte para número se for campo numérico, senão mantém texto
    const val = ["point_total", "unspent_pts", "size_modifier"].includes(name)
      ? Number(value)
      : value;

    setFicha((prev) => ({ ...prev, [name]: val }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-blue-400">
        <span className="animate-pulse text-xl">Carregando Grimório...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 shadow-2xl rounded-xl overflow-hidden">
        {/* Cabeçalho Visual */}
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-200 uppercase tracking-wider">
            GURPS Character Sheet
          </h1>
          <span className="text-xs text-gray-500">4th Edition</span>
        </div>

        <div className="p-6 grid gap-6">
          {/* SEÇÃO 1: Identidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Name">
              <input
                name="name"
                value={ficha.name}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </InputGroup>
            <InputGroup label="Player">
              <input
                name="player"
                value={ficha.player}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </InputGroup>
          </div>

          <hr className="border-gray-700" />

          {/* SEÇÃO 2: Dados Físicos e Pontos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputGroup label="Point Total">
              <input
                type="number"
                name="point_total"
                value={ficha.point_total}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-center font-mono"
              />
            </InputGroup>

            <InputGroup label="Unspent Pts">
              <input
                type="number"
                name="unspent_pts"
                value={ficha.unspent_pts}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-center font-mono"
              />
            </InputGroup>

            <InputGroup label="Size Modifier">
              <input
                type="number"
                name="size_modifier"
                value={ficha.size_modifier}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-center"
              />
            </InputGroup>

            <InputGroup label="Age">
              <input
                type="text"
                name="age"
                value={ficha.age}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-center"
              />
            </InputGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Ht (Height)">
              <input
                name="height"
                placeholder="Ex: 1.80m"
                value={ficha.height}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              />
            </InputGroup>

            <InputGroup label="Wt (Weight)">
              <input
                name="weight"
                placeholder="Ex: 80kg"
                value={ficha.weight}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
              />
            </InputGroup>
          </div>

          <hr className="border-gray-700" />

          {/* SEÇÃO 3: Aparência */}
          <InputGroup label="Appearance">
            <textarea
              name="appearance"
              rows={3}
              value={ficha.appearance}
              onChange={handleChange}
              placeholder="Descreva a aparência do personagem..."
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </InputGroup>
        </div>
      </div>

      {/* Botão Flutuante de Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`fixed bottom-6 right-6 px-6 py-4 rounded-full shadow-lg font-bold text-white transition-all flex items-center gap-2
          ${
            saving
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 hover:scale-105"
          }
        `}
      >
        {saving ? "Salvando..." : "Salvar Ficha 💾"}
      </button>
    </div>
  );
}

// Componente auxiliar para padronizar as labels
function InputGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase font-bold text-gray-400 tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
