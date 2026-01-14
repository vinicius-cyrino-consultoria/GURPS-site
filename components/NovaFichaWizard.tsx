"use client";
import { useState, useEffect } from "react";

// Custos GURPS 4e
const COSTS = { ST: 10, DX: 20, IQ: 20, HT: 10 };

type WizardProps = {
  onCancel: () => void;
  onCreate: (data: any) => void;
};

export default function NovaFichaWizard({ onCancel, onCreate }: WizardProps) {
  const [step, setStep] = useState(1);
  const [spent, setSpent] = useState(0);

  const [draft, setDraft] = useState({
    name: "",
    player: "",
    point_total: 150,
    attributes: { ST: 10, DX: 10, IQ: 10, HT: 10 },
  });

  // Recalcula pontos gastos sempre que atributos mudam
  useEffect(() => {
    let cost = 0;
    cost += (draft.attributes.ST - 10) * COSTS.ST;
    cost += (draft.attributes.DX - 10) * COSTS.DX;
    cost += (draft.attributes.IQ - 10) * COSTS.IQ;
    cost += (draft.attributes.HT - 10) * COSTS.HT;
    setSpent(cost);
  }, [draft.attributes]);

  const remaining = draft.point_total - spent;

  const handleAttr = (attr: "ST" | "DX" | "IQ" | "HT", delta: number) => {
    setDraft((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attr]: Math.max(1, prev.attributes[attr] + delta),
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-bold text-white uppercase tracking-wide">
            Novo Personagem
          </h2>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  step >= s ? "bg-blue-500" : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Corpo do Wizard */}
        <div className="p-6 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-blue-400 font-bold uppercase text-sm">
                Passo 1: Conceito
              </h3>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">
                  Nome
                </label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">
                  Nível de Poder
                </label>
                <select
                  value={draft.point_total}
                  onChange={(e) =>
                    setDraft({ ...draft, point_total: Number(e.target.value) })
                  }
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white outline-none"
                >
                  <option value={100}>100 pts (Iniciante)</option>
                  <option value={150}>150 pts (Heróico - Padrão)</option>
                  <option value={250}>250 pts (Épico)</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-700 pb-2">
                <h3 className="text-blue-400 font-bold uppercase text-sm">
                  Passo 2: Atributos
                </h3>
                <span
                  className={`font-mono text-sm ${
                    remaining < 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  Restante: {remaining} pts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(
                  Object.keys(draft.attributes) as Array<
                    keyof typeof draft.attributes
                  >
                ).map((key) => (
                  <div
                    key={key}
                    className="bg-gray-800 p-3 rounded border border-gray-700 flex flex-col items-center"
                  >
                    <span className="font-bold text-gray-400 text-lg">
                      {key}
                    </span>
                    <div className="flex items-center gap-3 my-1">
                      <button
                        onClick={() => handleAttr(key, -1)}
                        className="w-6 h-6 rounded bg-gray-700 hover:bg-red-900 text-white flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold w-6 text-center">
                        {draft.attributes[key]}
                      </span>
                      <button
                        onClick={() => handleAttr(key, 1)}
                        className="w-6 h-6 rounded bg-gray-700 hover:bg-green-900 text-white flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      Custo: {COSTS[key]} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <h3 className="text-green-400 font-bold uppercase text-sm">
                Pronto para criar!
              </h3>
              <div className="bg-gray-800 p-4 rounded text-left text-sm space-y-2 text-gray-300">
                <p>
                  <strong>Nome:</strong> {draft.name || "Sem Nome"}
                </p>
                <p>
                  <strong>Pontos:</strong> {spent} gastos / {remaining} sobrando
                </p>
                <hr className="border-gray-700" />
                <p className="font-mono text-center pt-2 text-white">
                  ST {draft.attributes.ST} • DX {draft.attributes.DX} • IQ{" "}
                  {draft.attributes.IQ} • HT {draft.attributes.HT}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-between">
          <button
            onClick={step === 1 ? onCancel : () => setStep((s) => s - 1)}
            className="text-gray-400 hover:text-white text-sm px-4"
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !draft.name}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-bold"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={() => onCreate({ ...draft, unspent_pts: remaining })}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded text-sm font-bold shadow-lg shadow-green-900/20"
            >
              Criar Ficha
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
