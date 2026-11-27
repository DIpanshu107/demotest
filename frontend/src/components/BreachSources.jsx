import { useMemo, useState } from "react";

export default function BreachSources({ breachNames }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredBreaches = useMemo(() => {
    if (!query.trim()) return breachNames;
    const normalizedQuery = query.toLowerCase();
    return breachNames.filter((name) =>
      String(name).toLowerCase().includes(normalizedQuery)
    );
  }, [breachNames, query]);

  const visibleBreaches = showAll
    ? filteredBreaches
    : filteredBreaches.slice(0, 8);

  if (breachNames.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Breach Sources ({filteredBreaches.length})
          </h3>
          <p className="text-xs text-slate-500">
            Filter or expand known breach records
          </p>
        </div>

        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter breach name..."
          className="w-48 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none transition focus:border-slate-700 focus:bg-white"
        />
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {visibleBreaches.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className="rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700"
          >
            {name}
          </span>
        ))}
      </div>

      {filteredBreaches.length > 8 && (
        <button
          type="button"
          onClick={() => setShowAll((previous) => !previous)}
          className="mt-3 cursor-pointer text-xs font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
        >
          {showAll
            ? "Show fewer breaches"
            : `Show all ${filteredBreaches.length} breaches`}
        </button>
      )}
    </div>
  );
}
