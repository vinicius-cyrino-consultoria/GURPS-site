// components/TraitsTab.tsx
"use client";

import { useState, useMemo } from "react";
import { SAMPLE_TRAITS } from "../utils/utils";

// 1. Atualizamos a interface para incluir os novos campos
interface TraitItem {
  id: string;
  label: string;
  points: number;
  note?: string;
  description?: string;
  // Campos para filtros (opcionais, pois o dado pode não ter ainda)
  physical_type?: "mental" | "physical" | "social";
  rarity?: "mundane" | "exotic" | "supernatural";
}

interface TraitsTabProps {
  traits: TraitItem[];
  onAdd: (trait: TraitItem) => void;
  onRemove: (index: number) => void;
  onUpdatePoints: (index: number, points: number) => void;
  onUpdateNote: (index: number, note: string) => void;
}

export default function TraitsTab({
  traits,
  onAdd,
  onRemove,
  onUpdatePoints,
  onUpdateNote,
}: TraitsTabProps) {
  const [viewingTrait, setViewingTrait] = useState<TraitItem | null>(null);

  // 2. Estados para os Filtros
  const [filterType, setFilterType] = useState<
    "all" | "advantage" | "disadvantage"
  >("all");
  const [filterPhy, setFilterPhy] = useState<
    "all" | "mental" | "physical" | "social"
  >("all");
  const [filterRarity, setFilterRarity] = useState<
    "all" | "mundane" | "exotic" | "supernatural"
  >("all");

  // 3. Lógica de Filtragem (useMemo para performance, embora opcional em listas pequenas)
  const filteredTraits = useMemo(() => {
    return SAMPLE_TRAITS.filter((t: any) => {
      const trait = t as TraitItem; // Cast para garantir tipagem interna

      // Filtro 1: Type (Baseado nos pontos: Positivo = Vantagem, Negativo = Desvantagem)
      if (filterType === "advantage" && trait.points < 0) return false;
      if (filterType === "disadvantage" && trait.points >= 0) return false;

      // Filtro 2: Physical Type (Mental, Physical, Social)
      if (filterPhy !== "all" && trait.physical_type !== filterPhy)
        return false;

      // Filtro 3: Rarity (Mundane, Exotic, Supernatural)
      if (filterRarity !== "all" && trait.rarity !== filterRarity) return false;

      return true;
    });
  }, [filterType, filterPhy, filterRarity]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ESQUERDA: Seletor (Picker) */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700 flex flex-col h-full">
          <h3 className="text-blue-400 font-bold uppercase text-sm mb-4">
            Add Traits
          </h3>

          {/* --- ÁREA DE FILTROS --- */}
          <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-800 p-2 rounded border border-gray-700">
            {/* Filtro: Type */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="bg-gray-900 text-xs text-white border border-gray-600 rounded p-1 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="advantage">Advantage (+)</option>
                <option value="disadvantage">Disadvantage (-)</option>
              </select>
            </div>

            {/* Filtro: Category */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">
                Category
              </label>
              <select
                value={filterPhy}
                onChange={(e) => setFilterPhy(e.target.value as any)}
                className="bg-gray-900 text-xs text-white border border-gray-600 rounded p-1 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="mental">Mental</option>
                <option value="physical">Physical</option>
                <option value="social">Social</option>
              </select>
            </div>

            {/* Filtro: Rarity */}
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1">
                Rarity
              </label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value as any)}
                className="bg-gray-900 text-xs text-white border border-gray-600 rounded p-1 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="mundane">Mundane</option>
                <option value="exotic">Exotic</option>
                <option value="supernatural">Supernatural</option>
              </select>
            </div>
          </div>

          {/* --- LISTA FILTRADA --- */}
          <div className="grid gap-2 mb-6 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
            {filteredTraits.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4 italic">
                No traits match filters.
              </p>
            ) : (
              filteredTraits.map((trait: TraitItem) => (
                <div key={trait.id} className="flex gap-1 group">
                  <button
                    onClick={() => onAdd(trait)}
                    className="flex-1 flex justify-between items-center bg-gray-800 hover:bg-gray-700 p-2 rounded border border-gray-600 text-left transition-all"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{trait.label}</span>
                      {/* Mostrar tags pequenas se existirem */}
                      {(trait.physical_type || trait.rarity) && (
                        <div className="flex gap-1 mt-0.5">
                          {trait.physical_type && (
                            <span className="text-[9px] text-gray-400 uppercase bg-gray-900 px-1 rounded">
                              {trait.physical_type.slice(0, 3)}
                            </span>
                          )}
                          {trait.rarity && (
                            <span className="text-[9px] text-gray-500 uppercase bg-gray-900 px-1 rounded">
                              {trait.rarity.slice(0, 3)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        trait.points > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trait.points > 0 ? "+" + trait.points : trait.points}
                    </span>
                  </button>

                  {/* Botão de Info */}
                  <button
                    onClick={() => setViewingTrait(trait)}
                    className="w-10 bg-gray-800 hover:bg-blue-900/50 border border-gray-600 rounded flex items-center justify-center text-blue-400 font-bold"
                    title="View Description"
                  >
                    ?
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DIREITA: Lista de Selecionados (Selected List) */}
        <div className="bg-gray-900/50 p-4 rounded border border-gray-700 h-full">
          <h3 className="text-green-400 font-bold uppercase text-sm mb-4">
            Selected Traits
          </h3>
          {traits.length === 0 && (
            <p className="text-gray-600 italic text-sm">No traits selected.</p>
          )}
          <div className="space-y-2">
            {traits.map((t, i) => (
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
                          onUpdatePoints(i, Number(e.target.value))
                        }
                        className="w-12 bg-gray-900 border border-gray-700 text-center text-xs text-white rounded focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <input
                    placeholder="Notes / Modifiers..."
                    value={t.note || ""}
                    onChange={(e) => onUpdateNote(i, e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-400 border-b border-gray-700/50 focus:border-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={() => onRemove(i)}
                  className="h-full px-2 text-red-500 hover:bg-red-900/20 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODAL DE DESCRIÇÃO --- */}
      {viewingTrait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-600 p-6 rounded-lg max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setViewingTrait(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white">
                  {viewingTrait.label}
                </h3>
                {/* Badges no Modal */}
                <div className="flex gap-2 mt-1">
                  {viewingTrait.physical_type && (
                    <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded uppercase">
                      {viewingTrait.physical_type}
                    </span>
                  )}
                  {viewingTrait.rarity && (
                    <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded uppercase">
                      {viewingTrait.rarity}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`font-mono font-bold text-sm ${
                  viewingTrait.points > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                [{viewingTrait.points}]
              </span>
            </div>
            <div className="text-gray-300 text-sm leading-relaxed mb-6">
              {viewingTrait.description || "No description available."}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewingTrait(null)}
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onAdd(viewingTrait);
                  setViewingTrait(null);
                }}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold text-sm"
              >
                Add Trait
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
