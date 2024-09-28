# Bones Backend

## Databases

```bash
docker run --name bones-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=lol \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -d postgres
```
