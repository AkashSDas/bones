# Load Local Container Image in KinD

By default you won't be able to load container image (from local) in KinD's Kubernetes cluster or worker nodes. For this you'll have to separately load the images first in the KinD's control-plane node and worker nodes, and then only you will be able to use the images for workspace creation.

Run the following command to load you local image into KinD cluster (note that it'll take some time and more storage from your machine, so avoid load a bunch of images at once):

```bash
# kind load docker-image <image>:<tag>
kind load docker-image workspace:vite-react18 
```

You can also configure the `./Taskfile.yaml` to only run something like `task load-react-img` and it will do the same as shown in the above code block.
