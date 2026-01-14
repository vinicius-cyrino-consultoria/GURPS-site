"use client";
import { useEffect, useState } from "react";
import { getSheet, saveSheet } from "../actions";
import NovaFichaWizard from "../../components/NovaFichaWizard";

// --- DADOS DE EXEMPLO DE VANTAGENS (GURPS) ---
const SAMPLE_TRAITS = [
  { id: "combat_reflexes", label: "Combat Reflexes", points: 15 },
  { id: "high_pain", label: "High Pain Threshold", points: 10 },
  { id: "luck", label: "Luck", points: 15 },
  { id: "luck_extra", label: "Luck (Extraordinary)", points: 30 },
  { id: "ambidexterity", label: "Ambidexterity", points: 5 },
  {
    id: "fearlessness",
    label: "Fearlessness (per level)",
    points: 2,
    hasLevel: true,
  },
  { id: "bad_temper", label: "Bad Temper (12)", points: -10 },
  { id: "bloodlust", label: "Bloodlust (12)", points: -10 },
  { id: "pacifism_self", label: "Pacifism (Self-Defense)", points: -15 },
  { id: "honesty", label: "Honesty (12)", points: -10 },
];

// --- DADOS DE APARÊNCIA (GURPS 4e) ---
const APPEARANCE_OPTIONS = [
  {
    id: "horrific",
    label: "Horrific",
    points: -24,
    reaction: "-6",
    desc: "Monstruosidade indescritível.",
  },
  {
    id: "monstrous",
    label: "Monstrous",
    points: -20,
    reaction: "-5",
    desc: "Visto como monstro.",
  },
  {
    id: "hideous",
    label: "Hideous",
    points: -16,
    reaction: "-4",
    desc: "Repugnante.",
  },
  { id: "ugly", label: "Ugly", points: -8, reaction: "-2", desc: "Feio." },
  {
    id: "unattractive",
    label: "Unattractive",
    points: -4,
    reaction: "-1",
    desc: "Desagradável.",
  },
  { id: "average", label: "Average", points: 0, reaction: "0", desc: "Comum." },
  {
    id: "attractive",
    label: "Attractive",
    points: 4,
    reaction: "+1",
    desc: "Atraente.",
  },
  {
    id: "beautiful",
    label: "Beautiful/Handsome",
    points: 12,
    reaction: "+4/+2",
    desc: "Belo.",
  },
  {
    id: "very_beautiful",
    label: "Very Beautiful",
    points: 16,
    reaction: "+6/+2",
    desc: "Muito Belo.",
  },
  {
    id: "transcendent",
    label: "Transcendent",
    points: 20,
    reaction: "+8/+2",
    desc: "Divino.",
  },
];

// --- TABELA DE DANO ---
function getDamage(st: number) {
  if (st < 1) return { thr: "0", sw: "0" };
  const lookup: Record<number, { thr: string; sw: string }> = {
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
  // Fallback simples
  const base = Math.floor((st - 1) / 2);
  return {
    thr: st < 10 ? "1d-3" : `${Math.floor(st / 10)}d`,
    sw: `${Math.floor(st / 10) + 1}d`,
  };
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
  appearance_id: "average",
  traits: [] as Array<{
    id: string;
    label: string;
    points: number;
    note?: string;
  }>,
};

export default function Ficha() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "traits">("main");
  const [ficha, setFicha] = useState(INITIAL_STATE);

  // --- CÁLCULOS DERIVADOS ---
  const { ST, DX, IQ, HT } = ficha.attributes;
  const basicLift = (ST * ST) / 5;
  const blDisplay =
    basicLift >= 10 ? Math.round(basicLift) : basicLift.toFixed(1);
  const hp = ST;
  const will = IQ;
  const per = IQ;
  const fp = HT;
  const basicSpeed = (HT + DX) / 4;
  const basicMove = Math.floor(basicSpeed);
  const damage = getDamage(ST);

  const currentAppearance =
    APPEARANCE_OPTIONS.find((a) => a.id === ficha.appearance_id) ||
    APPEARANCE_OPTIONS[5];

  // Níveis de Carga (Simplificado para visualização)
  const encumbranceLevels = [
    {
      lvl: 0,
      label: "None",
      max: Math.round(basicLift),
      mv: basicMove,
      ddg: 0,
    },
    {
      lvl: 1,
      label: "Light",
      max: Math.round(basicLift * 2),
      mv: Math.floor(basicMove * 0.8),
      ddg: 1,
    },
    {
      lvl: 2,
      label: "Med",
      max: Math.round(basicLift * 3),
      mv: Math.floor(basicMove * 0.6),
      ddg: 2,
    },
    {
      lvl: 3,
      label: "Hvy",
      max: Math.round(basicLift * 6),
      mv: Math.floor(basicMove * 0.4),
      ddg: 3,
    },
    {
      lvl: 4,
      label: "X-Hv",
      max: Math.round(basicLift * 10),
      mv: Math.floor(basicMove * 0.2),
      ddg: 4,
    },
  ];

  // --- EFFECTS ---
  useEffect(() => {
    async function load() {
      try {
        const data = await getSheet();
        if (data && Object.keys(data).length > 0) {
          setFicha((prev) => ({
            ...prev,
            ...data,
            attributes: data.attributes || { ST: 10, DX: 10, IQ: 10, HT: 10 },
            appearance_id: data.appearance_id || "average",
            traits: data.traits || [],
          }));
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

  // CÁLCULO DE PONTOS
  useEffect(() => {
    if (loading) return;
    const COSTS = { ST: 10, DX: 20, IQ: 20, HT: 10 };
    let spent = 0;

    // Atributos
    spent += (ficha.attributes.ST - 10) * COSTS.ST;
    spent += (ficha.attributes.DX - 10) * COSTS.DX;
    spent += (ficha.attributes.IQ - 10) * COSTS.IQ;
    spent += (ficha.attributes.HT - 10) * COSTS.HT;

    // Aparência
    spent +=
      APPEARANCE_OPTIONS.find((a) => a.id === ficha.appearance_id)?.points || 0;

    // Vantagens/Desvantagens
    spent += ficha.traits.reduce((acc, t) => acc + t.points, 0);

    const remaining = ficha.point_total - spent;
    if (ficha.unspent_pts !== remaining) {
      setFicha((prev) => ({ ...prev, unspent_pts: remaining }));
    }
  }, [
    ficha.attributes,
    ficha.point_total,
    ficha.appearance_id,
    ficha.traits,
    loading,
  ]);

  // --- HANDLERS ---
  async function handleSave(dataToSave = ficha) {
    setSaving(true);
    const res = await saveSheet(dataToSave);
    setSaving(false);
    if (res?.success && Object.keys(dataToSave).length > 0)
      alert("Ficha salva!");
    return res;
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    const val = ["point_total", "size_modifier"].includes(name)
      ? Number(value)
      : value;
    setFicha((prev) => ({ ...prev, [name]: val }));
  };

  const handleAttrChange = (attr: string, value: string) => {
    setFicha((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: Number(value) },
    }));
  };

  const addTrait = (trait: { id: string; label: string; points: number }) => {
    setFicha((prev) => ({
      ...prev,
      traits: [...prev.traits, { ...trait, note: "" }],
    }));
  };

  const removeTrait = (index: number) => {
    const newTraits = [...ficha.traits];
    newTraits.splice(index, 1);
    setFicha((prev) => ({ ...prev, traits: newTraits }));
  };

  const updateTraitPoints = (index: number, points: number) => {
    const newTraits = [...ficha.traits];
    newTraits[index].points = points;
    setFicha((prev) => ({ ...prev, traits: newTraits }));
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-blue-400 animate-pulse">
        Carregando Grimório...
      </div>
    );

  return (
    <div className="min-h-screen p-2 md:p-4 pb-20 bg-gray-900 text-gray-200">
      {showWizard && (
        <NovaFichaWizard
          onCancel={() => setShowWizard(false)}
          onCreate={async (d) => {
            setShowWizard(false);
            setFicha(d);
            await handleSave(d);
          }}
        />
      )}

      <div className="max-w-5xl mx-auto bg-gray-800 border border-gray-700 shadow-xl rounded-lg overflow-hidden">
        {/* TOP BAR: Identity & Points */}
        <div className="bg-gray-950 p-3 border-b border-gray-700 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-gray-500 font-bold">
                Name
              </label>
              <input
                name="name"
                value={ficha.name}
                onChange={handleChange}
                className="bg-transparent font-bold text-white border-b border-gray-700 focus:border-blue-500 outline-none w-40 sm:w-60"
                placeholder="Character Name"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-gray-500 font-bold">
                Player
              </label>
              <input
                name="player"
                value={ficha.player}
                onChange={handleChange}
                className="bg-transparent text-sm text-gray-300 border-b border-gray-700 focus:border-blue-500 outline-none w-32"
                placeholder="Player Name"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center bg-gray-900 px-3 py-1 rounded border border-gray-700">
            <div className="text-right">
              <div className="text-[10px] uppercase text-gray-500">Total</div>
              <input
                type="number"
                name="point_total"
                value={ficha.point_total}
                onChange={handleChange}
                className="w-12 bg-transparent text-right font-mono text-sm outline-none"
              />
            </div>
            <div className="h-6 w-px bg-gray-700"></div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-gray-500">Unspent</div>
              <span
                className={`font-mono font-bold ${
                  ficha.unspent_pts < 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {ficha.unspent_pts}
              </span>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-700 bg-gray-900/50">
          <button
            onClick={() => setActiveTab("main")}
            className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === "main"
                ? "bg-gray-800 text-blue-400 border-t-2 border-blue-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Main Sheet
          </button>
          <button
            onClick={() => setActiveTab("traits")}
            className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === "traits"
                ? "bg-gray-800 text-blue-400 border-t-2 border-blue-500"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Advantages ({ficha.traits.length})
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="p-4 bg-gray-800 min-h-[500px]">
          {activeTab === "main" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LEFT COL: Attributes (Compact) - Span 4 */}
              <div className="lg:col-span-4 space-y-4">
                {/* Primary Attributes Box */}
                <div className="bg-gray-900/50 rounded border border-gray-700 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    {["ST", "DX", "IQ", "HT"].map((attr) => (
                      <div
                        key={attr}
                        className="flex justify-between items-center bg-gray-800 p-2 rounded border border-gray-600/50"
                      >
                        <label className="font-bold text-gray-400 text-lg">
                          {attr}
                        </label>
                        <input
                          type="number"
                          value={
                            ficha.attributes[
                              attr as keyof typeof ficha.attributes
                            ]
                          }
                          onChange={(e) =>
                            handleAttrChange(attr, e.target.value)
                          }
                          className="w-12 text-center bg-transparent text-2xl font-bold text-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Grid (HP/Will/Per/FP) */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <DerivedStat label="HP" value={hp} sub={`ST ${ST}`} />
                  <DerivedStat label="FP" value={fp} sub={`HT ${HT}`} />
                  <DerivedStat label="Will" value={will} sub={`IQ ${IQ}`} />
                  <DerivedStat label="Per" value={per} sub={`IQ ${IQ}`} />
                </div>

                {/* Basic Lift & Speed */}
                <div className="bg-gray-900/50 p-3 rounded border border-gray-700 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Lift</span>{" "}
                    <span className="text-yellow-400 font-mono">
                      {blDisplay} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Basic Speed</span>{" "}
                    <span className="text-blue-400 font-mono">
                      {basicSpeed.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Basic Move</span>{" "}
                    <span className="text-blue-400 font-mono">{basicMove}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-1 mt-1">
                    <span className="text-gray-500">Dmg Thr</span>{" "}
                    <span>{damage.thr}</span>
                    <span className="text-gray-500">Sw</span>{" "}
                    <span>{damage.sw}</span>
                  </div>
                </div>
              </div>

              {/* MIDDLE COL: Traits & Appearance - Span 5 */}
              <div className="lg:col-span-5 space-y-4">
                {/* Appearance Compact */}
                <div className="bg-gray-900/30 p-3 rounded border border-gray-700 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-gray-500">
                      Appearance
                    </span>
                    <span
                      className={`text-xs font-mono ${
                        currentAppearance.points >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      [{currentAppearance.points}]
                    </span>
                  </div>
                  <select
                    name="appearance_id"
                    value={ficha.appearance_id}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white outline-none"
                  >
                    {APPEARANCE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.reaction})
                      </option>
                    ))}
                  </select>
                  <input
                    name="appearance"
                    value={ficha.appearance}
                    onChange={handleChange}
                    placeholder="Details (hair, eyes...)"
                    className="bg-transparent border-b border-gray-700 text-xs w-full outline-none py-1"
                  />
                </div>

                {/* Traits List (Compact View) */}
                <div className="bg-gray-900/30 rounded border border-gray-700 flex flex-col h-full min-h-[200px]">
                  <div className="bg-gray-800 px-3 py-2 text-xs font-bold uppercase text-gray-400 border-b border-gray-700 flex justify-between">
                    <span>Advantages & Disadvantages</span>
                    <button
                      onClick={() => setActiveTab("traits")}
                      className="text-blue-400 hover:text-white text-[10px] border border-blue-900 px-2 rounded"
                    >
                      + Edit
                    </button>
                  </div>
                  <div className="p-2 space-y-1 overflow-y-auto max-h-[300px]">
                    {ficha.traits.length === 0 && (
                      <div className="text-gray-600 text-xs text-center italic py-4">
                        No traits selected. Go to Advantages tab.
                      </div>
                    )}
                    {ficha.traits.map((t, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm hover:bg-gray-800 px-2 rounded group"
                      >
                        <span>
                          {t.label}{" "}
                          {t.note && (
                            <span className="text-gray-500 text-xs italic">
                              - {t.note}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-2">
                          <span className="font-mono text-gray-400">
                            [{t.points}]
                          </span>
                          <button
                            onClick={() => removeTrait(i)}
                            className="text-red-500 opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COL: Encumbrance & Bio - Span 3 */}
              <div className="lg:col-span-3 space-y-4">
                {/* Compact Encumbrance Table */}
                <div className="bg-gray-900/50 rounded border border-gray-700 overflow-hidden">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-gray-800 text-gray-400">
                      <tr>
                        <th className="p-1 pl-2">Lvl</th>
                        <th className="p-1">Max</th>
                        <th className="p-1 text-right pr-2">Move</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {encumbranceLevels.map((row) => (
                        <tr
                          key={row.lvl}
                          className="border-b border-gray-700 last:border-0 hover:bg-gray-700/50"
                        >
                          <td className="p-1 pl-2">{row.label}</td>
                          <td className="p-1">{row.max}</td>
                          <td className="p-1 text-right pr-2 font-mono text-blue-300">
                            {row.mv}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bio Info Compact */}
                <div className="bg-gray-900/30 p-3 rounded border border-gray-700 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-gray-500 block">Age</label>
                      <input
                        name="age"
                        value={ficha.age}
                        onChange={handleChange}
                        className="bg-gray-800 w-full rounded px-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block">SM</label>
                      <input
                        type="number"
                        name="size_modifier"
                        value={ficha.size_modifier}
                        onChange={handleChange}
                        className="bg-gray-800 w-full rounded px-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Height</label>
                      <input
                        name="height"
                        value={ficha.height}
                        onChange={handleChange}
                        className="bg-gray-800 w-full rounded px-1 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block">Weight</label>
                      <input
                        name="weight"
                        value={ficha.weight}
                        onChange={handleChange}
                        className="bg-gray-800 w-full rounded px-1 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "traits" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: Picker */}
              <div className="bg-gray-900 p-4 rounded border border-gray-700">
                <h3 className="text-blue-400 font-bold uppercase text-sm mb-4">
                  Add Advantages / Disadvantages
                </h3>

                {/* Lista Pré-definida */}
                <div className="grid gap-2 mb-6">
                  {SAMPLE_TRAITS.map((trait) => (
                    <button
                      key={trait.id}
                      onClick={() => addTrait(trait)}
                      className="flex justify-between items-center bg-gray-800 hover:bg-gray-700 p-2 rounded border border-gray-600 text-left transition-all"
                    >
                      <span className="text-sm font-medium">{trait.label}</span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          trait.points > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {trait.points > 0 ? "+" + trait.points : trait.points}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT: Selected List (Editable) */}
              <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
                <h3 className="text-green-400 font-bold uppercase text-sm mb-4">
                  Selected Traits
                </h3>
                {ficha.traits.length === 0 && (
                  <p className="text-gray-600 italic text-sm">
                    No traits selected.
                  </p>
                )}
                <div className="space-y-2">
                  {ficha.traits.map((t, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 p-2 rounded border border-gray-600 flex gap-2 items-center"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-sm text-gray-200">
                            {t.label}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Cost:</span>
                            <input
                              type="number"
                              value={t.points}
                              onChange={(e) =>
                                updateTraitPoints(i, Number(e.target.value))
                              }
                              className="w-12 bg-gray-900 border border-gray-700 text-center text-xs text-white rounded focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <input
                          placeholder="Notes / Modifiers..."
                          value={t.note || ""}
                          onChange={(e) => {
                            const newTraits = [...ficha.traits];
                            newTraits[i].note = e.target.value;
                            setFicha((prev) => ({
                              ...prev,
                              traits: newTraits,
                            }));
                          }}
                          className="w-full bg-transparent text-xs text-gray-400 border-b border-gray-700/50 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <button
                        onClick={() => removeTrait(i)}
                        className="h-full px-2 text-red-500 hover:bg-red-900/20 rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => handleSave()}
        disabled={saving}
        className={`fixed bottom-6 right-6 px-6 py-4 rounded-full shadow-lg font-bold text-white transition-all flex items-center gap-2 ${
          saving
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500 hover:scale-105"
        }`}
      >
        {saving ? "Salvando..." : "Salvar 💾"}
      </button>
    </div>
  );
}

// Componente auxiliar para stats derivados
function DerivedStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="bg-gray-800 p-2 rounded border border-gray-600 flex flex-col items-center">
      <span className="text-[10px] uppercase text-gray-400 font-bold">
        {label}
      </span>
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="text-[9px] text-gray-500">{sub}</span>
    </div>
  );
}
