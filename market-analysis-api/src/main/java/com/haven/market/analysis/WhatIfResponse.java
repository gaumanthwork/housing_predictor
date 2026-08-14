package com.haven.market.analysis;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WhatIfResponse(@JsonProperty("predicted_price") double predictedPrice, String source) {}
