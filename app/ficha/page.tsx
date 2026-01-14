"use client";
import { useEffect, useState } from "react";
import { getSheet, saveSheet } from "../actions";
import NovaFichaWizard from "../../components/NovaFichaWizard";

// --- TABELA DE DANO SIMPLIFICADA (GURPS 4e) ---
// Retorna { thr: string, sw: string } baseado na ST
function getDamage(st: number) {
  // Lógica simplificada para ST comuns.
  // Para uma implementação completa, seria ideal uma tabela de lookup extensa ou algoritmo complexo.
  if (st < 1) return { thr: "0", sw: "0" };

  // Tabela manual para ST 1 a 20 (faixa mais comum)
  const lookup: Record<number, { thr: string; sw: string }> = {
    1: { thr: "1d-6", sw: "1d-5" },
    2: { thr: "1d-6", sw: "1d-5" },
    3: { thr: "1d-5", sw: "1d-4" },
    4: { thr: "1d-5", sw: "1d-4" },
    5: { thr: "1d-4", sw: "1d-3" },
    6: { thr: "1d-4", sw: "1d-3" },
    7: { thr: "1d-3", sw: "1d-2" },
    8: { thr: "1d-3", sw: "1d-2" },
    9: { thr: "1d-2", sw: "1d-1" },
    10: { thr: "1d-2", sw: "1d" },
    11: { thr: "1d-1", sw: "1d+1" },
    12: { thr: "1d-1", sw: "1d+2" },
    13: { thr: "1d", sw: "2d-1" },
    14: { thr: "1d", sw: "2d" },
    15: { thr: "1d+1", sw: "2d+1" },
    16: { thr: "1d+1", sw: "2d+2" },
    17: { thr: "1d+2", sw: "3d-1" },
    18: { thr: "1d+2", sw: "3d" },
    19: { thr: "2d-1", sw: "3d+1" },
    20: { thr: "2d-1", sw: "3d+2" },
  };

  if (lookup[st]) return lookup[st];

  // Fallback genérico para ST > 20 (aproximação)
  // A cada +1 ST o dano sobe, mas segue uma escada. Aqui simplifico para não quebrar.
  return { thr: `${Math.floor(st / 10)}d`, sw: `${Math.floor(st / 10) + 1}d` };
}

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

  // --- CÁLCULOS DERIVADOS ---
  // Estes valores são calculados "on the fly" baseados nos atributos.
  // Se quiser permitir comprar HP/FP extra, precisaria adicionar campos no state (ex: hp_mod).
  const { ST, DX, IQ, HT } = ficha.attributes;

  const basicLift = (ST * ST) / 5; // BL = ST^2 / 5
  // Basic Lift arredondado costuma ser usado para cálculos rápidos, mas mantemos 1 casa decimal se necessário.
  const blDisplay =
    basicLift >= 10 ? Math.round(basicLift) : basicLift.toFixed(1);

  const hp = ST; // Default HP = ST
  const will = IQ; // Default Will = IQ
  const per = IQ; // Default Per = IQ
  const fp = HT; // Default FP = HT

  const basicSpeed = (HT + DX) / 4;
  const basicMove = Math.floor(basicSpeed);

  const damage = getDamage(ST);

  // Níveis de Carga (Encumbrance)
  const encumbranceLevels = [
    {
      level: "None (0)",
      max: Math.round(basicLift),
      move: basicMove,
      dodge: 0,
    },
    {
      level: "Light (1)",
      max: Math.round(basicLift * 2),
      move: Math.floor(basicMove * 0.8),
      dodge: 1,
    },
    {
      level: "Medium (2)",
      max: Math.round(basicLift * 3),
      move: Math.floor(basicMove * 0.6),
      dodge: 2,
    },
    {
      level: "Heavy (3)",
      max: Math.round(basicLift * 6),
      move: Math.floor(basicMove * 0.4),
      dodge: 3,
    },
    {
      level: "X-Hvy (4)",
      max: Math.round(basicLift * 10),
      move: Math.floor(basicMove * 0.2),
      dodge: 4,
    },
  ];

  // --- EFFECTS ---

  useEffect(() => {
    async function load() {
      try {
        const data = await getSheet();
        const hasData = data && Object.keys(data).length > 0;

        if (hasData) {
          const safeData = {
            ...data,
            attributes: data.attributes || { ST: 10, DX: 10, IQ: 10, HT: 10 },
          };
          setFicha((prev) => ({ ...prev, ...safeData }));
        } else {
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

  // --- HANDLERS ---

  async function handleSave(dataToSave = ficha) {
    setSaving(true);
    const res = await saveSheet(dataToSave);
    setSaving(false);
    if (res?.success) {
      if (Object.keys(dataToSave).length > 0) alert("Ficha salva!");
    } else {
      alert("Erro ao salvar.");
    }
    return res;
  }

  const handleDelete = async () => {
    if (!window.confirm("Apagar ficha permanentemente?")) return;
    setSaving(true);
    const res = await saveSheet({});
    setSaving(false);
    if (res?.success) {
      setFicha(INITIAL_STATE);
      setShowWizard(true);
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
        {/* HEADER */}
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-200 uppercase tracking-wider">
              GURPS Character Sheet
            </h1>
            <span className="text-xs text-gray-500">4th Edition</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900 px-3 py-1.5 rounded transition-colors"
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
          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Name">
              <input
                name="name"
                value={ficha.name}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-500"
              />
            </InputGroup>
            <InputGroup label="Player">
              <input
                name="player"
                value={ficha.player}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-500"
              />
            </InputGroup>
          </div>

          <hr className="border-gray-700" />

          {/* PRIMARY ATTRIBUTES */}
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
                    className="w-full bg-transparent text-center text-3xl font-bold text-white outline-none border-b border-gray-700 focus:border-blue-500"
                  />
                  <span className="text-[10px] text-gray-500 mt-1">
                    {attr === "ST" || attr === "HT" ? "±10" : "±20"} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECONDARY CHARACTERISTICS (Calculated) */}
          <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700">
            <h3 className="text-xs font-bold text-green-400 uppercase mb-3 tracking-widest">
              Secondary Characteristics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {/* HP & FP */}
              <div className="flex flex-col items-center p-2 bg-gray-800 rounded border border-gray-600">
                <span className="text-xs text-gray-400 uppercase font-bold">
                  HP (Hit Points)
                </span>
                <span className="text-2xl font-bold text-white">{hp}</span>
                <span className="text-[10px] text-gray-500">Based on ST</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-800 rounded border border-gray-600">
                <span className="text-xs text-gray-400 uppercase font-bold">
                  FP (Fatigue)
                </span>
                <span className="text-2xl font-bold text-white">{fp}</span>
                <span className="text-[10px] text-gray-500">Based on HT</span>
              </div>

              {/* Will & Per */}
              <div className="flex flex-col items-center p-2 bg-gray-800 rounded border border-gray-600">
                <span className="text-xs text-gray-400 uppercase font-bold">
                  Will
                </span>
                <span className="text-2xl font-bold text-white">{will}</span>
                <span className="text-[10px] text-gray-500">Based on IQ</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-gray-800 rounded border border-gray-600">
                <span className="text-xs text-gray-400 uppercase font-bold">
                  Per (Perception)
                </span>
                <span className="text-2xl font-bold text-white">{per}</span>
                <span className="text-[10px] text-gray-500">Based on IQ</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Lift, Speed, Move */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded px-4">
                  <span className="text-sm text-gray-400 font-bold">
                    Basic Lift (BL)
                  </span>
                  <span className="text-lg font-mono text-yellow-400 font-bold">
                    {blDisplay} kg
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded px-4">
                  <span className="text-sm text-gray-400 font-bold">
                    Basic Speed
                  </span>
                  <span className="text-lg font-mono text-blue-400 font-bold">
                    {basicSpeed.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-gray-800 p-2 rounded px-4">
                  <span className="text-sm text-gray-400 font-bold">
                    Basic Move
                  </span>
                  <span className="text-lg font-mono text-blue-400 font-bold">
                    {basicMove}
                  </span>
                </div>

                {/* Damage Table Display */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
                    <span className="text-[10px] uppercase text-gray-500">
                      Thrust (GPE)
                    </span>
                    <span className="font-bold text-white">{damage.thr}</span>
                  </div>
                  <div className="bg-gray-800 p-2 rounded flex flex-col items-center">
                    <span className="text-[10px] uppercase text-gray-500">
                      Swing (BaL)
                    </span>
                    <span className="font-bold text-white">{damage.sw}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Encumbrance Table */}
              <div className="bg-gray-800 rounded p-2 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-700">
                      <th className="pb-1 pl-2">Encumbrance</th>
                      <th className="pb-1">Max Load</th>
                      <th className="pb-1 text-right pr-2">Move</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {encumbranceLevels.map((row) => (
                      <tr
                        key={row.level}
                        className="border-b border-gray-700/50 last:border-0 hover:bg-gray-700/50"
                      >
                        <td className="py-1.5 pl-2 font-medium">{row.level}</td>
                        <td className="py-1.5">{row.max} kg</td>
                        <td className="py-1.5 text-right pr-2 font-mono text-blue-300">
                          {row.move}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <hr className="border-gray-700" />

          {/* PHYSICAL / INFO */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputGroup label="Point Total">
              <input
                type="number"
                name="point_total"
                value={ficha.point_total}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-center font-mono focus:bg-gray-600"
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

          <InputGroup label="Appearance">
            <textarea
              name="appearance"
              rows={3}
              value={ficha.appearance}
              onChange={handleChange}
              placeholder="Descreva a aparência..."
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none resize-none"
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
