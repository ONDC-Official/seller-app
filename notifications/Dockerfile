FROM node:16.14.0

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

#Need to copy utils as well

RUN npm cache verify

COPY . .

RUN npm install
# Copy the current directory contents into the container at /usr/src/app
COPY . .

#RUN npm run build

#ENV NODE_ENV production
#ENV APP_ENV production
ENV HOST 0.0.0.0
ENV PROTOCOL "http://"
ENV USE_FQDN_FOR_APIS false
ENV FQDN ""

#CMD [ "npm", "serve", "--port", $PORT]
CMD exec npm run start
