# Local DNS Resolver

Setup DNS resolver for local network so that I can use something like `http://<random-id>-workspace.bones` to access the workspace. [Solution for Mac](https://gist.github.com/ogrrd/5831371?permalink_comment_id=4790334#gistcomment-4790334)

## Setup

[KinD Example](https://mya.sh/blog/2020/10/21/local-ingress-domains-kind/)

```bash
brew install kubernetes-cli dnsmasq

# To keep it dry
export LOCAL_CUSTOM_TLD="hack" # I need "bones"

# Register .hack (".bones") TLD locally
echo "address=/.${LOCAL_CUSTOM_TLD}/127.0.0.1" >> $(brew --prefix)/etc/dnsmasq.conf

# Configure the local resolver
sudo mkdir /etc/resolver/
cat <<EOF | sudo tee /etc/resolver/${LOCAL_CUSTOM_TLD}
nameserver 127.0.0.1
EOF

# Restart local dnsmasq service
sudo brew services restart dnsmasq

# Restart mDNSResponder
sudo killall -HUP mDNSResponder

# Verify the new resolver was picked up
scutil --dns

# ... Should show $LOCAL_CUSTOM_TLD
resolver #8
  domain   : hack # <- ("bones")
  nameserver[0] : 127.0.0.1
  flags    : Request A records, Request AAAA records
  reach    : 0x00030002 (Reachable,Local Address,Directly Reachable Address)
```

## Test it with a subdomain of .hack (.bones)

```bash
ping -c 1 nginx.random.${LOCAL_CUSTOM_TLD}

# ...
PING nginx.random.hack (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.052 ms

--- nginx.random.hack ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 0.052/0.052/0.052/0.000 ms
```

## Run a local Docker container

Run a local docker container on port 8088 to test it.

```bash
docker run --rm -p8088:80 --name nginx -d nginx

# Test it
curl -I nginx.random.hack:8088

HTTP/1.1 200 OK
Server: nginx/1.25.3
Date: Tue, 12 Dec 2023 12:24:58 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Tue, 24 Oct 2023 13:46:47 GMT
Connection: keep-alive
ETag: "6537cac7-267"
Accept-Ranges: bytes

# Remove it
docker stop nginx
```

## Setups for Bones

```bash
brew install kubernetes-cli dnsmasq

# To keep it dry
export LOCAL_CUSTOM_TLD="bones" 

# Register .bones TLD locally
echo "address=/.${LOCAL_CUSTOM_TLD}/127.0.0.1" >> $(brew --prefix)/etc/dnsmasq.conf

# Configure the local resolver
sudo mkdir /etc/resolver/
cat <<EOF | sudo tee /etc/resolver/${LOCAL_CUSTOM_TLD}
nameserver 127.0.0.1
EOF

# Restart local dnsmasq service
sudo brew services restart dnsmasq

# Restart mDNSResponder
sudo killall -HUP mDNSResponder

# Verify the new resolver was picked up
scutil --dns

# ... Should show $LOCAL_CUSTOM_TLD
resolver #8
  domain   : hack # <- ("bones")
  nameserver[0] : 127.0.0.1
  flags    : Request A records, Request AAAA records
  reach    : 0x00030002 (Reachable,Local Address,Directly Reachable Address)
```
