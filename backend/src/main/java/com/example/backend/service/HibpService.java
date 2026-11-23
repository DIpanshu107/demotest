package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HibpService {

    @Value("${app.hibp.demo-mode:true}")
    private boolean demoMode;

    @Value("${app.hibp.api-key:}")
    private String apiKey;

    public static class BreachResult {
        public int breachCount;
        public List<String> breachNames;
        public List<String> exposedDataClasses;
        public boolean demoModeUsed;
    }

    public BreachResult checkEmailBreaches(String email) {
        if (demoMode || apiKey == null || apiKey.isBlank()) {
            return runDemoBreachCheck(email);
        }
        return runDemoBreachCheck(email);
    }

    private BreachResult runDemoBreachCheck(String email) {
        BreachResult res = new BreachResult();
        res.demoModeUsed = true;
        String lower = email.toLowerCase();

        if (lower.contains("safe") || lower.contains("clean")) {
            res.breachCount = 0;
            res.breachNames = List.of();
            res.exposedDataClasses = List.of();
        } else if (lower.contains("admin") || lower.contains("test") || lower.contains("leak")) {
            res.breachCount = 3;
            res.breachNames = List.of("LinkedIn-2021-Sample", "Adobe-Leak-Sample", "Canva-Breach-Sample");
            res.exposedDataClasses = List.of("Email addresses", "Passwords", "Phone numbers", "Names");
        } else {
            res.breachCount = 1;
            res.breachNames = List.of("PublicForum-Leak-Sample");
            res.exposedDataClasses = List.of("Email addresses", "Usernames");
        }
        return res;
    }
}