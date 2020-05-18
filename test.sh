#!/usr/bin/env bash

cd ./common
yarn run test

if [ $? -eq 0 ]; then
    echo "TESTS PASSED"
    exit 0
else
    echo "TESTS FAILED"
    exit 1
fi
