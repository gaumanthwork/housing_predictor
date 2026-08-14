package com.haven.market.analysis;

import com.haven.market.property.PropertyFilter;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
public class MarketAnalysisController {
    private final MarketAnalysisService service;
    private final ModelClient modelClient;
    public MarketAnalysisController(MarketAnalysisService service, ModelClient modelClient) { this.service = service; this.modelClient = modelClient; }

    @GetMapping("/summary")
    public MarketSummary summary(@RequestParam(required = false) Integer bedrooms, @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice, @RequestParam(required = false) Integer minYear,
        @RequestParam(required = false) Double minSchoolRating, @RequestParam(required = false) String segment) {
        return service.summary(new PropertyFilter(bedrooms, minPrice, maxPrice, minYear, minSchoolRating, segment));
    }
    @GetMapping("/segments") public List<SegmentSummary> segments() { return service.segmentAnalysis(new PropertyFilter(null, null, null, null, null, null)); }
    @PostMapping("/what-if") public WhatIfResponse whatIf(@Valid @RequestBody WhatIfRequest request) { return modelClient.predict(request); }
}
