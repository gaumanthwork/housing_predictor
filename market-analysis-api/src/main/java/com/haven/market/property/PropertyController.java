package com.haven.market.property;

import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    private final PropertyService service;
    public PropertyController(PropertyService service) { this.service = service; }

    @GetMapping
    public PropertyPage all(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "50") int size,
        @RequestParam(defaultValue = "price") String sort, @RequestParam(defaultValue = "DESC") Sort.Direction direction,
        @RequestParam(required = false) Integer bedrooms, @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice, @RequestParam(required = false) Integer minYear,
        @RequestParam(required = false) Double minSchoolRating, @RequestParam(required = false) String segment) {
        return service.findAll(new PropertyFilter(bedrooms, minPrice, maxPrice, minYear, minSchoolRating, segment), page,
            Math.min(Math.max(size, 1), 200), sort, direction);
    }
    @GetMapping("/{id}") public PropertyResponse one(@PathVariable long id) { return service.findById(id); }
    @PostMapping public ResponseEntity<PropertyResponse> create(@Valid @RequestBody PropertyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }
    @PutMapping("/{id}") public PropertyResponse update(@PathVariable long id, @Valid @RequestBody PropertyRequest request) { return service.update(id, request); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
