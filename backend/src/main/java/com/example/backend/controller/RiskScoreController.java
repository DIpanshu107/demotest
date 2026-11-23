package com.example.backend.controller;

import com.example.backend.dto.RiskAnalyzeRequest;
import com.example.backend.dto.RiskAnalyzeResponse;
import com.example.backend.service.RiskScoreService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risk-score")
public class RiskScoreController {

    private final RiskScoreService riskScoreService;

    public RiskScoreController(RiskScoreService riskScoreService) {
        this.riskScoreService = riskScoreService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<RiskAnalyzeResponse> analyzeRisk(@Valid @RequestBody RiskAnalyzeRequest request) {
        return ResponseEntity.ok(riskScoreService.analyze(request));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("PII Risk Score Generator API is running");
    }
}