ARG node_version=node:lts
ARG nginx_version=nginx:1.21.3-alpine

FROM $node_version as image
WORKDIR /usr/buerokratt-chatbot
COPY ./package*.json ./

FROM image AS build
RUN npm ci --legacy-peer-deps --mode=development
COPY . .
RUN ./node_modules/.bin/vite build

FROM $nginx_version AS web
COPY ./nginx/https-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build ./usr/buerokratt-chatbot/build /usr/share/nginx/html/buerokratt-chatbot
EXPOSE 3001

# Set the environment variables
ENV NODE_ENV=${NODE_ENV}
ENV BASE_URL=${BASE_URL}
ENV REACT_APP_RUUTER_API_URL=${REACT_APP_RUUTER_API_URL}
ENV REACT_APP_RUUTER_V1_PRIVATE_API_URL=${REACT_APP_RUUTER_V1_PRIVATE_API_URL}
ENV REACT_APP_RUUTER_V2_PRIVATE_API_URL=${REACT_APP_RUUTER_V2_PRIVATE_API_URL}
ENV REACT_APP_CUSTOMER_SERVICE_LOGIN=${REACT_APP_CUSTOMER_SERVICE_LOGIN}
ENV CHOKIDAR_USEPOLLING=${CHOKIDAR_USEPOLLING}
ENV PORT=${PORT}

CMD ["nginx", "-g", "daemon off;"]
