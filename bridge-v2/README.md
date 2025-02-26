# Bridge

This service will act as a bridge between the frontend and the workspace (k8s pod). There's already a bridge service built with HonoJS and Deno2, then why create this service. The issue here is that HonoJS and Deno are relatively newer tools and lack a lot of features or existing solution can't be easily integrated, and to solve this issue this service is created using Node and Express.

Things this bridge service manages are:

- Terminal management
- Collaboration on workspace

> This service will be running inside of the workspace (k8s pod) on port `4001`.

## Bridge v1 vs v2

In order to add new features to the workspace, which bridge service should be used, v1 or v2? Firstly research on the solution that will be implemented and see if it can be done in Hono and Deno (so bridge v1). Bridge v1 should be the first choice of implementing features, and only if it's not possible or implementation in Node and Express (i.e. bridge v2) is "x" times simpler then go for bridge v2.

## Docker

Docker build and run command:

```bash
docker build -t bridge-v2:1.0.0 -f Dockerfile .
docker run --rm -p 4001:4001 bridge-v2:1.0.0
```
