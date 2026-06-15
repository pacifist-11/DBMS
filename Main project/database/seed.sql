-- =============================================================================
-- NexusVault - Seed Data
-- Run AFTER schema.sql
-- Default admin password: Admin@123 (BCrypt hashed)
-- =============================================================================

-- Admin user (password: Admin@123)
INSERT INTO users (username, email, password_hash, role) VALUES
  ('admin',    'admin@nexusvault.io',   '$2a$12$T3jkrVHY1Xp3fBRKmQ7.5.z6V3c8Y8VD1XuL0Y/XNqJd2k2f.yh5m', 'ADMIN'),
  ('warehouse','warehouse@nexusvault.io','$2a$12$T3jkrVHY1Xp3fBRKmQ7.5.z6V3c8Y8VD1XuL0Y/XNqJd2k2f.yh5m', 'USER');

-- Seed inventory items (matches mockData.js)
INSERT INTO inventory_items (id, name, category, description, stock, min_threshold, location, price, created_by) VALUES
  ('SKU-9901', 'Sony WH-1000XM5 Headphones',    'Electronics',  'Industry leading noise canceling wireless headphones.', 45, 15, 'Warehouse A', 29990.00, 1),
  ('SKU-9902', 'Samsung 4K Smart Monitor',        'Displays',     '32-inch 4K UHD smart monitor.',                        8,  10, 'Warehouse B', 34999.00, 1),
  ('SKU-9903', 'Logitech MX Master 3S Mouse',     'Accessories',  'Advanced wireless mouse for productivity.',             22, 10, 'Warehouse A', 8999.00,  1),
  ('SKU-9904', 'Keychron K2 Mechanical Keyboard', 'Accessories',  '75% layout wireless mechanical keyboard.',              4,  15, 'Warehouse A', 9500.00,  1),
  ('SKU-9905', 'Dell XPS 15 Laptop',              'Computers',    'Intel Core i9, 32GB RAM, OLED display laptop.',        12, 5,  'Warehouse C', 189990.00,1),
  ('SKU-9906', 'Apple AirPods Pro 2',             'Electronics',  'Active noise cancellation earbuds with USB-C.',        30, 10, 'Warehouse B', 24900.00, 1);

-- Audit log entry for the seed
INSERT INTO audit_log (table_name, record_id, action, new_data, performed_by) VALUES
  ('inventory_items', 'SKU-9901', 'INSERT', '{"source": "seed"}', 1),
  ('inventory_items', 'SKU-9902', 'INSERT', '{"source": "seed"}', 1),
  ('inventory_items', 'SKU-9903', 'INSERT', '{"source": "seed"}', 1),
  ('inventory_items', 'SKU-9904', 'INSERT', '{"source": "seed"}', 1),
  ('inventory_items', 'SKU-9905', 'INSERT', '{"source": "seed"}', 1),
  ('inventory_items', 'SKU-9906', 'INSERT', '{"source": "seed"}', 1);
