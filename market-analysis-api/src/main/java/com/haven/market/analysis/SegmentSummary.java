package com.haven.market.analysis;

public record SegmentSummary(String segment, long propertyCount, double averagePrice, double medianPrice,
                             double averageSquareFootage, double averagePricePerSquareFoot) {}
