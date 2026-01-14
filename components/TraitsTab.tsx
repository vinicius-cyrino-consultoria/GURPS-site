// components/TraitsTab.tsx
"use client";

import { useState } from "react";
import { SAMPLE_TRAITS } from "../utils/utils"; // Certifique-se que o caminho está correto

interface TraitItem {
  id: string;
  label: string;
  points: number;
  note?: string;
  description?: string;
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
  // O estado de "qual traço estou vendo" fica aqui agora, limpando o pai
  const [viewingTrait, setViewingTrait] = useState<TraitItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ESQUERDA: Seletor (Picker) */}
        <div className="bg-gray-900 p-4 rounded border border-gray-700">
          <h3 className="text-blue-400 font-bold uppercase text-sm mb-4">
            Add Advantages / Disadvantages
          </h3>

          <div className="grid gap-2 mb-6">
            {SAMPLE_TRAITS.map((trait: any) => (
              <div key={trait.id} className="flex gap-1 group">
                <button
                  onClick={() => onAdd(trait)}
                  className="flex-1 flex justify-between items-center bg-gray-800 hover:bg-gray-700 p-2 rounded border border-gray-600 text-left transition-all"
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

                {/* Botão de Info */}
                <button
                  onClick={() => setViewingTrait(trait)}
                  className="w-10 bg-gray-800 hover:bg-blue-900/50 border border-gray-600 rounded flex items-center justify-center text-blue-400 font-bold"
                  title="View Description"
                >
                  ?
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* DIREITA: Lista de Selecionados (Selected List) */}
        <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
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

      {/* --- MODAL DE DESCRIÇÃO (Agora vive aqui dentro) --- */}
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
              <h3 className="text-xl font-bold text-white">
                {viewingTrait.label}
              </h3>
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
