package com.haven.market.property;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

public record PropertyRequest(
    @JsonProperty("square_footage") @Positive double squareFootage,
    @Min(0) @Max(20) int bedrooms,
    @DecimalMin("0.0") @DecimalMax("20.0") double bathrooms,
    @JsonProperty("year_built") @Min(1800) @Max(2100) int yearBuilt,
    @JsonProperty("lot_size") @Positive double lotSize,
    @JsonProperty("distance_to_city_center") @PositiveOrZero double distanceToCityCenter,
    @JsonProperty("school_rating") @DecimalMin("0.0") @DecimalMax("10.0") double schoolRating,
    @Positive double price
) {}
