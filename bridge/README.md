# Bridge

This service will act as a bridge inside a pod (or an instance) where a workspace is
running. This will handle following things:

- Terminal management
- File system management
- Logging
- Scanning current workspace
- Backup
- Any other ad hoc tasks that are needed...

## Docker

Docker build and run command:

```bash
docker build -t bridge:1.0.0 -f Dockerfile .
docker run --rm -p 4000:4000 bridge:latest
```
