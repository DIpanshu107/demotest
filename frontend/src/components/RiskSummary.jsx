import { useState } from "react";
import { TIERS } from "../utils/risk";

export default function RiskSummary({ result, score, activeTier, components }) {
  const [hoveredTier, setHoveredTier] = useState(null);

  return (
    <>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Composite Risk Score
            </span>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-4xl font-bold tabular-nums tracking-tight text-slate-900">
                {score}
              </span>
              <span className="text-sm font-medium text-slate-400">/ 100</span>
              <span
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${activeTier.pill}`}
              >
                {result.riskLevel || `${activeTier.label} RISK`}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-right text-xs">
            <div className="text-slate-500">
              Masked Email:{" "}
              <span className="font-mono font-medium text-slate-800">
                {result.maskedEmail || "—"}
              </span>
            </div>
            <div className="mt-1 text-slate-500">
              Breaches Found:{" "}
              <span className="font-mono font-semibold tabular-nums text-slate-900">
                {result.breachCount ?? 0}
              </span>
              {result.demoModeUsed && (
                <span className="ml-1.5 rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                  DEMO
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeTier.bar}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIERS.map((tier) => {
            const isCurrent = tier.label === activeTier.label;
            return (
              <div
                key={tier.label}
                onMouseEnter={() => setHoveredTier(tier)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`cursor-default rounded-xl border px-3 py-2 transition-all ${
                  isCurrent
                    ? activeTier.activeRing
                    : "border-slate-100 bg-slate-50/70 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-800">{tier.label}</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {tier.range}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-2.5 min-h-[18px] text-xs text-slate-500">
          {hoveredTier
            ? `${hoveredTier.label} (${hoveredTier.range}): ${hoveredTier.desc}`
            : `Active Tier: ${activeTier.desc}`}
        </p>
      </div>

      {components.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-700">
              Score contribution
            </h3>
            <span className="text-[11px] text-slate-400">
              Backend-calculated components
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {components.map((component) => {
              const value = Math.min(100, Math.max(0, Number(component.value)));
              return (
                <div
                  key={component.label}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-600">
                      {component.label}
                    </span>
                    <span className="font-mono text-sm font-bold tabular-nums text-slate-900">
                      {value}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${component.color}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">
                    {component.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
