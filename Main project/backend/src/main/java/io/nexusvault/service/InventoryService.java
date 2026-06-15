package io.nexusvault.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.nexusvault.dto.ItemDTO;
import io.nexusvault.entity.AuditLog;
import io.nexusvault.entity.InventoryItem;
import io.nexusvault.entity.UserEntity;
import io.nexusvault.repository.AuditLogRepository;
import io.nexusvault.repository.InventoryItemRepository;
import io.nexusvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository itemRepository;
    private final AuditLogRepository      auditLogRepository;
    private final UserRepository          userRepository;
    private final ObjectMapper            objectMapper;

    // ── READ ──────────────────────────────────────────────────────────────

    public List<InventoryItem> findAll() {
        return itemRepository.findAll();
    }

    public InventoryItem findById(String id) {
        return itemRepository.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Item not found: " + id));
    }

    // ── CREATE ────────────────────────────────────────────────────────────

    @Transactional
    public InventoryItem create(ItemDTO.CreateRequest req) {
        if (itemRepository.existsById(req.getId())) {
            throw new IllegalArgumentException("Item with ID already exists: " + req.getId());
        }

        UserEntity actor = currentUser();

        InventoryItem item = InventoryItem.builder()
            .id(req.getId())
            .name(req.getName())
            .category(req.getCategory())
            .description(req.getDescription())
            .stock(req.getStock())
            .minThreshold(req.getMinThreshold())
            .location(req.getLocation())
            .price(req.getPrice())
            .createdBy(actor)
            .build();

        item.recalculateStatus();
        InventoryItem saved = itemRepository.save(item);

        writeAudit(AuditLog.AuditAction.INSERT, saved.getId(), null, toJson(saved), actor);
        log.info("Item created: {} by {}", saved.getId(), actor.getUsername());
        return saved;
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @Transactional
    public InventoryItem update(String id, ItemDTO.UpdateRequest req) {
        InventoryItem item = findById(id);
        String oldJson = toJson(item);
        UserEntity actor = currentUser();

        if (req.getName()         != null) item.setName(req.getName());
        if (req.getCategory()     != null) item.setCategory(req.getCategory());
        if (req.getDescription()  != null) item.setDescription(req.getDescription());
        if (req.getStock()        != null) item.setStock(req.getStock());
        if (req.getMinThreshold() != null) item.setMinThreshold(req.getMinThreshold());
        if (req.getLocation()     != null) item.setLocation(req.getLocation());
        if (req.getPrice()        != null) item.setPrice(req.getPrice());

        item.recalculateStatus();
        InventoryItem saved = itemRepository.save(item);

        writeAudit(AuditLog.AuditAction.UPDATE, saved.getId(), oldJson, toJson(saved), actor);
        log.info("Item updated: {} by {}", saved.getId(), actor.getUsername());
        return saved;
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @Transactional
    public void delete(String id) {
        InventoryItem item = findById(id);
        String oldJson = toJson(item);
        UserEntity actor = currentUser();

        itemRepository.delete(item);

        writeAudit(AuditLog.AuditAction.DELETE, id, oldJson, null, actor);
        log.info("Item deleted: {} by {}", id, actor.getUsername());
    }

    // ── HELPERS ───────────────────────────────────────────────────────────

    private void writeAudit(AuditLog.AuditAction action, String recordId,
                             String oldData, String newData, UserEntity actor) {
        AuditLog log = AuditLog.builder()
            .tableName("inventory_items")
            .recordId(recordId)
            .action(action)
            .oldData(oldData)
            .newData(newData)
            .performedBy(actor)
            .build();
        auditLogRepository.save(log);
    }

    private UserEntity currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalStateException("Authenticated user not found in DB"));
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    // ── AUDIT LOG QUERY ───────────────────────────────────────────────────

    public Page<AuditLog> getAuditLog(int page, int size) {
        return auditLogRepository.findAllByOrderByPerformedAtDesc(PageRequest.of(page, size));
    }
}
