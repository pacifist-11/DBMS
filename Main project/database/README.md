# 🗄️ Database Layer — NexusVault PostgreSQL

## Tables
| Table | Purpose |
|---|---|
| `users` | Application users with roles (ADMIN / USER) |
| `inventory_items` | Physical SKUs tracked by the system |
| `audit_log` | Immutable record of every create/update/delete |

## Setup

### 1. Open psql and create the database
```sql
CREATE DATABASE nexusvault;
\c nexusvault
```

### 2. Run the schema
```bash
psql -U postgres -d nexusvault -f schema.sql
```

### 3. Seed with initial data
```bash
psql -U postgres -d nexusvault -f seed.sql
```

## Default Credentials (from seed)
| Username | Password | Role |
|---|---|---|
| `admin` | `Admin@123` | ADMIN |
| `warehouse` | `Admin@123` | USER |

## Connection String (for Spring Boot)
```
jdbc:postgresql://localhost:5432/nexusvault
Username: postgres
Password: Itctc@11
```
