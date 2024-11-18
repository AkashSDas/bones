# Vite and React 18 Workspace

## Docker Image

```bash
docker build -t workspace:vite-react18 -f bones.Dockerfile .
docker run --rm -it -p 80:80 workspace:vite-react18
```

## Port Mapping

Port mapping is handled by Nginx. The port-5173-80.conf file is used to map port 5173 (internal) to port 80 (external).
