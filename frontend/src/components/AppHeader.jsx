import { PRESETS } from "../utils/risk";

export default function AppHeader({ onSelectPreset }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold tracking-wider text-white">
            PR
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900">
              PII &amp; Breach Risk Analyzer
            </h1>
            <p className="text-xs text-slate-500">
              Text redaction + breach exposure scoring
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium text-slate-400">
            Samples:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
