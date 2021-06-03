#!/bin/bash
npm i --save @nodert-win10-rs4/windows.storage.provider --ignore-scripts
cp -f CollectionsWrap.h ../node_modules/@nodert-win10-rs4/windows.storage.provider
cd ../node_modules/@nodert-win10-rs4/windows.storage.provider
node-gyp rebuild

#https://github.com/NodeRT/NodeRT/issues/127