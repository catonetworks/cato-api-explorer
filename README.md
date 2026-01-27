# Cato API Explorer
 
## Description

This web based application enables developers to quickly unit test individual API calls for the Cato GraphQL API.

The Cato API Explorer is a docker-based web application API client, developed as an open-source project available for immediate use and comes with no official support. This application is designed initially to be built and run as a container locally to be used "as is", the container may be migrate to the hosted Cato registry. Additionally, the containerized version may be decommissioned and migrated to a fully hosted version at any point in the future.

## Prerequisites

- Install [Docker Desktop](https://docs.docker.com/desktop/) on the system.
- Create a folder named `cato-api-explorer` on your local system, and download the [docker-compose.yml](https://github.com/catonetworks/cato-api-explorer/blob/main/docker-compose.yml) from this repository into this folder.

## Container Setup using Docker Compose

To deploy a container based on this image, follow the steps below.  The instructions assume you have chosen your home directory of `~/cato-api-explorer` as a base folder for storing settings and data.  If you choose a different path, please update the path in the commands below accordingly.

1. Change into the `~/cato-api-explorer` folder.
   - `host# cd ~/cato-api-explorer`
1. Pull the latest image from the registry on to your local system:
   - `host# docker compose pull`
1. Use **docker-compose** to bring up the container:
   - `host# docker compose up -d`

## Container Setup using native Docker commands

```bash
# Run the container:
docker run -d \
  --name cato-api-explorer \
  -p 8080:8080 \
  -e TZ=UTC \
  -e CONTAINER_NAME=cato-api-explorer \
  ghcr.io/catonetworks/cato-api-explorer:latest

# Stop and remove container in one step
docker rm -f cato-api-explorer

# Then remove the image if desired
docker rmi ghcr.io/catonetworks/cato-api-explorer:latest
```

## Accessing the UI

Once the container has been started, you can simply access the UI by navigating to <http://localhost:8080>.  You can modify the ports mapped by the sample **docker-compose.yml** file if you'd prefer to run HTTP and HTTPS traffic on ports other than 8080 and 8443, respectively, on your system.  

Example from docker-compose.yml:

```bash
   ports:
    - 8088:8080
    - 8443:443
```

The port number listed on the left is the listening port on the host and the port number on the right is the port inside the container.  For example, if 8080 is already in use on your system, to change the listening port to 8081, modify the config to use `8081:8080` instead and restart the contianer. 

## Upgrade Process

1. On the Docker host, create the **docker-compose.yml** file inside the `~/cato-api-explorer` folder. 
1. Stop the container
   - `host# docker compose down`
1. Pull the latest image from the registry:
   - `host# docker compose pull`
1. Use **docker-compose** to bring up the container:
   - `host# docker compose up -d`



## Initial GUI Configuration

Under the Settings tab, create add an existing API key to authenticate.  [CLICK HERE](https://support.catonetworks.com/hc/en-us/articles/4413280536081-Generating-API-Keys-for-the-Cato-API) to learn how to create an API key in the Cato Management Application (CMA). 

## Troubleshooting

If you need to access the container in order to troubleshoot one or more errors, you should use the `docker exec -t -i _containerId_ /bin/ash` command to connect to the container replacing **_ _containerId_ _** with the actual ID of the container shown in the first column when you run `docker ps -a`.  

Once connected, error information can be found in the **/var/log/apache2/error_log** file.

## Updating and Upgrading the Container

In the future, you can update the container by simply re-running **docker-compose build** followed by **docker-compose up --force-recreate** from the **/opt/docker/cato-api-explorer** folder.  These commands will automatically pull the latest version of the image(s) from the registry and replace it without affecting your data or configurations.

## Links

- [Download the docker-compose.yml](https://github.com/catonetworks/cato-api-explorer/blob/main/docker-compose.yml)
- [Generating API Keys for the Cato API](https://support.catonetworks.com/hc/en-us/articles/4413280536081-Generating-API-Keys-for-the-Cato-API)