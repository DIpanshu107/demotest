package com.example.backend.service;

import com.example.backend.dto.RiskAnalyzeRequest;
import com.example.backend.dto.RiskAnalyzeResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RiskScoreService {

    private final PiiProtectorService piiProtectorService;
    private final HibpService hibpService;

    public RiskScoreService(PiiProtectorService piiProtectorService, HibpService hibpService) {
        this.piiProtectorService = piiProtectorService;
        this.hibpService = hibpService;
    }

    public RiskAnalyzeResponse analyze(RiskAnalyzeRequest request) {
        PiiProtectorService.PiiScanResult piiResult = piiProtectorService.scanAndMask(request.getTextData());
        HibpService.BreachResult breachResult = hibpService.checkEmailBreaches(request.getEmail());

        int score = 10; // Base score

        // 1. Pillar 1: Text PII Scoring (Distinct types par diminishing/tiered weightage)
        Set<String> uniquePiiTypes = piiResult.detectedTypes != null
                ? new HashSet<>(piiResult.detectedTypes)
                : Set.of();

        for (String type : uniquePiiTypes) {
            switch (type) {
                case "AADHAAR", "PAN" -> score += 46;        // 10 + 46 = 56 -> Direct HIGH RISK
                case "PASSWORD_HINT" -> score += 40;
                case "PHONE" -> score += 18;                 // 10 + 18 = 28 -> MEDIUM RISK
                case "EMAIL" -> score += 10;                 // 10 + 10 = 20 -> LOW RISK
            }
        }

        // Multiple distinct PIIs ek hi text mein hone par identity-linking bonus
        if (uniquePiiTypes.size() >= 2) {
            score += 10;
        }

        // 2. Pillar 2: Email Breach Scoring (Breach Count + Exposed Data Sensitivity)
        if (breachResult.breachCount > 0) {
            if (breachResult.breachCount >= 25) {
                score += 46; // 10 base + 46 = 56 -> Direct HIGH RISK
            } else if (breachResult.breachCount >= 10) {
                score += 32; // 10 base + 32 = 42 -> MEDIUM RISK
            } else if (breachResult.breachCount >= 3) {
                score += 22; // 10 base + 22 = 32 -> MEDIUM RISK
            } else {
                score += 16; // 1-2 breaches -> 10 + 16 = 26 -> MEDIUM RISK
            }

            // Exposed Data Classes ki severity check
            if (breachResult.exposedDataClasses != null && !breachResult.exposedDataClasses.isEmpty()) {
                boolean hasCriticalData = breachResult.exposedDataClasses.stream()
                        .anyMatch(d -> d != null && (
                                d.toLowerCase().contains("password")
                                        || d.toLowerCase().contains("credit card")
                                        || d.toLowerCase().contains("financial")
                                        || d.toLowerCase().contains("government")
                                        || d.toLowerCase().contains("auth token")
                                        || d.toLowerCase().contains("social security")
                        ));

                boolean hasModerateData = breachResult.exposedDataClasses.stream()
                        .anyMatch(d -> d != null && (
                                d.toLowerCase().contains("phone")
                                        || d.toLowerCase().contains("physical address")
                                        || d.toLowerCase().contains("date of birth")
                        ));

                if (hasCriticalData) {
                    score += 20;
                } else if (hasModerateData) {
                    score += 10;
                } else {
                    score += 5;
                }
            }
        }

        // 3. Compound Risk Bonus (Jab Text PII aur Email Breach dono ek saath hon)
        if (!uniquePiiTypes.isEmpty() && breachResult.breachCount > 0) {
            score += 15;
        }

        score = Math.min(100, score);

        // 4. Updated Risk Level Thresholds (0-25, 26-55, 56-80, 81-100)
        String riskLevel;
        if (score <= 25) {
            riskLevel = "LOW RISK";
        } else if (score <= 55) {
            riskLevel = "MEDIUM RISK";
        } else if (score <= 80) {
            riskLevel = "HIGH RISK";
        } else {
            riskLevel = "CRITICAL RISK";
        }

        List<String> recommendations = buildRecommendations(piiResult.detectedTypes, breachResult.breachCount);

        RiskAnalyzeResponse response = new RiskAnalyzeResponse();
        response.setRiskScore(score);
        response.setRiskLevel(riskLevel);
        response.setMaskedEmail(piiProtectorService.maskEmail(request.getEmail()));
        response.setMaskedText(piiResult.maskedText);
        response.setDetectedPiiTypes(piiResult.detectedTypes);
        response.setBreachCount(breachResult.breachCount);
        response.setBreachNames(breachResult.breachNames);
        response.setExposedDataClasses(breachResult.exposedDataClasses);
        response.setDemoModeUsed(breachResult.demoModeUsed);
        response.setRecommendations(recommendations);
        response.setAnalyzedAt(LocalDateTime.now());

        System.out.println("[AUDIT SUMMARY] Time=" + response.getAnalyzedAt()
                + " | Score=" + score + " | Level=" + riskLevel
                + " | Breaches=" + breachResult.breachCount
                + " | PiiTypes=" + piiResult.detectedTypes);

        return response;
    }

    private List<String> buildRecommendations(List<String> piiTypes, int breachCount) {
        List<String> tips = new ArrayList<>();
        if (breachCount > 0) {
            tips.add("Change your email account password immediately and enable Two-Factor Authentication (2FA).");
        }
        if (piiTypes != null && (piiTypes.contains("PAN") || piiTypes.contains("AADHAAR"))) {
            tips.add("Do not share unmasked Aadhaar or PAN details in public text, on forms, or on unverified apps.");
        }
        if (piiTypes != null && piiTypes.contains("PHONE")) {
            tips.add("To protect yourself from SIM-swap fraud, enable a carrier/port lock with your telecom operator.");
        }
        if (tips.isEmpty()) {
            tips.add("Your exposure is currently low. Continue using strong passwords and performing periodic privacy checks.");
        }
        return tips;
    }
}