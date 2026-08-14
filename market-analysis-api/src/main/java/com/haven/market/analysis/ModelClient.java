package com.haven.market.analysis;

import com.fasterxml.jackson.databind.JsonNode;
import com.haven.market.shared.UpstreamServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;

@Component
public class ModelClient {
    private final RestClient client;
    public ModelClient(RestClient.Builder builder, @Value("${model-api.base-url}") String baseUrl) {
        client = builder.baseUrl(baseUrl).build();
    }
    public WhatIfResponse predict(WhatIfRequest request) {
        try {
            JsonNode body = client.post().uri("/predict").contentType(MediaType.APPLICATION_JSON).body(request)
                .retrieve().body(JsonNode.class);
            JsonNode price = body == null ? null : body.path("predictions").path(0).path("predicted_price");
            if (price == null || !price.isNumber()) throw new UpstreamServiceException("The model API returned an unfamiliar response");
            return new WhatIfResponse(Math.round(price.asDouble() * 100.0) / 100.0, "fastapi-linear-regression");
        } catch (ResourceAccessException error) {
            throw new UpstreamServiceException("The housing prediction model is unavailable", error);
        } catch (RestClientResponseException error) {
            throw new UpstreamServiceException("The housing prediction model rejected the request", error);
        }
    }
}
