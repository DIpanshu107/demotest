package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class HibpService {

    @Value("${app.hibp.demo-mode:false}")
    private boolean demoMode;

    @Value("${app.xposedornot.base-url:https://api.xposedornot.com}")
    private String baseUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public HibpService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public static class BreachResult {
        public int breachCount;
        public List<String> breachNames;
        public List<String> exposedDataClasses;
        public boolean demoModeUsed;
    }

    public BreachResult checkEmailBreaches(String email) {
        if (email == null || email.isBlank()) {
            BreachResult empty = new BreachResult();
            empty.breachCount = 0;
            empty.breachNames = List.of();
            empty.exposedDataClasses = List.of();
            empty.demoModeUsed = false;
            return empty;
        }

        if (demoMode) {
            return runDemoBreachCheck(email);
        }

        try {
            return fetchFromXposedOrNot(email.trim());
        } catch (Exception ex) {
            return runDemoBreachCheck(email);
        }
    }

    private BreachResult fetchFromXposedOrNot(String email) throws Exception {
        String cleanBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);

        HttpRequest checkReq = HttpRequest.newBuilder()
                .uri(URI.create(cleanBase + "/v1/check-email/" + encodedEmail))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> checkRes = httpClient.send(checkReq, HttpResponse.BodyHandlers.ofString());

        BreachResult result = new BreachResult();
        result.demoModeUsed = false;

        if (checkRes.statusCode() == 404) {
            result.breachCount = 0;
            result.breachNames = List.of();
            result.exposedDataClasses = List.of();
            return result;
        }

        if (checkRes.statusCode() != 200) {
            throw new RuntimeException("XposedOrNot check-email status: " + checkRes.statusCode());
        }

        JsonNode checkJson = objectMapper.readTree(checkRes.body());
        Set<String> breachNamesSet = new LinkedHashSet<>();
        Set<String> dataClassesSet = new LinkedHashSet<>();

        JsonNode breachesNode = checkJson.get("breaches");
        if (breachesNode != null && breachesNode.isArray()) {
            for (JsonNode item : breachesNode) {
                if (item.isArray()) {
                    for (JsonNode sub : item) {
                        if (sub.isString() && !sub.asString("").isBlank()) {
                            breachNamesSet.add(sub.asString(""));
                        }
                    }
                } else if (item.isString() && !item.asString("").isBlank()) {
                    breachNamesSet.add(item.asString(""));
                }
            }
        }

        HttpRequest analyticsReq = HttpRequest.newBuilder()
                .uri(URI.create(cleanBase + "/v1/breach-analytics?email=" + encodedEmail))
                .timeout(Duration.ofSeconds(10))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> analyticsRes = httpClient.send(analyticsReq, HttpResponse.BodyHandlers.ofString());
        if (analyticsRes.statusCode() == 200) {
            JsonNode analyticsJson = objectMapper.readTree(analyticsRes.body());
            JsonNode exposedBreaches = analyticsJson.path("ExposedBreaches").path("breaches_details");
            if (exposedBreaches.isArray()) {
                for (JsonNode detail : exposedBreaches) {
                    String breachName = detail.path("breach").asString("");
                    if (!breachName.isBlank()) {
                        breachNamesSet.add(breachName);
                    }
                    String xposedData = detail.path("xposed_data").asString("");
                    if (!xposedData.isBlank()) {
                        for (String part : xposedData.split(";")) {
                            String cleaned = part.trim();
                            if (!cleaned.isBlank()) {
                                dataClassesSet.add(cleaned);
                            }
                        }
                    }
                }
            }
        }

        result.breachNames = new ArrayList<>(breachNamesSet);
        result.breachCount = result.breachNames.size();
        result.exposedDataClasses = new ArrayList<>(dataClassesSet);
        return result;
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