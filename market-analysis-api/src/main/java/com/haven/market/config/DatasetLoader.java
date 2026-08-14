package com.haven.market.config;

import com.haven.market.property.*;
import org.apache.commons.csv.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.charset.StandardCharsets;

@Component
public class DatasetLoader implements CommandLineRunner {
    private final PropertyRepository repository;
    public DatasetLoader(PropertyRepository repository) { this.repository = repository; }
    @Override public void run(String... args) throws Exception {
        if (repository.count() > 0) return;
        try (var input = new ClassPathResource("data/House_Price_Dataset.csv").getInputStream();
             var reader = new InputStreamReader(input, StandardCharsets.UTF_8)) {
            var format = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).get();
            for (CSVRecord row : format.parse(reader)) {
                var p = new Property();
                p.setSquareFootage(number(row, "square_footage")); p.setBedrooms((int) number(row, "bedrooms"));
                p.setBathrooms(number(row, "bathrooms")); p.setYearBuilt((int) number(row, "year_built"));
                p.setLotSize(number(row, "lot_size")); p.setDistanceToCityCenter(number(row, "distance_to_city_center"));
                p.setSchoolRating(number(row, "school_rating")); p.setPrice(number(row, "price")); repository.save(p);
            }
        }
    }
    private double number(CSVRecord row, String key) {
        String value = key.equals("id") ? row.get("\ufeffid") : row.get(key);
        return Double.parseDouble(value);
    }
}
