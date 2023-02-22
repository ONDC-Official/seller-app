# Node module installation stage
FROM node:16.14.0 AS npmPackageInstallationStage
WORKDIR /usr/src/app-staging-folder
COPY package*.json ./

# Note: all npm packages are installed directly in the workdir and not under node_modules.
RUN npm install
COPY . .

# Babel build creation stage
FROM node:16.14.0 AS distCreationStage
WORKDIR /usr/src/app-staging-folder
RUN mkdir node_modules

# Copy node_modules from npmPackageInstallationStage
COPY --chown=node:node --from=npmPackageInstallationStage /usr/src/app-staging-folder/* /usr/src/app-staging-folder/node_modules/

# Copy code base for babel compilation
COPY package*.json ./
COPY ./app ./app

ENV NODE_ENV production
ENV APP_ENV production
RUN pwd
RUN ls -alrt
RUN npm run babelBuild

# Production docker image creation stage
FROM node:16.14.0 AS dockerImageCreationStage
RUN apt update
RUN apt-get install -y dumb-init

ENV NODE_ENV production
ENV APP_ENV production

USER node
COPY --chown=node:node --from=distCreationStage /usr/src/app-staging-folder/node_modules /usr/src/app-staging-folder/node_modules/
COPY --chown=node:node --from=distCreationStage /usr/src/app-staging-folder/package.json /usr/src/app-staging-folder/package.json
COPY --chown=node:node --from=distCreationStage /usr/src/app-staging-folder/dist /usr/src/app-staging-folder/dist
CMD ["dumb-init", "node", "./dist/bin/www"]