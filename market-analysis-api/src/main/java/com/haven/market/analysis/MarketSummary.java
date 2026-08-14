package com.haven.market.analysis;

import java.util.List;

public record MarketSummary(long propertyCount, double averagePrice, double medianPrice, double minPrice,
                            double maxPrice, double averageSquareFootage, double averagePricePerSquareFoot,
                            double averageSchoolRating, List<SegmentSummary> segments) {}
