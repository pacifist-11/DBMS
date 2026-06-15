package io.nexusvault.repository;

import io.nexusvault.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, String> {

    List<InventoryItem> findByCategory(String category);
    List<InventoryItem> findByStatus(InventoryItem.ItemStatus status);
    List<InventoryItem> findByLocation(String location);
    List<InventoryItem> findByNameContainingIgnoreCase(String name);
}
