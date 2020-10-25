FROM cristiancmello/resvg as resvg

FROM node:buster-slim

RUN apt-get update && apt-get install -y \
    fontconfig-config \
    xfonts-utils && \
    rm -rf /var/lib/apt/lists/*

COPY fonts /usr/local/share/fonts

RUN dpkg-reconfigure fontconfig-config

COPY --from=resvg /usr/local/bin/resvg /usr/local/bin/resvg 

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ./src/package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./src .

EXPOSE 8080
CMD [ "node", "server.js" ]