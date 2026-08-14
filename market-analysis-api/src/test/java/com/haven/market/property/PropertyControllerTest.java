package com.haven.market.property;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.haven.market.analysis.ModelClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:property-test")
@AutoConfigureMockMvc
class PropertyControllerTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean ModelClient modelClient;

    @Test void seededPropertiesCanBeListedAndAnalysed() throws Exception {
        mvc.perform(get("/api/properties")).andExpect(status().isOk())
            .andExpect(jsonPath("$.totalElements", is(50)))
            .andExpect(jsonPath("$.content", hasSize(50)));
        mvc.perform(get("/api/market/summary")).andExpect(status().isOk())
            .andExpect(jsonPath("$.propertyCount", is(50)))
            .andExpect(jsonPath("$.medianPrice", greaterThan(0.0)))
            .andExpect(jsonPath("$.segments", not(empty())));
    }

    @Test void createUpdateDeleteLifecycle() throws Exception {
        var request = new PropertyRequest(1800, 3, 2, 2000, 7000, 4.2, 8.0, 280000);
        var response = mvc.perform(post("/api/properties").contentType("application/json").content(mapper.writeValueAsString(request)))
            .andExpect(status().isCreated()).andReturn();
        long id = mapper.readTree(response.getResponse().getContentAsString()).path("id").asLong();
        mvc.perform(put("/api/properties/{id}", id).contentType("application/json")
            .content(mapper.writeValueAsString(new PropertyRequest(1900, 3, 2.5, 2002, 7200, 4, 8.2, 300000))))
            .andExpect(status().isOk()).andExpect(jsonPath("$.price", is(300000.0)));
        mvc.perform(delete("/api/properties/{id}", id)).andExpect(status().isNoContent());
        mvc.perform(get("/api/properties/{id}", id)).andExpect(status().isNotFound());
    }

    @Test void invalidPropertyReturnsFieldErrors() throws Exception {
        mvc.perform(post("/api/properties").contentType("application/json").content("{}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message", is("Validation failed")));
    }
}
