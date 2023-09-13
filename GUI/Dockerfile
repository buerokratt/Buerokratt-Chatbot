ARG node_version=node:lts
ARG nginx_version=nginx:1.21.3-alpine

FROM $node_version as image
WORKDIR /usr/buerokratt-chatbot
COPY ./package*.json ./

FROM image AS build
RUN npm ci --legacy-peer-deps --mode=development
COPY . .
RUN ./node_modules/.bin/vite build --mode=development
VOLUME /usr/buerokratt-chatbot

FROM $nginx_version AS web
COPY ./nginx/https-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build ./usr/buerokratt-chatbot/ /opt/buerokratt-chatbot/
COPY --from=build ./usr/buerokratt-chatbot/build /usr/share/nginx/html/buerokratt-chatbot
EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
