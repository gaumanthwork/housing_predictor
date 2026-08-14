

## Run
```
docker build -t housing-price-api .
docker run -p 8000:8000 housing-price-api
```
## Example requests

**Single prediction**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "square_footage": 1850,
    "bedrooms": 3,
    "bathrooms": 2.0,
    "year_built": 1998,
    "lot_size": 7500,
    "distance_to_city_center": 5.6,
    "school_rating": 8.2
  }'
```

**Batch prediction**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '[
    {"square_footage": 1850, "bedrooms": 3, "bathrooms": 2.0, "year_built": 1998, "lot_size": 7500, "distance_to_city_center": 5.6, "school_rating": 8.2},
    {"square_footage": 1250, "bedrooms": 2, "bathrooms": 1.0, "year_built": 1985, "lot_size": 5200, "distance_to_city_center": 3.2, "school_rating": 7.1}
  ]'
```