package com.example.backend.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PiiProtectorService {

    private static final Pattern PAN_PATTERN = Pattern.compile("\\b[A-Z]{5}[0-9]{4}[A-Z]\\b");
    private static final Pattern AADHAAR_PATTERN = Pattern.compile("\\b[2-9][0-9]{3}\\s?[0-9]{4}\\s?[0-9]{4}\\b");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+91[-\\s]?)?[6-9][0-9]{9}\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    public static class PiiScanResult {
        public List<String> detectedTypes = new ArrayList<>();
        public String maskedText = "";
    }

    public PiiScanResult scanAndMask(String inputText) {
        PiiScanResult result = new PiiScanResult();
        if (inputText == null || inputText.isBlank()) {
            return result;
        }

        String masked = inputText;

        if (PAN_PATTERN.matcher(masked).find()) {
            result.detectedTypes.add("PAN");
            masked = maskPattern(masked, PAN_PATTERN, 5, 1);
        }

        if (AADHAAR_PATTERN.matcher(masked).find()) {
            result.detectedTypes.add("AADHAAR");
            masked = maskPattern(masked, AADHAAR_PATTERN, 8, 0);
        }

        if (PHONE_PATTERN.matcher(masked).find()) {
            result.detectedTypes.add("PHONE");
            masked = maskPattern(masked, PHONE_PATTERN, 6, 0);
        }

        if (EMAIL_PATTERN.matcher(masked).find()) {
            result.detectedTypes.add("EMAIL");
            masked = maskEmailInsideText(masked);
        }

        String lower = inputText.toLowerCase();
        if (lower.contains("password") || lower.contains("pwd") || lower.contains("secret")) {
            result.detectedTypes.add("PASSWORD_HINT");
        }

        result.maskedText = masked;
        return result;
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