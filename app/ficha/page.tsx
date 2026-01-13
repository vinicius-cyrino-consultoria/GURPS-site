"use client";
import { useEffect, useState } from "react";
import { getSheet, saveSheet } from "../actions";

export default function Ficha() {
  // Estado inicial da ficha
  const [ficha, setFicha] = useState({
    nome: "",
    st: 10,
    dx: 10,
    iq: 10,
    ht: 10, // Atributos GURPS
    hp: 10,
    anotacoes: "",
  });
  const [loading, setLoading] = useState(true);

  // Carregar dados ao entrar
  useEffect(() => {
    async function load() {
      const data = await getSheet();
      if (data && Object.keys(data).length > 0) {
        setFicha(data); // Se já existir ficha salva, carrega
      }
      setLoading(false);
    }
    load();
  }, []);

  // Função para salvar
  async function handleSave() {
    const res = await saveSheet(ficha);
    if (res?.success) alert("Ficha salva com sucesso!");
    else alert("Erro ao salvar.");
  }

  // Atualiza o estado quando digita
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFicha((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <div>Carregando grimório...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto bg-gray-100 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-6">Ficha de Personagem (GURPS)</h1>

      {/* Dados Básicos */}
      <div className="mb-4">
        <label className="block font-bold">Nome do Personagem</label>
        <input
          name="nome"
          value={ficha.nome}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Atributos Principais */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["st", "dx", "iq", "ht"].map((attr) => (
          <div key={attr} className="text-center">
            <label className="block font-bold uppercase">{attr}</label>
            <input
              name={attr}
              type="number"
              value={(ficha as any)[attr]}
              onChange={handleChange}
              className="w-full p-2 border rounded text-center text-xl"
            />
          </div>
        ))}
      </div>

      {/* Área de Texto Livre */}
      <div className="mb-4">
        <label className="block font-bold">
          Anotações / Vantagens / Perícias
        </label>
        <textarea
          name="anotacoes"
          value={ficha.anotacoes}
          onChange={handleChange}
          rows={10}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={handleSave}
        className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-500 font-bold"
      >
        Salvar Ficha 💾
      </button>
    </div>
  );
}
