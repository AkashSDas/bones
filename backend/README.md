# Bones Backend

## Databases

```bash
docker run --name bones-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=lol \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -d postgres

docker run --name bones-redis -d -p 6379:6379 redis
```

Drop all PostgreSQL types:

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
