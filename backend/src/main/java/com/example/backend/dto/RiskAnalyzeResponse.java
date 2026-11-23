package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class RiskAnalyzeResponse {
    private int riskScore;
    private String riskLevel;
    private String maskedEmail;
    private String maskedText;
    private List<String> detectedPiiTypes;
    private int breachCount;
    private List<String> breachNames;
    private List<String> exposedDataClasses;
    private boolean demoModeUsed;
    private List<String> recommendations;
    private LocalDateTime analyzedAt;

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getMaskedEmail() { return maskedEmail; }
    public void setMaskedEmail(String maskedEmail) { this.maskedEmail = maskedEmail; }

    public String getMaskedText() { return maskedText; }
    public void setMaskedText(String maskedText) { this.maskedText = maskedText; }

    public List<String> getDetectedPiiTypes() { return detectedPiiTypes; }
    public void setDetectedPiiTypes(List<String> detectedPiiTypes) { this.detectedPiiTypes = detectedPiiTypes; }

    public int getBreachCount() { return breachCount; }
    public void setBreachCount(int breachCount) { this.breachCount = breachCount; }

    public List<String> getBreachNames() { return breachNames; }
    public void setBreachNames(List<String> breachNames) { this.breachNames = breachNames; }

    public List<String> getExposedDataClasses() { return exposedDataClasses; }
    public void setExposedDataClasses(List<String> exposedDataClasses) { this.exposedDataClasses = exposedDataClasses; }

    public boolean isDemoModeUsed() { return demoModeUsed; }
    public void setDemoModeUsed(boolean demoModeUsed) { this.demoModeUsed = demoModeUsed; }

    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }

    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}