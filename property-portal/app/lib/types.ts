export type PropertyInput = {
  square_footage: number; bedrooms: number; bathrooms: number; year_built: number;
  lot_size: number; distance_to_city_center: number; school_rating: number;
};

export type MarketProperty = PropertyInput & {
  id: number;
  price: number;
  segment: string;
};

export type SegmentSummary = {
  segment: string;
  propertyCount: number;
  averagePrice: number;
  medianPrice: number;
  averageSquareFootage: number;
  averagePricePerSquareFoot: number;
};

export type MarketSummary = {
  propertyCount: number;
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  averageSquareFootage: number;
  averagePricePerSquareFoot: number;
  averageSchoolRating: number;
  segments: SegmentSummary[];
};

export type PropertyPage = { content: MarketProperty[]; totalElements: number; page: number; size: number; totalPages: number };

export type Estimate = PropertyInput & { id: string; price: number; createdAt: string; name: string };

export type ModelInfo = {
  model_type: string; trained_at: string; n_samples: number; n_train: number; n_test: number; target: string;
  coefficients: { features: string[]; coefficients: Record<string, number>; intercept: number };
  test_metrics: { rmse: number; mae: number; r2_score: number };
  cross_validation: { cv_folds: number; r2_mean: number; r2_std: number; r2_scores: number[] };
};

export const DEFAULT_PROPERTY: PropertyInput = { square_footage: 1850, bedrooms: 3, bathrooms: 2, year_built: 1998, lot_size: 7500, distance_to_city_center: 5.6, school_rating: 8.2 };

export function extractPrice(data: unknown): number {
  if (typeof data === "number") return data;
  if (Array.isArray(data)) return extractPrice(data[0]);
  if (data && typeof data === "object") {
    const row = data as Record<string, unknown>;
    for (const key of ["predicted_price", "prediction", "price", "predictions"]) if (key in row) return extractPrice(row[key]);
  }
  throw new Error("The API returned an unfamiliar prediction format.");
}
