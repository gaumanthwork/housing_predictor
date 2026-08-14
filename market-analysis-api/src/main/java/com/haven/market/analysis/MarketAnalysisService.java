package com.haven.market.analysis;

import com.haven.market.property.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MarketAnalysisService {
    private final PropertyRepository repository;
    public MarketAnalysisService(PropertyRepository repository) { this.repository = repository; }

    @Cacheable(value = "marketSummary", key = "#filter.toString()")
    public MarketSummary summary(PropertyFilter filter) {
        var rows = filtered(filter);
        var prices = rows.stream().map(Property::getPrice).sorted().toList();
        return new MarketSummary(rows.size(), average(rows, Property::getPrice), median(prices),
            prices.isEmpty() ? 0 : prices.getFirst(), prices.isEmpty() ? 0 : prices.getLast(),
            average(rows, Property::getSquareFootage), average(rows, p -> p.getPrice() / p.getSquareFootage()),
            average(rows, Property::getSchoolRating), segments(rows));
    }

    @Cacheable(value = "marketSegments", key = "#filter.toString()")
    public List<SegmentSummary> segmentAnalysis(PropertyFilter filter) { return segments(filtered(filter)); }

    private List<Property> filtered(PropertyFilter filter) {
        return repository.findAll(PropertySpecifications.from(filter)).stream()
            .filter(p -> filter.segment() == null || filter.segment().isBlank() || PropertySegments.forProperty(p).equalsIgnoreCase(filter.segment()))
            .toList();
    }
    private List<SegmentSummary> segments(List<Property> rows) {
        return rows.stream().collect(Collectors.groupingBy(PropertySegments::forProperty)).entrySet().stream()
            .map(entry -> {
                var group = entry.getValue();
                var prices = group.stream().map(Property::getPrice).sorted().toList();
                return new SegmentSummary(entry.getKey(), group.size(), average(group, Property::getPrice), median(prices),
                    average(group, Property::getSquareFootage), average(group, p -> p.getPrice() / p.getSquareFootage()));
            }).sorted(Comparator.comparing(SegmentSummary::averagePrice).reversed()).toList();
    }
    private double average(List<Property> rows, java.util.function.ToDoubleFunction<Property> fn) {
        return round(rows.stream().mapToDouble(fn).average().orElse(0));
    }
    private double median(List<Double> values) {
        if (values.isEmpty()) return 0;
        int middle = values.size() / 2;
        return round(values.size() % 2 == 0 ? (values.get(middle - 1) + values.get(middle)) / 2 : values.get(middle));
    }
    private double round(double value) { return Math.round(value * 100.0) / 100.0; }
}
