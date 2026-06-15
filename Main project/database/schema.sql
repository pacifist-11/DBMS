-- =============================================================================
-- NexusVault Inventory Management System
-- PostgreSQL Schema
-- =============================================================================

-- Drop in safe order (child tables first)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE item_status AS ENUM ('healthy', 'low', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- TABLE: users
-- =============================================================================

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role    NOT NULL DEFAULT 'USER',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users IS 'Application users with role-based access';
COMMENT ON COLUMN users.role IS 'ADMIN = full CRUD; USER = read-only';

-- =============================================================================
-- TABLE: inventory_items
-- =============================================================================

CREATE TABLE inventory_items (
    id            VARCHAR(20)     PRIMARY KEY,          -- e.g. SKU-9901
    name          VARCHAR(255)    NOT NULL,
    category      VARCHAR(100)    NOT NULL,
    description   TEXT,
    stock         INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_threshold INTEGER         NOT NULL DEFAULT 0 CHECK (min_threshold >= 0),
    location      VARCHAR(100),
    status        item_status     NOT NULL DEFAULT 'healthy',
    price         NUMERIC(12, 2)  NOT NULL DEFAULT 0.00,
    created_by    BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE inventory_items IS 'Physical inventory SKUs tracked by NexusVault';

-- Auto-update status based on stock vs min_threshold
CREATE OR REPLACE FUNCTION update_item_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock = 0 THEN
        NEW.status := 'critical';
    ELSIF NEW.stock < NEW.min_threshold THEN
        NEW.status := 'low';
    ELSE
        NEW.status := 'healthy';
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_item_status
    BEFORE INSERT OR UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_item_status();

-- =============================================================================
-- TABLE: audit_log
-- =============================================================================

CREATE TABLE audit_log (
    id          BIGSERIAL    PRIMARY KEY,
    table_name  VARCHAR(50)  NOT NULL,
    record_id   VARCHAR(50)  NOT NULL,
    action      audit_action NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    performed_by BIGINT      REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_log IS 'Immutable audit trail for all data modifications';

-- =============================================================================
-- INDEXES for performance
-- =============================================================================

CREATE INDEX idx_items_category   ON inventory_items(category);
CREATE INDEX idx_items_status     ON inventory_items(status);
CREATE INDEX idx_items_location   ON inventory_items(location);
CREATE INDEX idx_audit_record     ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_performed  ON audit_log(performed_at DESC);
CREATE INDEX idx_users_email      ON users(email);

-- =============================================================================
-- UPDATED_AT auto-refresh trigger for users
-- =============================================================================

CREATE OR REPLACE FUNCTION refresh_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION refresh_updated_at();

-- =============================================================================
-- AUDIT TRIGGER — Auto-record changes to inventory_items at DB level
-- (The Spring service also writes audit records; this acts as a safety net)
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_audit_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(table_name, record_id, action, old_data, new_data, performed_at)
        VALUES ('inventory_items', NEW.id::TEXT, 'INSERT', NULL, to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(table_name, record_id, action, old_data, new_data, performed_at)
        VALUES ('inventory_items', NEW.id::TEXT, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(table_name, record_id, action, old_data, new_data, performed_at)
        VALUES ('inventory_items', OLD.id::TEXT, 'DELETE', to_jsonb(OLD), NULL, NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_inventory
    AFTER INSERT OR UPDATE OR DELETE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION fn_audit_inventory();
