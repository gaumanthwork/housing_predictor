package com.haven.market.property;

import com.haven.market.shared.NotFoundException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
public class PropertyService {
    private final PropertyRepository repository;
    public PropertyService(PropertyRepository repository) { this.repository = repository; }

    public PropertyPage findAll(PropertyFilter filter, int page, int size, String sort, Sort.Direction direction) {
        var result = repository.findAll(PropertySpecifications.from(filter), PageRequest.of(page, size, Sort.by(direction, sort)));
        var rows = result.stream().filter(property -> filter.segment() == null || filter.segment().isBlank()
            || PropertySegments.forProperty(property).equalsIgnoreCase(filter.segment())).map(PropertyResponse::from).toList();
        return new PropertyPage(rows, page, size, filter.segment() == null || filter.segment().isBlank() ? result.getTotalElements() : rows.size(),
            filter.segment() == null || filter.segment().isBlank() ? result.getTotalPages() : (rows.isEmpty() ? 0 : 1));
    }

    public PropertyResponse findById(long id) { return PropertyResponse.from(entity(id)); }

    @CacheEvict(value = {"marketSummary", "marketSegments"}, allEntries = true)
    public PropertyResponse create(PropertyRequest request) { return PropertyResponse.from(repository.save(apply(new Property(), request))); }

    @CacheEvict(value = {"marketSummary", "marketSegments"}, allEntries = true)
    public PropertyResponse update(long id, PropertyRequest request) { return PropertyResponse.from(repository.save(apply(entity(id), request))); }

    @CacheEvict(value = {"marketSummary", "marketSegments"}, allEntries = true)
    public void delete(long id) { repository.delete(entity(id)); }

    private Property entity(long id) { return repository.findById(id).orElseThrow(() -> new NotFoundException("Property " + id + " was not found")); }
    private Property apply(Property p, PropertyRequest r) {
        p.setSquareFootage(r.squareFootage()); p.setBedrooms(r.bedrooms()); p.setBathrooms(r.bathrooms());
        p.setYearBuilt(r.yearBuilt()); p.setLotSize(r.lotSize()); p.setDistanceToCityCenter(r.distanceToCityCenter());
        p.setSchoolRating(r.schoolRating()); p.setPrice(r.price()); return p;
    }
}
