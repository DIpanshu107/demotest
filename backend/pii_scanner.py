import inspect
import json
import re
import sys

import pii_detector
from pii_detector import detector as detector_mod

TYPE_ALIASES = {
    "PAN_NUMBER": "PAN",
    "INDIAN_PAN": "PAN",
    "AADHAR": "AADHAAR",
    "AADHAAR_NUMBER": "AADHAAR",
    "MOBILE": "PHONE",
    "PHONE_NUMBER": "PHONE",
    "MOBILE_NUMBER": "PHONE",
    "EMAIL_ADDRESS": "EMAIL",
    "E_MAIL": "EMAIL",
}

PASSWORD_CONTEXT_RE = re.compile(
    r"\b(?:password|passwd|pwd|passcode|pin|otp|secret|api[_-]?key|access[_-]?token)\b\s*(?:[:=]|is\b|was\b|for\b)",
    re.IGNORECASE,
)
PAN_RE = re.compile(r"\b([A-Z]{2})[A-Z]{3}\d{4}([A-Z])\b")
PHONE_RE = re.compile(r"(?<!\d)(?:\+91[\s-]?|0)?([6-9]\d{5})(\d{4})(?!\d)")
EMAIL_RE = re.compile(r"\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*(@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b")


def normalize_type(raw_type) -> str:
    cleaned = str(raw_type).strip().upper().replace("-", "_").replace(" ", "_")
    return TYPE_ALIASES.get(cleaned, cleaned)


def find_detector_instance():
    candidates = []
    for mod in (detector_mod, pii_detector):
        for name, obj in inspect.getmembers(mod, inspect.isclass):
            lower_name = name.lower()
            if any(k in lower_name for k in ("detect", "pii", "protector", "scanner")):
                if obj not in candidates:
                    candidates.append(obj)

    for cls in candidates:
        try:
            sig = inspect.signature(cls)
            required_params = [
                p
                for p in sig.parameters.values()
                if p.default is inspect.Parameter.empty
                and p.kind not in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD)
            ]
            if not required_params:
                return cls()
        except Exception as exc:
            print(f"[pii_scanner] Instantiation failed for {cls.__name__}: {exc}", file=sys.stderr)
    return None


def fallback_mask(text: str, detected: list[str]) -> str:
    masked = text
    if "EMAIL" in detected:
        masked = EMAIL_RE.sub(r"\1***\2", masked)
    if "PAN" in detected:
        masked = PAN_RE.sub(r"\1***\2", masked)
    if "PHONE" in detected:
        masked = PHONE_RE.sub(r"XXXXXX\2", masked)
    return masked


def extract_types_and_mask(inst, text: str):
    detected = []
    masked = text

    if inst is not None:
        for method_name in ("detect", "scan", "analyze", "find_pii"):
            if hasattr(inst, method_name) and callable(getattr(inst, method_name)):
                try:
                    raw_findings = getattr(inst, method_name)(text)
                    if isinstance(raw_findings, dict):
                        for k in raw_findings.keys():
                            if k:
                                detected.append(normalize_type(k))
                    elif isinstance(raw_findings, (list, tuple, set)):
                        for item in raw_findings:
                            if isinstance(item, dict):
                                t = (
                                    item.get("type")
                                    or item.get("entity_type")
                                    or item.get("category")
                                    or item.get("label")
                                )
                                if t:
                                    detected.append(normalize_type(t))
                            else:
                                t = (
                                    getattr(item, "type", None)
                                    or getattr(item, "entity_type", None)
                                    or getattr(item, "category", None)
                                    or getattr(item, "label", None)
                                )
                                if t:
                                    detected.append(normalize_type(t))
                    break
                except Exception as exc:
                    print(f"[pii_scanner] {method_name} failed: {exc}", file=sys.stderr)

        for method_name in ("redact", "mask", "anonymize", "sanitize"):
            if hasattr(inst, method_name) and callable(getattr(inst, method_name)):
                try:
                    res = getattr(inst, method_name)(text)
                    if isinstance(res, str) and res:
                        masked = res
                        break
                    if isinstance(res, dict):
                        m = res.get("masked_text") or res.get("redacted_text") or res.get("text")
                        if isinstance(m, str) and m:
                            masked = m
                            break
                except Exception as exc:
                    print(f"[pii_scanner] {method_name} failed: {exc}", file=sys.stderr)

    if PASSWORD_CONTEXT_RE.search(text):
        detected.append("PASSWORD_HINT")

    deduped = list(dict.fromkeys(t for t in detected if t))

    if masked == text and deduped:
        masked = fallback_mask(text, deduped)

    return deduped, masked


def main():
    raw_input = sys.stdin.read()
    try:
        data = json.loads(raw_input) if raw_input.strip() else {}
    except json.JSONDecodeError as exc:
        print(f"[pii_scanner] Invalid JSON input: {exc}", file=sys.stderr)
        data = {}

    text = data.get("text") if data.get("text") is not None else data.get("textData", "")

    if not isinstance(text, str) or not text.strip():
        print(json.dumps({"detectedTypes": [], "maskedText": ""}))
        return

    inst = find_detector_instance()
    detected, masked = extract_types_and_mask(inst, text)
    print(json.dumps({"detectedTypes": detected, "maskedText": masked}))


if __name__ == "__main__":
    main()