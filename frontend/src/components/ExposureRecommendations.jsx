export default function ExposureRecommendations({ result }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900">
          Exposed Data Classes
        </h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {result.exposedDataClasses?.length > 0 ? (
            result.exposedDataClasses.map((dataClass) => (
              <span
                key={dataClass}
                className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {dataClass}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">
              No exposed data classes found.
            </span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900">
          Recommended Actions
        </h3>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
          {(result.recommendations || []).map((tip, index) => (
            <li
              key={index}
              className="flex items-start gap-2 rounded-lg bg-slate-50/80 p-2"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
