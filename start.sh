#!/usr/bin/env bash

docker build --network host -t jsf-app .
if [ $? -eq 0 ]
then
    echo "DOCKER BUILD OK"
else
    echo "DOCKER BUILD FAIL"
    exit 1
fi
docker run -p 4200:4200 jsf-app
