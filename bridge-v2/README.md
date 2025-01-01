# Bridge

This service will act as a bridge inside a pod (or an instance) where a workspace is
running. This will handle things that bridge (v1) could not handle.

## Docker

Docker build and run command:

```bash
docker build -t bridge-v2:1.0.0 -f Dockerfile .
docker run --rm -p 4001:4001 bridge-v2:1.0.0
```
