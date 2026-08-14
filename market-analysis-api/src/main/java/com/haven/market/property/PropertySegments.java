package com.haven.market.property;

public final class PropertySegments {
    private PropertySegments() {}

    public static String forProperty(Property property) {
        if (property.getSquareFootage() < 1300 || property.getBedrooms() <= 2) return "Compact";
        if (property.getSquareFootage() >= 2500 || property.getPrice() >= 450000) return "Luxury";
        if (property.getBedrooms() >= 4 || property.getSquareFootage() >= 2000) return "Family home";
        return "Mid-market";
    }
}
