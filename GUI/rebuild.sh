#!/bin/sh

# Install dependencies
apk add nodejs

# Rebuild the project
cd /opt/buerokratt-chatbot
./node_modules/.bin/vite build -l warn
cp -ru build/* /usr/share/nginx/html/buerokratt-chatbot

# Start the Nginx server
nginx -g "daemon off;"
