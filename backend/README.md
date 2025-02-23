# Bones Backend

This is the main backend for Bones project. It handles:

-   IAM (authentication, authorization, account's users management)
-   Workspace management (creating and managing IDE environments)

## Getting started (for development)

1. Go the `Databases` section and setup required databases.
1. Create a `.env` file using the existing `.env.sample` file. Add values for the missing ones.

## Databases

The database used for storing data is PostgreSQL, and Redis is used for managing task queues.

```bash
docker run --name bones-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=lol \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -d postgres

docker run --name bones-redis -d -p 6379:6379 redis
```

### SQL query to drop all types in PostgreSQL:

```sql
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all user-defined types in the current schema
    FOR r IN (SELECT n.nspname AS schema_name, t.typname AS type_name
              FROM pg_type t
              JOIN pg_namespace n ON n.oid = t.typnamespace
              WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
              AND t.typtype = 'e'  -- e = enum, c = composite, d = domain, b = base, p = pseudo-type
              ORDER BY schema_name, type_name)
    LOOP
        -- Drop each type
        EXECUTE 'DROP TYPE IF EXISTS ' || r.schema_name || '.' || r.type_name || ' CASCADE';
    END LOOP;
END $$;
```

### Issue with adding enums

When you run the Drizzle migration command, it fails to add enums. This is because Drizzle kit is not being able to detect enums. This maybe solved till now: [Github Issue](https://github.com/drizzle-team/drizzle-orm/issues/2389)

```sql
-- Manually adding enum since drizzle kit is not being able to detect enums
CREATE TYPE account_status AS ENUM ('uninitialized', 'active', 'suspended', 'deactive');
CREATE TYPE iam_permission_service_type AS ENUM ('iam', 'workspace');
CREATE TYPE iam_permission_access_type AS ENUM ('read', 'write');
```
