package io.nexusvault.controller;

import io.nexusvault.dto.ItemDTO;
import io.nexusvault.entity.InventoryItem;
import io.nexusvault.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Inventory CRUD REST controller.
 *
 * GET    /api/items         → ADMIN + USER
 * GET    /api/items/{id}    → ADMIN + USER
 * POST   /api/items         → ADMIN only
 * PUT    /api/items/{id}    → ADMIN only
 * DELETE /api/items/{id}    → ADMIN only
 */
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // ── READ ──────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<ItemDTO.ItemResponse>> getAllItems() {
        List<ItemDTO.ItemResponse> items = inventoryService.findAll()
            .stream()
            .map(ItemDTO.ItemResponse::from)
            .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ItemDTO.ItemResponse> getItem(@PathVariable String id) {
        return ResponseEntity.ok(ItemDTO.ItemResponse.from(inventoryService.findById(id)));
    }

    // ── CREATE ────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemDTO.ItemResponse> createItem(
            @Valid @RequestBody ItemDTO.CreateRequest request) {
        InventoryItem created = inventoryService.create(request);
        return ResponseEntity.status(201).body(ItemDTO.ItemResponse.from(created));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ItemDTO.ItemResponse> updateItem(
            @PathVariable String id,
            @Valid @RequestBody ItemDTO.UpdateRequest request) {
        InventoryItem updated = inventoryService.update(id, request);
        return ResponseEntity.ok(ItemDTO.ItemResponse.from(updated));
    }

    // ── DELETE ────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
