package io.nexusvault.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

public class ItemDTO {

    @Data
    public static class CreateRequest {
        @NotBlank @Pattern(regexp = "SKU-\\d{4}", message = "ID must match SKU-XXXX format")
        private String id;

        @NotBlank @Size(max = 255)
        private String name;

        @NotBlank @Size(max = 100)
        private String category;

        private String description;

        @NotNull @Min(0)
        private Integer stock;

        @NotNull @Min(0)
        private Integer minThreshold;

        private String location;

        @NotNull @DecimalMin("0.00")
        private BigDecimal price;
    }

    @Data
    public static class UpdateRequest {
        @Size(max = 255)
        private String name;

        @Size(max = 100)
        private String category;

        private String description;

        @Min(0)
        private Integer stock;

        @Min(0)
        private Integer minThreshold;

        private String location;

        @DecimalMin("0.00")
        private BigDecimal price;
    }

    @Data
    public static class ItemResponse {
        private String id;
        private String name;
        private String category;
        private String description;
        private Integer stock;
        private Integer minThreshold;
        private String location;
        private String status;
        private BigDecimal price;

        public static ItemResponse from(io.nexusvault.entity.InventoryItem item) {
            ItemResponse r = new ItemResponse();
            r.id            = item.getId();
            r.name          = item.getName();
            r.category      = item.getCategory();
            r.description   = item.getDescription();
            r.stock         = item.getStock();
            r.minThreshold  = item.getMinThreshold();
            r.location      = item.getLocation();
            r.status        = item.getStatus() != null ? item.getStatus().name() : "healthy";
            r.price         = item.getPrice();
            return r;
        }
    }
}
