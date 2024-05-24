#!/bin/sh
for envrow in $(printenv);
do
    IFS='=' read -r key value <<< "${envrow}"
    if [[ $key == "REACT_APP_"* ]]; then
    for file in $(find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \))
    do
       sed -i "s|{}.${key}|\"${value}\"|g" $file;
    done
    fi
done
[ -z "$@" ] && nginx -g 'daemon off;' || $@
