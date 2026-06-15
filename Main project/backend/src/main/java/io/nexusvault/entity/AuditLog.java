package io.nexusvault.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

/**
 * AuditLog entity — maps to the `audit_log` PostgreSQL table.
 * Records every INSERT, UPDATE, DELETE performed on inventory_items.
 */
@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_name", nullable = false, length = 50)
    private String tableName;

    @Column(name = "record_id", nullable = false, length = 50)
    private String recordId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private AuditAction action;

    @Column(name = "old_data", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String oldData;

    @Column(name = "new_data", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String newData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private UserEntity performedBy;

    @Column(name = "performed_at", nullable = false)
    private OffsetDateTime performedAt;

    @PrePersist
    protected void prePersist() {
        if (performedAt == null) {
            performedAt = OffsetDateTime.now();
        }
    }

    public enum AuditAction {
        INSERT, UPDATE, DELETE
    }
}
