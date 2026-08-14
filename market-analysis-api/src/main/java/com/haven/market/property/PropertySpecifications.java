package com.haven.market.property;

import org.springframework.data.jpa.domain.Specification;

public final class PropertySpecifications {
    private PropertySpecifications() {}

    public static Specification<Property> from(PropertyFilter filter) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();
            if (filter.bedrooms() != null) predicates = cb.and(predicates, cb.equal(root.get("bedrooms"), filter.bedrooms()));
            if (filter.minPrice() != null) predicates = cb.and(predicates, cb.ge(root.get("price"), filter.minPrice()));
            if (filter.maxPrice() != null) predicates = cb.and(predicates, cb.le(root.get("price"), filter.maxPrice()));
            if (filter.minYear() != null) predicates = cb.and(predicates, cb.ge(root.get("yearBuilt"), filter.minYear()));
            if (filter.minSchoolRating() != null) predicates = cb.and(predicates, cb.ge(root.get("schoolRating"), filter.minSchoolRating()));
            return predicates;
        };
    }
}
