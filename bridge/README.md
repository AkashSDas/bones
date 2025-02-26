# Bridge

This is a service that will act as a bridge connecting the frontend to the workspace (K8s pod). This will handle the following things:

- File system
- Terminal management
- Language servers and Monaco IDE communication for auto-completion

And this could be extended to handle other things. There were some issues in integrating some features like collaboration and terminal integration. These issues were mostly due to HonoJS and Deno, and there not being enough tools to create and integrate these features using HonoJS and Deno. To solve this issue there's a bridge-v2 which is built using NodeJS and ExpressJS.

> This service will be running inside of the workspace (k8s pod) on port `4000`.

## Docker

Docker build and run command:

```bash
docker build -t bridge:1.0.0 -f Dockerfile .
docker run --rm -p 4000:4000 bridge:1.0.0
```
