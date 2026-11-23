package com.example.backend.service;

import com.example.backend.dto.RiskAnalyzeRequest;
import com.example.backend.dto.RiskAnalyzeResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

        int score = 10;

        for (String type : piiResult.detectedTypes) {
            switch (type) {
                case "AADHAAR", "PAN" -> score += 40;
                case "PASSWORD_HINT" -> score += 35;
                case "PHONE" -> score += 15;
                case "EMAIL" -> score += 10;
            }
        }

        if (breachResult.breachCount > 0) {
            score += 25;
            score += Math.min(15, (breachResult.breachCount - 1) * 5);
        }

        if (!piiResult.detectedTypes.isEmpty() && breachResult.breachCount > 0) {
            score += 10;
        }

        score = Math.min(100, score);

        String riskLevel;
        if (score <= 30) {
            riskLevel = "LOW RISK";
        } else if (score <= 65) {
            riskLevel = "MEDIUM RISK";
        } else if (score <= 85) {
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
            tips.add("Apne email account ka password turant change karein aur Two-Factor Authentication (2FA) on karein.");
        }
        if (piiTypes.contains("PAN") || piiTypes.contains("AADHAAR")) {
            tips.add("Unmasked Aadhaar/PAN details public text, forms, ya unverified apps par share na karein.");
        }
        if (piiTypes.contains("PHONE")) {
            tips.add("SIM-swap fraud se bachne ke liye apne telecom operator se carrier/port lock enable karein.");
        }
        if (tips.isEmpty()) {
            tips.add("Aapka exposure abhi low hai. Strong passwords aur periodic privacy checks jari rakhein.");
        }
        return tips;
    }
}