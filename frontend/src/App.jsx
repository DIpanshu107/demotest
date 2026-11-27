import { useRef, useState } from "react";
import AppHeader from "./components/AppHeader";
import BreachSources from "./components/BreachSources";
import ExposureRecommendations from "./components/ExposureRecommendations";
import PiiResult from "./components/PiiResult";
import RiskSummary from "./components/RiskSummary";
import ScanForm from "./components/ScanForm";
import ScanHistory from "./components/ScanHistory";
import ScanProgress from "./components/ScanProgress";
import {
  API_URL,
  getScoreComponents,
  getTierForScore,
} from "./utils/risk";

export default function App() {
  const [email, setEmail] = useState("test@example.com");
  const [textData, setTextData] = useState(
    "My phone number is 8305337610 and PAN is GGPPB5287L."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const scanTimerRef = useRef(null);

  async function handleAnalyze(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setScanStep(0);
    window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = window.setInterval(() => {
      setScanStep((current) => Math.min(current + 1, 3));
    }, 550);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          textData,
          text: textData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setScanStep(3);

      setHistory((previous) => [
        {
          id: Date.now(),
          email: email.trim(),
          textData,
          score: data.riskScore ?? 0,
          level: data.riskLevel ?? "LOW RISK",
          data,
        },
        ...previous.slice(0, 3),
      ]);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to connect to backend service."
      );
    } finally {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
      setLoading(false);
    }
  }

  function handleReset() {
    window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = null;
    setEmail("");
    setTextData("");
    setResult(null);
    setError("");
  }

  function handleSelectHistory(item) {
    setEmail(item.email);
    setTextData(item.textData);
    setResult(item.data);
  }

  async function handleCopyMasked() {
    if (!result?.maskedText) return;
    try {
      await navigator.clipboard.writeText(result.maskedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const score = Math.min(100, Math.max(0, Number(result?.riskScore ?? 0)));
  const activeTier = getTierForScore(score, result?.riskLevel);
  const scoreComponents = getScoreComponents(result);

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-slate-900">
      <AppHeader
        onSelectPreset={(preset) => {
          setEmail(preset.email);
          setTextData(preset.textData);
          setError("");
        }}
      />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-5">
          <ScanForm
            email={email}
            textData={textData}
            loading={loading}
            error={error}
            onEmailChange={setEmail}
            onTextChange={setTextData}
            onSubmit={handleAnalyze}
            onReset={handleReset}
          />
          <ScanHistory
            history={history}
            onClear={() => setHistory([])}
            onSelect={handleSelectHistory}
          />
        </section>

        <section className="space-y-5 lg:col-span-7">
          {!result && !loading && (
            <div className="flex min-h-[410px] flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-xs">
              <div className="mb-3 rounded-xl bg-slate-100 px-3 py-1 font-mono text-xs text-slate-600">
                READY FOR INPUT
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                No risk assessment generated yet
              </h2>
              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
                Choose one of the sample presets above or enter an email and
                text snippet on the left to inspect risk score, PII redaction,
                and breach findings.
              </p>
            </div>
          )}

          {loading && <ScanProgress scanStep={scanStep} />}

          {result && !loading && (
            <>
              <RiskSummary
                result={result}
                score={score}
                activeTier={activeTier}
                components={scoreComponents}
              />
              <PiiResult
                result={result}
                copied={copied}
                onCopy={handleCopyMasked}
              />
              <ExposureRecommendations result={result} />
              <BreachSources
                breachNames={
                  Array.isArray(result.breachNames) ? result.breachNames : []
                }
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
