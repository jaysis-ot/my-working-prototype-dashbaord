root@srv931293:/home/jay/Downloads# chmod +x fix-docker-compose.sh
root@srv931293:/home/jay/Downloads# ./fix-docker-compose.sh
[2025-08-01 14:45:55] INFO: Starting Docker Compose configuration fix...
[2025-08-01 14:45:55] SUCCESS: Original Docker Compose file backed up to /opt/risk-platform/docker-compose.yml.20250801144555.bak
[2025-08-01 14:45:55] INFO: Creating API placeholder...
[2025-08-01 14:45:55] SUCCESS: API placeholder created
[2025-08-01 14:45:55] INFO: Creating fixed Docker Compose configuration...
[2025-08-01 14:45:55] SUCCESS: Fixed Docker Compose configuration created
[2025-08-01 14:45:55] SUCCESS: Environment variables file created
[2025-08-01 14:45:55] INFO: Installing Node.js...
Hit:1 http://mirror.server.net/ubuntu noble InRelease
Hit:2 http://mirror.server.net/ubuntu noble-updates InRelease
Hit:3 http://mirror.server.net/ubuntu noble-security InRelease
Hit:4 http://archive.ubuntu.com/ubuntu noble InRelease  
Hit:5 http://archive.ubuntu.com/ubuntu noble-updates InRelease
Hit:6 http://archive.ubuntu.com/ubuntu noble-backports InRelease
Hit:7 http://mirror.server.net/ubuntu noble-backports InRelease  
Hit:8 http://archive.ubuntu.com/ubuntu noble-security InRelease  
Hit:9 https://repository.monarx.com/repository/ubuntu-noble noble InRelease  
Hit:10 https://download.docker.com/linux/ubuntu noble InRelease  
Reading package lists... Done  
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
ca-certificates is already the newest version (20240203).
curl is already the newest version (8.5.0-2ubuntu10.6).
gnupg is already the newest version (2.4.4-2ubuntu17.3).
0 upgraded, 0 newly installed, 0 to remove and 6 not upgraded.
deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Hit:2 http://mirror.server.net/ubuntu noble InRelease  
Hit:3 http://mirror.server.net/ubuntu noble-updates InRelease  
Hit:4 http://mirror.server.net/ubuntu noble-security InRelease  
Hit:5 http://mirror.server.net/ubuntu noble-backports InRelease  
Hit:6 http://archive.ubuntu.com/ubuntu noble-updates InRelease  
Hit:7 http://archive.ubuntu.com/ubuntu noble-backports InRelease  
Hit:8 http://archive.ubuntu.com/ubuntu noble-security InRelease  
Hit:9 https://download.docker.com/linux/ubuntu noble InRelease  
Hit:10 https://repository.monarx.com/repository/ubuntu-noble noble InRelease  
Get:11 https://deb.nodesource.com/node_20.x nodistro InRelease [12.1 kB]
Get:12 https://deb.nodesource.com/node_20.x nodistro/main amd64 Packages [12.2 kB]
Fetched 24.4 kB in 1s (21.7 kB/s)  
Reading package lists... Done
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following NEW packages will be installed:
nodejs
0 upgraded, 1 newly installed, 0 to remove and 6 not upgraded.
Need to get 32.0 MB of archives.
After this operation, 199 MB of additional disk space will be used.
Get:1 https://deb.nodesource.com/node_20.x nodistro/main amd64 nodejs amd64 20.19.4-1nodesource1 [32.0 MB]
Fetched 32.0 MB in 0s (87.1 MB/s)
Selecting previously unselected package nodejs.
(Reading database ... 189688 files and directories currently installed.)
Preparing to unpack .../nodejs_20.19.4-1nodesource1_amd64.deb ...
Unpacking nodejs (20.19.4-1nodesource1) ...
Setting up nodejs (20.19.4-1nodesource1) ...
Processing triggers for man-db (2.12.0-4build2) ...
Scanning processes...  
Scanning linux images...

Pending kernel upgrade!
Running kernel version:
6.8.0-64-generic
Diagnostics:
The currently running kernel version is not the expected kernel version 6.8.0-71-generic.

Restarting the system to load the new kernel will not be handled automatically, so you should consider rebooting.

No services need to be restarted.

No containers need to be restarted.

No user sessions are running outdated binaries.

No VM guests are running outdated hypervisor (qemu) binaries on this host.
[2025-08-01 14:46:11] SUCCESS: Node.js installed
[2025-08-01 14:46:11] INFO: Building and starting services...
[+] Running 48/48
✔ alertmanager Pulled 13.6s
✔ 545c14a5a415 Pull complete 11.1s
✔ 6fcbfeb5877c Pull complete 12.0s
✔ a9c7f41169bf Pull complete 12.1s
✔ 5759234535c5 Pull complete 12.1s
✔ 4f4fb700ef54 Pull complete 12.1s
✔ nginx Pulled 11.1s
✔ 4abcf2066143 Pull complete 4.7s
✔ fc21a1d387f5 Pull complete 5.8s
✔ e6ef242c1570 Pull complete 5.8s
✔ 13fcfbc94648 Pull complete 5.9s
✔ d4bca490e609 Pull complete 5.9s
✔ 5406ed7b06d9 Pull complete 6.0s
✔ 8a3742a9529d Pull complete 6.0s
✔ 0d0c16747d2c Pull complete 9.6s
✔ db Pulled 13.4s
✔ 9824c27679d3 Pull complete 0.6s
✔ ad66e73d9475 Pull complete 0.6s
✔ e62b35ad5ef0 Pull complete 0.7s
✔ d0075eb78730 Pull complete 0.9s
✔ f9996286154d Pull complete 0.9s
✔ 0ff154fa3401 Pull complete 11.8s
✔ ca2e0665c045 Pull complete 11.8s
✔ 68fd2dbe7703 Pull complete 11.8s
✔ e155013fa2b9 Pull complete 11.9s
✔ 27e0d631c908 Pull complete 11.9s
✔ 5f5cf5fab12d Pull complete 11.9s
✔ prometheus Pulled 16.6s
✔ 9fa9226be034 Pull complete 6.1s
✔ 1617e25568b2 Pull complete 8.1s
✔ 097a69c6efe6 Pull complete 12.6s
✔ 2ee6cb77bebd Pull complete 15.0s
✔ a4e782810d03 Pull complete 15.0s
✔ 76619c1908eb Pull complete 15.0s
✔ 2dfc70ad9941 Pull complete 15.0s
✔ fd1d3a5a5f79 Pull complete 15.1s
✔ 5e4c02bc6754 Pull complete 15.1s
✔ 208063e2dcbb Pull complete 15.1s
✔ grafana Pulled 20.9s
✔ 69236fc2bfd9 Pull complete 2.1s
✔ 9393ac56ed95 Pull complete 2.7s
✔ a26e3c55e1fd Pull complete 3.8s
✔ 23f45cd68698 Pull complete 3.8s
✔ ed3060fc3d6c Pull complete 3.9s
✔ ffd7fc70b06d Pull complete 14.9s
✔ f90a6212104f Pull complete 19.4s
✔ 30b66297d085 Pull complete 19.5s
✔ 960d2bc84ffe Pull complete 19.5s
#1 [internal] load local bake definitions
#1 reading from stdin 497B done
#1 DONE 0.0s

#2 [internal] load build definition from Dockerfile
#2 transferring dockerfile: 153B done
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/node:20-alpine
#3 DONE 1.2s

#4 [internal] load .dockerignore
#4 transferring context: 2B done
#4 DONE 0.0s

#5 [internal] load build context
#5 transferring context: 2.80kB done
#5 DONE 0.0s

#6 [1/5] FROM docker.io/library/node:20-alpine@sha256:df02558528d3d3d0d621f112e232611aecfee7cbc654f6b375765f72bb262799
#6 resolve docker.io/library/node:20-alpine@sha256:df02558528d3d3d0d621f112e232611aecfee7cbc654f6b375765f72bb262799 0.0s done
#6 sha256:7cdef5a331927fafa250be6166052d8599bf5eb7b014342538c2cc79b70a081f 6.42kB / 6.42kB done
#6 sha256:8c59d92d6fc9f01af4aaa86824be72b74bd4d940c4c46aa95d9710bfa46c975e 0B / 42.99MB 0.1s
#6 sha256:54225bd601967a0aa669ec9be621c24d8eeac874b698d55874018070898685c2 0B / 1.26MB 0.1s
#6 sha256:a9e48ad1219d4d11c6456a8db0fd5c11af46242d52edf84e17ab84a7bfd93809 0B / 445B 0.1s
#6 sha256:df02558528d3d3d0d621f112e232611aecfee7cbc654f6b375765f72bb262799 7.67kB / 7.67kB done
#6 sha256:ae6ee91a652d927de01d550c29f863a52f1da390c89df95f3ceba256d1e62604 1.72kB / 1.72kB done
#6 sha256:8c59d92d6fc9f01af4aaa86824be72b74bd4d940c4c46aa95d9710bfa46c975e 3.15MB / 42.99MB 0.4s
#6 sha256:54225bd601967a0aa669ec9be621c24d8eeac874b698d55874018070898685c2 1.26MB / 1.26MB 0.4s done
#6 sha256:8c59d92d6fc9f01af4aaa86824be72b74bd4d940c4c46aa95d9710bfa46c975e 11.53MB / 42.99MB 0.5s
#6 sha256:a9e48ad1219d4d11c6456a8db0fd5c11af46242d52edf84e17ab84a7bfd93809 445B / 445B 0.4s done
#6 sha256:8c59d92d6fc9f01af4aaa86824be72b74bd4d940c4c46aa95d9710bfa46c975e 24.12MB / 42.99MB 0.7s
#6 sha256:8c59d92d6fc9f01af4aaa86824be72b74bd4d940c4c46aa95d9710bfa46c975e 38.80MB / 42.99MB 0.9s
#6 sha256:8c59d92d6fc9f01af4aaa86824be72b74bd4d940c4c46aa95d9710bfa46c975e 42.99MB / 42.99MB 1.0s done
#6 extracting sha256:8c59d92d6fc9f01af4aaa86824be72b74bd4d940c4c46aa95d9710bfa46c975e 0.1s
#6 extracting sha256:8c59d92d6fc9f01af4aaa86824be72b74bd4d940c4c46aa95d9710bfa46c975e 1.2s done
#6 extracting sha256:54225bd601967a0aa669ec9be621c24d8eeac874b698d55874018070898685c2
#6 extracting sha256:54225bd601967a0aa669ec9be621c24d8eeac874b698d55874018070898685c2 0.0s done
#6 extracting sha256:a9e48ad1219d4d11c6456a8db0fd5c11af46242d52edf84e17ab84a7bfd93809 done
#6 DONE 2.4s

#7 [2/5] WORKDIR /app
#7 DONE 0.3s

#8 [3/5] COPY package.json .
#8 DONE 0.0s

#9 [4/5] RUN npm install
#9 5.153
#9 5.153 added 76 packages, and audited 77 packages in 5s
#9 5.153
#9 5.153 14 packages are looking for funding
#9 5.153 run `npm fund` for details
#9 5.155
#9 5.155 found 0 vulnerabilities
#9 5.156 npm notice
#9 5.156 npm notice New major version of npm available! 10.8.2 -> 11.5.2
#9 5.156 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.5.2
#9 5.156 npm notice To update run: npm install -g npm@11.5.2
#9 5.156 npm notice
#9 DONE 5.2s

#10 [5/5] COPY . .
#10 DONE 0.0s

#11 exporting to image
#11 exporting layers
#11 exporting layers 0.2s done
#11 writing image sha256:92dbcac55f200fb55123c98f6d30e03a8b16c5a833786dd9e3dfd8f3f89189b0 done
#11 naming to docker.io/library/risk-platform-api done
#11 DONE 0.2s

#12 resolving provenance for metadata file
#12 DONE 0.0s
[+] Running 8/8
✔ risk-platform-api Built 0.0s
✔ Network risk-platform_risk-platform-network Created 0.1s
✔ Container risk-platform-alertmanager Started 1.0s
✔ Container risk-platform-db Started 0.9s
✔ Container risk-platform-prometheus Started 0.9s
✔ Container risk-platform-grafana Started 1.5s
✔ Container risk-platform-api Started 1.5s
✔ Container risk-platform-nginx Started 2.4s
[2025-08-01 14:46:45] SUCCESS: Services built and started successfully
[2025-08-01 14:46:45] INFO: Waiting for services to be ready...
[2025-08-01 14:46:55] SUCCESS: Services are running

===============================================
Risk Platform Deployment Fixed!  
===============================================

The Risk Platform has been successfully fixed and deployed.

Access the platform at: http://31.97.114.80
API status: http://31.97.114.80/api/status
Monitoring dashboard: http://31.97.114.80/monitoring

Grafana admin credentials:
Username: admin
Password: admin

===============================================
[2025-08-01 14:46:55] SUCCESS: Docker Compose configuration fix completed
root@srv931293:/home/jay/Downloads# ./continue-vps-deployment-fixed.sh --all
===============================================
Risk Platform VPS Deployment - Version 2.0.0-ubuntu24.04  
===============================================
[2025-08-01 14:48:58] INFO: Starting full deployment process...
[2025-08-01 14:48:58] INFO: Installing Docker...
[2025-08-01 14:48:58] WARNING: Docker and Docker Compose are already installed. Skipping installation.
[2025-08-01 14:48:58] INFO: Creating project structure...
[2025-08-01 14:48:58] SUCCESS: Project structure created successfully
[2025-08-01 14:48:58] INFO: Automation state saved: structure_created
[2025-08-01 14:48:58] INFO: Creating Docker Compose configuration...
[2025-08-01 14:48:58] SUCCESS: Docker Compose configuration created successfully
[2025-08-01 14:48:58] INFO: Automation state saved: docker_compose_created
[2025-08-01 14:48:58] INFO: Creating monitoring configurations...
[2025-08-01 14:48:58] SUCCESS: Monitoring configurations created successfully
[2025-08-01 14:48:58] INFO: Automation state saved: monitoring_configs_created
[2025-08-01 14:48:58] INFO: Creating Nginx configuration...
[2025-08-01 14:48:58] SUCCESS: Nginx configuration created successfully
[2025-08-01 14:48:58] INFO: Automation state saved: nginx_config_created
[2025-08-01 14:48:58] INFO: Creating backup scripts...
[2025-08-01 14:48:58] SUCCESS: Backup scripts created successfully
[2025-08-01 14:48:58] INFO: Automation state saved: backup_scripts_created
[2025-08-01 14:48:58] INFO: Creating monitoring scripts...
[2025-08-01 14:48:58] SUCCESS: Monitoring scripts created successfully
[2025-08-01 14:48:58] INFO: Automation state saved: monitoring_scripts_created
[2025-08-01 14:48:58] INFO: Validating setup...
[2025-08-01 14:48:58] SUCCESS: Validation completed successfully
[2025-08-01 14:48:58] INFO: Automation state saved: validation_completed
[2025-08-01 14:48:58] INFO: Deploying platform...
[2025-08-01 14:48:58] INFO: Pulling Docker images...
WARN[0000] /opt/risk-platform/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Pulling 6/6
✔ prometheus Pulled 0.9s
✔ nginx Pulled 0.9s
✔ grafana Pulled 0.9s
✔ alertmanager Pulled 0.8s
✘ api Error pull access denied for risk-platform-api, repository does not exist or may require 'docker login': denied: requested access to the ... 1.0s
✔ db Pulled 0.9s
Error response from daemon: pull access denied for risk-platform-api, repository does not exist or may require 'docker login': denied: requested access to the resource is denied
[2025-08-01 14:48:59] INFO: Starting services...
WARN[0000] /opt/risk-platform/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[+] Running 6/6
✔ Container risk-platform-grafana Started 1.6s
✔ Container risk-platform-db Started 1.6s
✔ Container risk-platform-api Started 1.6s
✔ Container risk-platform-nginx Started 1.4s
✔ Container risk-platform-prometheus Started 0.0s
✔ Container risk-platform-alertmanager Started 0.0s
WARN[0000] /opt/risk-platform/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion
[2025-08-01 14:49:02] SUCCESS: Services started successfully
[2025-08-01 14:49:02] SUCCESS: Platform deployed successfully
[2025-08-01 14:49:02] INFO: Automation state saved: platform_deployed

===============================================
Risk Platform Deployment Complete  
===============================================

The Risk Platform has been successfully deployed on your VPS.

Access the platform at: https://31.97.114.80
Access the monitoring dashboard at: https://31.97.114.80/monitoring

Grafana admin password: c/y/Gvep87YK6H9JfIkFDg==

Important directories:

- Configuration: /opt/risk-platform/config
- Data: /opt/risk-platform/data
- Logs: /opt/risk-platform/logs
- Backups: /opt/risk-platform/backups
- Scripts: /opt/risk-platform/scripts

Backup scripts are scheduled to run automatically.
Health checks are performed every 5 minutes.

# For more information, refer to the documentation.

[2025-08-01 14:49:02] SUCCESS: Deployment process completed successfully
[2025-08-01 14:49:02] INFO: Automation state saved: completed
root@srv931293:/home/jay/Downloads# ^C
root@srv931293:/home/jay/Downloads#
