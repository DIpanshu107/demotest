export const API_URL = "https://demotest-production-07b01c3b.up.railway.app/api/risk-score/analyze"//"http://localhost:8080/api/risk-score/analyze";


export const PRESETS = [
  {
    label: "PAN + Phone",
    email: "clean.check@example.org",
    textData:
      "I am Dipanshu Birla, my phone number is 8305337610 and my PAN is GGPPB5287L.",
  },
  {
    label: "215 Breaches",
    email: "test@example.com",
    textData: "Checking email breach exposure only.",
  },
  {
    label: "Low Risk",
    email: "test@examle.com",
    textData: "Sharing a routine project status note with no sensitive IDs.",
  },
];

export const TIERS = [
  {
    label: "LOW",
    range: "0–25",
    desc: "Minimal or no sensitive PII and no high-severity breaches.",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-600",
    activeRing: "ring-2 ring-emerald-500/30 border-emerald-400 bg-emerald-50/50",
  },
  {
    label: "MEDIUM",
    range: "26–55",
    desc: "Moderate contact PII or minor breach exposure without critical leaks.",
    pill: "bg-amber-50 text-amber-800 border-amber-200",
    bar: "bg-amber-500",
    activeRing: "ring-2 ring-amber-500/30 border-amber-400 bg-amber-50/50",
  },
  {
    label: "HIGH",
    range: "56–80",
    desc: "25+ breaches, critical exposed fields, or unmasked IDs like PAN/Aadhaar.",
    pill: "bg-orange-50 text-orange-800 border-orange-200",
    bar: "bg-orange-500",
    activeRing: "ring-2 ring-orange-500/30 border-orange-400 bg-orange-50/50",
  },
  {
    label: "CRITICAL",
    range: "81–100",
    desc: "Combined high breach volume, critical data, and sensitive text PII.",
    pill: "bg-red-50 text-red-700 border-red-200",
    bar: "bg-red-600",
    activeRing: "ring-2 ring-red-500/30 border-red-400 bg-red-50/50",
  },
];

export const SCAN_STEPS = [
  { label: "Email Validation", detail: "Checking the submitted address" },
  { label: "PII Detection", detail: "Finding and masking sensitive text" },
  { label: "Breach Lookup", detail: "Checking email breach exposure" },
  { label: "Final Scoring", detail: "Combining all risk components" },
];

export function getTierForScore(score = 0, level = "") {
  const upper = level.toUpperCase();
  if (upper.includes("CRITICAL") || score >= 81) return TIERS[3];
  if (upper.includes("HIGH") || score >= 56) return TIERS[2];
  if (upper.includes("MEDIUM") || score >= 26) return TIERS[1];
  return TIERS[0];
}

export function getScoreComponents(result) {
  return [
    {
      label: "PII Text",
      value: result?.piiScore ?? result?.piiRiskScore ?? result?.textPiiScore,
      detail: `${Array.isArray(result?.detectedPiiTypes) ? result.detectedPiiTypes.length : 0} detected PII types`,
      color: "bg-indigo-500",
    },
    {
      label: "Email Breaches",
      value: result?.breachScore ?? result?.emailBreachScore,
      detail: `${result?.breachCount ?? 0} breach matches`,
      color: "bg-sky-500",
    },
    {
      label: "Critical Exposure",
      value:
        result?.criticalExposureScore ??
        result?.exposedDataScore ??
        result?.exposureScore,
      detail: `${Array.isArray(result?.exposedDataClasses) ? result.exposedDataClasses.length : 0} exposed data classes`,
      color: "bg-rose-500",
    },
  ].filter((component) => Number.isFinite(Number(component.value)));
}
