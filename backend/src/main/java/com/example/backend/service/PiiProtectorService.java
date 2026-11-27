package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PiiProtectorService {

    private static final Pattern PAN_PATTERN = Pattern.compile("\\b[A-Z]{5}[0-9]{4}[A-Z]\\b");
    private static final Pattern AADHAAR_PATTERN = Pattern.compile("\\b[2-9][0-9]{3}\\s?[0-9]{4}\\s?[0-9]{4}\\b");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+91[-\\s]?)?[6-9][0-9]{9}\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    @Value("${app.pii-protector.python-cmd:python}")
    private String pythonCmd;

    @Value("${app.pii-protector.script-path:pii_scanner.py}")
    private String scriptPath;

    @Value("${app.pii-protector.enabled:true}")
    private boolean pythonEnabled;

    private final ObjectMapper objectMapper;

    public PiiProtectorService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public static class PiiScanResult {
        public List<String> detectedTypes = new ArrayList<>();
        public String maskedText = "";
    }

    public PiiScanResult scanAndMask(String inputText) {
        PiiScanResult result = new PiiScanResult();
        if (inputText == null || inputText.isBlank()) {
            return result;
        }

        Set<String> types = new LinkedHashSet<>();
        String masked = inputText;

        if (PAN_PATTERN.matcher(masked).find()) {
            types.add("PAN");
            masked = maskPattern(masked, PAN_PATTERN, 5, 1);
        }

        if (AADHAAR_PATTERN.matcher(masked).find()) {
            types.add("AADHAAR");
            masked = maskPattern(masked, AADHAAR_PATTERN, 8, 0);
        }

        if (PHONE_PATTERN.matcher(masked).find()) {
            types.add("PHONE");
            masked = maskPattern(masked, PHONE_PATTERN, 6, 0);
        }

        if (EMAIL_PATTERN.matcher(masked).find()) {
            types.add("EMAIL");
            masked = maskEmailInsideText(masked);
        }

        String lower = inputText.toLowerCase();
        if (lower.contains("password") || lower.contains("pwd") || lower.contains("secret")) {
            types.add("PASSWORD_HINT");
        }

        if (pythonEnabled) {
            try {
                JsonNode pyResult = runPythonProtector(inputText);
                if (pyResult != null) {
                    String pyMasked = pyResult.path("maskedText").asString("");
                    if (!pyMasked.isBlank()) {
                        masked = pyMasked;
                    }
                    JsonNode pyTypes = pyResult.path("detectedTypes");
                    if (pyTypes.isArray()) {
                        for (JsonNode t : pyTypes) {
                            if (t.isString() && !t.asString("").isBlank()) {
                                types.add(t.asString("").toUpperCase());
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }

        result.detectedTypes = new ArrayList<>(types);
        result.maskedText = masked;
        return result;
    }

    private JsonNode runPythonProtector(String text) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(pythonCmd, scriptPath);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        String payload = objectMapper.writeValueAsString(Map.of("text", text));
        try (OutputStream os = process.getOutputStream()) {
            os.write(payload.getBytes(StandardCharsets.UTF_8));
            os.flush();
        }

        String lastJsonLine = null;
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                    lastJsonLine = trimmed;
                }
            }
        }

        boolean finished = process.waitFor(5, TimeUnit.SECONDS);
        if (!finished || process.exitValue() != 0 || lastJsonLine == null) {
            return null;
        }
        return objectMapper.readTree(lastJsonLine);
    }

    public String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        String[] parts = email.split("@", 2);
        String name = parts[0];
        if (name.length() <= 2) {
            return name.charAt(0) + "***@" + parts[1];
        }
        return name.substring(0, 2) + "***@" + parts[1];
    }

    private String maskPattern(String text, Pattern pattern, int prefixMaskLen, int suffixKeepLen) {
        Matcher matcher = pattern.matcher(text);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String match = matcher.group();
            int len = match.length();
            String maskedVal = "X".repeat(Math.min(prefixMaskLen, len - suffixKeepLen))
                    + match.substring(Math.min(prefixMaskLen, len - suffixKeepLen));
            matcher.appendReplacement(sb, Matcher.quoteReplacement(maskedVal));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String maskEmailInsideText(String text) {
        Matcher matcher = EMAIL_PATTERN.matcher(text);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            matcher.appendReplacement(sb, Matcher.quoteReplacement(maskEmail(matcher.group())));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }
}