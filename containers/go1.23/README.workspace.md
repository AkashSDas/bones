# Go 1.23 Workspace

## Docker Image

```bash
docker build -t workspace:go1.23 -f bones.Dockerfile .
docker run --rm -it -p 80:80 workspace:go1.23
```

## Port Mapping

Port mapping is handled by Nginx. The port-8000-80.conf file is used to map port 8000 (internal) to port 80 (external).
