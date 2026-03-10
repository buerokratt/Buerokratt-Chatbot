#!/bin/sh
for key in $(compgen -e); do
    if [[ $key == "REACT_APP_"* ]]; then
        value=$(eval echo \$$key)
        if [[ $key == "REACT_APP_MENU_JSON" ]]; then
            wrapped_value="'${value}'"
        else
            wrapped_value="\"${value}\""
        fi
        for file in $(find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \)); do
            sed -i "s|{}.${key}|${wrapped_value}|g" "$file"
            sed -i "s|({}).${key}|${wrapped_value}|g" "$file"
        done
    fi
done
[ -z "$@" ] && nginx -g 'daemon off;' || "$@"
