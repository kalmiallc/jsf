#!/bin/sh

set -e
yarn run build

JSCODE="
var x = require('./package.json');
x.version = x.version.split('.').map((x, i) => + (i === 2) + + x).join('.');
fs.writeFileSync('./package.json', JSON.stringify(x, null, 2));
"
node -e "$JSCODE"

# DO NOT!
# cp ./package.json ./dist/package.json

cd ./dist

JSCODE="
var x = require('./package.json');
x.version = x.version.split('.').map((x, i) => + (i === 2) + + x).join('.');
fs.writeFileSync('./package.json', JSON.stringify(x, null, 2));
"
node -e "$JSCODE"

git init
yarn publish --non-interactive

JSCODE="
var np = require('./package.json');
var op = require('./../package.json');
op.version = np.version;
var fs = require('fs');
fs.writeFileSync('./../package.json', JSON.stringify(op, null, 2));
"
node -e "$JSCODE"

echo "JSF-APP published"

cd ..
rm -rf ./dist

git add package.json
git diff-index --quiet HEAD || git commit --no-verify -m "Bot: publish kalmia/jsf-app@$( node -e "console.log(require('./package.json').version)" )"
