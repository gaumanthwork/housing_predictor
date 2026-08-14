# Property Market Analysis API

Java 21 and Spring Boot 3.4.4 backend for App 2 of the property portal. It seeds an H2 database from the housing dataset, exposes property CRUD and cached aggregate market statistics, and routes what-if analysis through the FastAPI model from Task 1.

## Run

Start the Task 1 model API on port 8000, then:

```bash
docker build -t market-analysis-api .
docker run --rm -p 8080:8080 -e FASTAPI_URL=http://host.docker.internal:8000 market-analysis-api
```

Swagger UI is available at [http://localhost:8080/docs](http://localhost:8080/docs).

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET, POST | `/api/properties` | Filtered/paged listing and create |
| GET, PUT, DELETE | `/api/properties/{id}` | Read, replace, and delete |
| GET | `/api/market/summary` | Aggregate statistics and segment summaries |
| GET | `/api/market/segments` | Segment analysis |
| POST | `/api/market/what-if` | Prediction through the FastAPI service |

Supported query filters are `bedrooms`, `minPrice`, `maxPrice`, `minYear`, `minSchoolRating`, and `segment`. List results also accept `page`, `size`, `sort`, and `direction`.

Environment variables:

- `FASTAPI_URL`, default `http://127.0.0.1:8000`
- `MARKET_DB_PATH`, default `./data/market`
- `PORT`, default `8080`
