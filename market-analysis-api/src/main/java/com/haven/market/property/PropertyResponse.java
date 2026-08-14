package com.haven.market.property;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PropertyResponse(
    long id,
    @JsonProperty("square_footage") double squareFootage,
    int bedrooms,
    double bathrooms,
    @JsonProperty("year_built") int yearBuilt,
    @JsonProperty("lot_size") double lotSize,
    @JsonProperty("distance_to_city_center") double distanceToCityCenter,
    @JsonProperty("school_rating") double schoolRating,
    double price,
    String segment
) {
    public static PropertyResponse from(Property property) {
        return new PropertyResponse(property.getId(), property.getSquareFootage(), property.getBedrooms(),
            property.getBathrooms(), property.getYearBuilt(), property.getLotSize(),
            property.getDistanceToCityCenter(), property.getSchoolRating(), property.getPrice(),
            PropertySegments.forProperty(property));
    }
}
