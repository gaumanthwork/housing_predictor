package com.haven.market.property;

public record PropertyFilter(Integer bedrooms, Double minPrice, Double maxPrice, Integer minYear,
                             Double minSchoolRating, String segment) {}
