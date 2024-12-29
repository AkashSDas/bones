# Load Local Container Image in KinD

By default you won't be able to load container image (from local) in KinD's Kubernetes cluster or worker nodes. For this you'll have to separately load the images first in the KinD's control-plane node and worker nodes, and then only you will be able to use the images.

```bash
kind load docker-image workspace:vite-react18 
# kind load docker-image <image>:<tag>
```
