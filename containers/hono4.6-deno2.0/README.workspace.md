# Hono 4.6 and Deno 2.0 Workspace

## Docker Image

```bash
docker build -t workspace:hono4.6-deno2.0 -f bones.Dockerfile .
docker run --rm -it -p 80:80 workspace:hono4.6-deno2.0
```

## Port Mapping

Port mapping is handled by Nginx. The port-8000-80.conf file is used to map port 8000 (internal) to port 80 (external).
