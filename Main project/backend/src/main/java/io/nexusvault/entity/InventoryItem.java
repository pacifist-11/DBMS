package io.nexusvault.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * InventoryItem entity — maps to the `inventory_items` PostgreSQL table.
 * Status is auto-computed by a DB trigger, but we also recalculate it
 * in the service layer before persisting so the returned object is correct.
 */
@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @Column(length = 20)
    private String id;  // e.g. "SKU-9901"

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "min_threshold", nullable = false)
    private Integer minThreshold;

    @Column(length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ItemStatus status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public enum ItemStatus {
        healthy, low, critical
    }

    /**
     * Recomputes status in Java (mirrors the DB trigger logic).
     * Call before saving to ensure the returned DTO reflects the correct status.
     */
    public void recalculateStatus() {
        if (this.stock == null || this.minThreshold == null) return;
        if (this.stock == 0)                       this.status = ItemStatus.critical;
        else if (this.stock < this.minThreshold)   this.status = ItemStatus.low;
        else                                        this.status = ItemStatus.healthy;
    }
}
