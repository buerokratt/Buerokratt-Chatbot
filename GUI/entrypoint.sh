#!/bin/sh

# Replace environment variables in the Nginx configuration template
envsubst '$BASE_URL $REACT_APP_RUUTER_API_URL $REACT_APP_RUUTER_V1_PRIVATE_API_URL $REACT_APP_RUUTER_V2_PRIVATE_API_URL $REACT_APP_CUSTOMER_SERVICE_LOGIN $CHOKIDAR_USEPOLLING $PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start the Nginx server
nginx -g "daemon off;"
