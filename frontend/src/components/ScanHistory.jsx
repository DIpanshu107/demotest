import { getTierForScore } from "../utils/risk";

export default function ScanHistory({ history, onClear, onSelect }) {
  if (history.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Recent Scans
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600"
        >
          Clear history
        </button>
      </div>
      <div className="space-y-1.5">
        {history.map((item) => {
          const tier = getTierForScore(item.score, item.level);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-left transition-all hover:border-slate-200 hover:bg-slate-100/80"
            >
              <span className="truncate pr-2 font-mono text-xs text-slate-700">
                {item.email || "No email"}
              </span>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums ${tier.pill}`}
              >
                {item.score} · {tier.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
