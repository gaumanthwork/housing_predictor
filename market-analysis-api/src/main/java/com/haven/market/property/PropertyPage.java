package com.haven.market.property;

import java.util.List;

public record PropertyPage(List<PropertyResponse> content, int page, int size, long totalElements, int totalPages) {}
