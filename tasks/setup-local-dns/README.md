# Local DNS Resolver Setup for MacOS

The workspace feature in this project uses K8s ingress. So, when you create a workspace, a ingress is attached to it with domain `http://<workspace-id>-workspace.bones.test` (configurable). When testing it locally we want the request to `.bones.test` should go to the load balancer that is running on some IP address instead of going to the internet. (Nginx Ingress load balancer is used here.)

Note that in the backend there's an environment variable `WORKSPACE_DOMAIN_SUFFIX` whose value is `workspace.bones.test`. So if you change the setup then you'll have to update that environment variable.

[Solution for Mac](https://gist.github.com/ogrrd/5831371?permalink_comment_id=4790334#gistcomment-4790334)

## Setup Explanation

You have to run the tasks to setup/destroy DNS config. You'll have to go to `./Taskfile.yaml` and look at the env variables. Here, `LOCAL_DNS_RESOLVER_IP` is the IP of the load balancer that is running in K8s cluster. (So setup you Nginx Ingress load balancer before doing this setup so that you have its IP address.) You can also configure the top level domain by changing `LOCAL_CUSTOM_TLD`.

> `LOCAL_HOST_DNS_RESOLVER_IP` is only for testing, along with its tasks.

Once you've these things done/ready then just run the following commands:

```bash
task install
task nginx-ingress:setup
```

To destroy run the following command and if it fails, which happens when running the `sed` command, then you can manually remove the entry from `/etc/dnsmasq.conf`. (Go to `./Taskfile.yaml` to better understand what to do.)

```bash
task nginx-ingress:destroy
```

To test the setup you can run the following commands:

```bash
task test-dns

# You would need Docker (also needed for the whole project) and if the container fails to start then you'll have kill it and then re-try, else it'll keep on failing
task run-nginx
```
