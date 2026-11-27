export default function ScanForm({
  email,
  textData,
  loading,
  error,
  onEmailChange,
  onTextChange,
  onSubmit,
  onReset,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all"
    >
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Scan Input</h2>
          <p className="text-xs text-slate-500">
            Check email breaches &amp; mask sensitive text
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600">
          /analyze
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-medium text-slate-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="name@domain.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-slate-800 focus:bg-white"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="textData"
              className="block text-xs font-medium text-slate-700"
            >
              Text Payload
            </label>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-slate-500">
              {textData.length} chars
            </span>
          </div>
          <textarea
            id="textData"
            rows={5}
            value={textData}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Enter text with PAN, phone, Aadhaar, or password hints..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition-all focus:border-slate-800 focus:bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2.5">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-all hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Running Scan..." : "Analyze Risk"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
