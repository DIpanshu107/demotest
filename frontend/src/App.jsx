import React, { useState } from "react";
import { ShieldAlert, ShieldCheck, Mail, FileText, Lock, Sparkles, AlertTriangle } from "lucide-react";

const API_BASE_URL = "http://localhost:8080/api/risk-score";

export default function App() {
  const [email, setEmail] = useState("");
  const [textData, setTextData] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!email.trim()) {
      setError("Kripya ek valid email address daalein.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          textData: textData,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || "API request fail ho gayi.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Backend se connect nahi ho pa raha. Check karein ki Spring Boot port 8080 par chal raha hai.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeStyle = (level) => {
    switch (level) {
      case "LOW RISK":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "MEDIUM RISK":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "HIGH RISK":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "CRITICAL RISK":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getScoreBarColor = (score) => {
    if (score <= 30) return "bg-emerald-500";
    if (score <= 65) return "bg-amber-500";
    if (score <= 85) return "bg-orange-500";
    return "bg-red-600";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-3 py-1 rounded-full mb-2">
              <Lock className="w-3.5 h-3.5" /> DPDP Prototype Module
            </div>
            <h1 className="text-2xl font-bold text-white">PII Risk Score Generator</h1>
            <p className="text-sm text-slate-400 mt-1">
              Email breach exposure check, sensitive PII masking, aur 0–100 risk score analysis.
            </p>
          </div>
          <span className="self-start sm:self-center text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Demo Mode Ready
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-1.5">
              <Mail className="w-4 h-4 text-indigo-400" /> Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. test@example.com ya safe@example.com"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-200 mb-1.5">
              <FileText className="w-4 h-4 text-indigo-400" /> Sample Text / Data to Scan for PII (Optional)
            </label>
            <textarea
              rows={3}
              value={textData}
              onChange={(e) => setTextData(e.target.value)}
              placeholder="Optional: Koi sample text likhein jisme PAN (ABCDE1234F), Aadhaar, phone, ya password hint ho..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-300 bg-red-950/60 border border-red-800 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3 rounded-xl transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? "Analyzing Risk..." : "Generate Risk Score"}
          </button>
        </form>

        {/* Result Section */}
        {result && (
          <div className="space-y-4">
            {/* Score & Level Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  {result.riskScore > 65 ? (
                    <ShieldAlert className="w-7 h-7 text-red-400" />
                  ) : (
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  )}
                  <div>
                    <div className="text-xs text-slate-400">Calculated Risk Score</div>
                    <div className="text-3xl font-extrabold text-white">{result.riskScore} / 100</div>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${getRiskBadgeStyle(result.riskLevel)}`}>
                  {result.riskLevel}
                </span>
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getScoreBarColor(result.riskScore)}`}
                  style={{ width: `${result.riskScore}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>Masked Email: <strong className="text-slate-200">{result.maskedEmail}</strong></span>
                <span>Breaches Found: <strong className="text-slate-200">{result.breachCount}</strong></span>
                <span>Mode: <strong className="text-slate-200">{result.demoModeUsed ? "Demo / Mock" : "Live API"}</strong></span>
              </div>
            </div>

            {/* PII Masking & Breach Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PII & Masking */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-base font-semibold text-white">PII Detection & Masking</h2>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Detected PII Types</div>
                  {result.detectedPiiTypes?.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.detectedPiiTypes.map((type) => (
                        <span key={type} className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-0.5 rounded-md">
                          {type}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Text mein koi PII detect nahi hua.</p>
                  )}
                </div>

                {result.maskedText && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Masked Output</div>
                    <div className="text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 break-words">
                      {result.maskedText}
                    </div>
                  </div>
                )}
              </div>

              {/* Breach Info */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-base font-semibold text-white">Breach Exposure Summary</h2>
                {result.breachNames?.length > 0 ? (
                  <>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Matched Breaches</div>
                      <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                        {result.breachNames.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Exposed Data Classes</div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.exposedDataClasses.map((cls) => (
                          <span key={cls} className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-0.5 rounded-md">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-emerald-300">Is email ke liye koi simulated breach record nahi mila.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
              <h2 className="text-base font-semibold text-white">Recommended Actions</h2>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                {result.recommendations?.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}