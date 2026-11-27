import { SCAN_STEPS } from "../utils/risk";

export default function ScanProgress({ scanStep }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Running risk assessment
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Email and text findings are combined into the final score
          </p>
        </div>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600">
          STEP {scanStep + 1} / 4
        </span>
      </div>

      <div className="space-y-2">
        {SCAN_STEPS.map((step, index) => {
          const complete = index < scanStep;
          const active = index === scanStep;
          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-all ${
                active
                  ? "border-slate-300 bg-slate-50"
                  : complete
                    ? "border-emerald-100 bg-emerald-50/50"
                    : "border-slate-100 bg-white"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  complete
                    ? "bg-emerald-600 text-white"
                    : active
                      ? "animate-pulse bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {complete ? "✓" : index + 1}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800">
                  {step.label}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {active
                    ? "Processing..."
                    : complete
                      ? "Completed"
                      : step.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
