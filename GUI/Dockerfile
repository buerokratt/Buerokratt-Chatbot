#ARG node_version=node:lts
#ARG nginx_version=nginx:1.21.3-alpine

#FROM $node_version as image
#WORKDIR /usr/buerokratt-chatbot
#COPY ./package*.json ./

#FROM image AS build
#RUN npm ci --legacy-peer-deps --mode=development
#COPY . .
#RUN ./node_modules/.bin/vite build

#FROM $nginx_version AS web
#COPY ./nginx/https-nginx.conf /etc/nginx/conf.d/default.conf
#COPY --from=build ./usr/buerokratt-chatbot/build /usr/share/nginx/html/buerokratt-chatbot
#EXPOSE 3001

#CMD ["nginx", "-g", "daemon off;"]

# Build stage
FROM node:lts as build
WORKDIR /usr/buerokratt-chatbot
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.21.3-alpine as production
COPY ./nginx/https-nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY --from=build /usr/buerokratt-chatbot/build /usr/share/nginx/html

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3001
CMD ["/entrypoint.sh"]
