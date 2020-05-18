#!/bin/sh

NODE_OPTIONS=--max-old-space-size=8192
export NODE_OPTIONS=--max-old-space-size=8192

echo "> COMMON INSTALL"
cd ./common
yarn install
if [ $? -eq 0 ];
then
    echo "COMMON INSTALL OK"
else
    echo "COMMON INSTALL FAIL"
    exit 1
fi
cd ..

echo "> APP INSTALL"
cd ./app
yarn install && if [ $? -eq 0 ]; then echo "INSTALL OK"; else echo "INSTALL FAILED"; exit 1; fi;
if [ $? -eq 0 ]
then
    echo "APP INSTALL OK"
else
    echo "APP INSTALL FAIL"
    exit 1
fi
cd ..

echo "> HANDLERS INSTALL"
cd ./app/src/jsf-handlers/common
yarn install && if [ $? -eq 0 ]; then echo "INSTALL OK"; else echo "INSTALL FAILED"; exit 1; fi;
if [ $? -eq 0 ]
then
    echo "HANDLERS INSTALL OK"
else
    echo "HANDLERS INSTALL FAIL"
    exit 1
fi
cd ../../../..

echo "======================"

echo "> COMMON BUILD"
cd ./common
yarn run build:ts && if [ $? -eq 0 ]; then echo "BUILD OK"; else echo "BUILD FAILED"; exit 1; fi;
yarn run build:ts:es2015 && if [ $? -eq 0 ]; then echo "BUILD OK"; else echo "BUILD FAILED"; exit 1; fi;
mkdir -p ../app/node_modules/@kalmia/jsf-common-es2015/lib
cp -R ./ ../app/node_modules/@kalmia/jsf-common-es2015
yarn run cp:dev:app  && if [ $? -eq 0 ]; then echo "CP OK"; else echo "CP FAILED"; exit 1; fi;
cd ..

echo "> APP BUILD"
cd ./app
yarn run build:lib
if [ $? -eq 0 ]
then
    echo "APP BUILD LIB INSTALL OK"
else
    echo "APP BUILD LIB INSTALL FAIL"
    exit 1
fi

yarn run build
if [ $? -eq 0 ]
then
    echo "APP BUILD INSTALL OK"
else
    echo "APP BUILD INSTALL FAIL"
    exit 1
fi
