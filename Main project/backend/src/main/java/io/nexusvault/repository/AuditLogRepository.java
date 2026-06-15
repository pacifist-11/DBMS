package io.nexusvault.repository;

import io.nexusvault.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByPerformedAtDesc(Pageable pageable);
    Page<AuditLog> findByTableNameOrderByPerformedAtDesc(String tableName, Pageable pageable);
}
