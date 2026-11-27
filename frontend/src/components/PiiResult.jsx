export default function PiiResult({ result, copied, onCopy }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Detected PII &amp; Redacted Text
        </h3>
        <button
          type="button"
          onClick={onCopy}
          className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-all hover:bg-slate-100"
        >
          {copied ? "Copied!" : "Copy Masked Text"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {result.detectedPiiTypes?.length > 0 ? (
          result.detectedPiiTypes.map((type) => (
            <span
              key={type}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-800"
            >
              {type}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-500">
            No PII types detected in submitted text.
          </span>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 font-mono text-xs leading-relaxed text-slate-700">
        {result.maskedText || "No text content provided."}
      </div>
    </div>
  );
}
