"use client";
import { useEffect, useState } from "react";
import { getSheet, saveSheet } from "../actions";
import NovaFichaWizard from "../../components/NovaFichaWizard"; // Ajuste o caminho se necessário

// 1. Estado inicial extraído para constante para facilitar o reset
const INITIAL_STATE = {
  name: "",
  player: "",
  point_total: 150,
  unspent_pts: 0,
  attributes: { ST: 10, DX: 10, IQ: 10, HT: 10 },
  height: "",
  weight: "",
  size_modifier: 0,
  age: "",
  appearance: "",
};

export default function Ficha() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const [ficha, setFicha] = useState(INITIAL_STATE);

  // Carregar dados
  useEffect(() => {
    async function load() {
      try {
        const data = await getSheet();

        // Verifica se existe dados e se não é um objeto vazio
        const hasData = data && Object.keys(data).length > 0;

        if (hasData) {
          const safeData = {
            ...data,
            attributes: data.attributes || { ST: 10, DX: 10, IQ: 10, HT: 10 },
          };
          setFicha((prev) => ({ ...prev, ...safeData }));
        } else {
          // Se JSON for {}, abre o modal
          setShowWizard(true);
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Recalcular pontos
  useEffect(() => {
    if (loading) return;

    const COSTS = { ST: 10, DX: 20, IQ: 20, HT: 10 };
    let spent = 0;
    spent += (ficha.attributes.ST - 10) * COSTS.ST;
    spent += (ficha.attributes.DX - 10) * COSTS.DX;
    spent += (ficha.attributes.IQ - 10) * COSTS.IQ;
    spent += (ficha.attributes.HT - 10) * COSTS.HT;

    const remaining = ficha.point_total - spent;

    if (ficha.unspent_pts !== remaining) {
      setFicha((prev) => ({ ...prev, unspent_pts: remaining }));
    }
  }, [ficha.attributes, ficha.point_total, loading]);

  // Salvar
  async function handleSave(dataToSave = ficha) {
    setSaving(true);
    const res = await saveSheet(dataToSave);
    setSaving(false);

    if (res?.success) {
      // Só mostra o alerta se NÃO for um save vazio (delete)
      // Como usamos essa função pro delete tbm, podemos checar:
      if (Object.keys(dataToSave).length > 0) {
        alert("Ficha salva!");
      }
    } else {
      alert("Erro ao salvar.");
    }
    return res; // Retorna o resultado para uso no handleDelete
  }

  // 2. NOVA FUNÇÃO: Apagar Ficha
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja apagar esta ficha permanentemente? Isso não pode ser desfeito."
    );

    if (!confirmDelete) return;

    setSaving(true);

    // Salva um JSON vazio "{}" no banco
    const res = await saveSheet({});

    setSaving(false);

    if (res?.success) {
      // Reseta o estado local para o inicial
      setFicha(INITIAL_STATE);
      // Abre o modal de criação (comportamento de "sem ficha")
      setShowWizard(true);
      alert("Ficha apagada com sucesso.");
    } else {
      alert("Erro ao apagar a ficha.");
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const val = ["point_total", "size_modifier"].includes(name)
      ? Number(value)
      : value;
    setFicha((prev) => ({ ...prev, [name]: val }));
  };

  const handleAttrChange = (attr: string, value: string) => {
    const numValue = Number(value);
    setFicha((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: numValue },
    }));
  };

  const handleCreateNew = async (newCharData: any) => {
    setShowWizard(false);
    setFicha(newCharData);
    await handleSave(newCharData);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-blue-400">
        <span className="animate-pulse text-xl">Carregando Grimório...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24 relative">
      {showWizard && (
        <NovaFichaWizard
          onCancel={() => setShowWizard(false)}
          onCreate={handleCreateNew}
        />
      )}

      <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 shadow-2xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-200 uppercase tracking-wider">
              GURPS Character Sheet
            </h1>
            <span className="text-xs text-gray-500">4th Edition</span>
          </div>

          {/* Botões do Header */}
          <div className="flex gap-3">
            {/* 3. Botão de Apagar */}
            <button
              onClick={handleDelete}
              disabled={saving}
              title="Apagar ficha atual"
              className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
            >
              🗑️ Apagar
            </button>

            <button
              onClick={() => setShowWizard(true)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-blue-400 border border-blue-900 px-3 py-1.5 rounded transition-colors"
            >
              + Novo Personagem
            </button>
          </div>
        </div>

        <div className="p-6 grid gap-6">
          {/* Identidade */}
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

          {/* Atributos */}
          <div>
            <h3 className="text-xs font-bold text-blue-400 uppercase mb-3 tracking-widest">
              Primary Attributes
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {["ST", "DX", "IQ", "HT"].map((attr) => (
                <div
                  key={attr}
                  className="bg-gray-900/50 p-3 rounded border border-gray-600 flex flex-col items-center hover:border-blue-500 transition-colors"
                >
                  <label className="text-xl font-bold text-gray-400 mb-1">
                    {attr}
                  </label>
                  <input
                    type="number"
                    value={
                      ficha.attributes[attr as keyof typeof ficha.attributes]
                    }
                    onChange={(e) => handleAttrChange(attr, e.target.value)}
                    className="w-full bg-transparent text-center text-2xl font-bold text-white outline-none border-b border-gray-700 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-gray-500 mt-1">
                    {attr === "ST" || attr === "HT" ? "±10" : "±20"} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dados Físicos e Pontos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputGroup label="Point Total">
              <input
                type="number"
                name="point_total"
                value={ficha.point_total}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-center font-mono focus:bg-gray-600 transition-colors"
              />
            </InputGroup>

            <InputGroup label="Unspent Pts">
              <input
                type="number"
                name="unspent_pts"
                value={ficha.unspent_pts}
                readOnly
                className={`w-full border border-gray-600 rounded p-2 text-center font-mono font-bold cursor-not-allowed
                  ${
                    ficha.unspent_pts < 0
                      ? "bg-red-900/30 text-red-400 border-red-800"
                      : "bg-gray-800 text-green-400"
                  }
                `}
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

          {/* Aparência */}
          <InputGroup label="Appearance">
            <textarea
              name="appearance"
              rows={3}
              value={ficha.appearance}
              onChange={handleChange}
              placeholder="Descreva a aparência..."
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </InputGroup>
        </div>
      </div>

      <button
        onClick={() => handleSave()}
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
