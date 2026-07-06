FROM node:20-alpine

ENV VERSION=1.0.21

WORKDIR /app

COPY package.json ./
COPY server/ ./server/
COPY src/ ./src/

EXPOSE 8080

HEALTHCHECK --timeout=10s CMD node -e \
  "require('http').get('http://localhost:8080/health',r=>{process.exitCode=r.statusCode===200?0:1}).on('error',()=>process.exit(1))"

USER node

CMD ["node", "server/server.js"]

# Required build arguments (used by CI/CD release pipeline)
ARG NAME
ARG RELEASE_DATE
ARG GIT_SHA1
ARG TAGS

# Image build metadata
LABEL \
  vendor="Cato Networks, Inc." \
  maintainer="Brian Anderson <brian.anderson@catonetworks.com>" \
  com.catonetworks.image_name="${NAME}" \
  com.catonetworks.image_version="${VERSION}" \
  com.catonetworks.image_release_date="${RELEASE_DATE}" \
  com.catonetworks.image_tags="${TAGS}" \
  com.catonetworks.commit_id="${GIT_SHA1}"
