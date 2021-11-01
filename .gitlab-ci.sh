#!/bin/sh

tar -xzf bundle.tar.gz

deploy_path=$1

if [ ! -d $deploy_path ]; then
  mkdir $deploy_path
fi

# 是否首次部署
deploy_first=false
if [ ! -d "$deploy_path/index.html" ]; then
  deploy_first=true
fi

if [ "$deploy_first" = true ]; then
  /bin/cp -fr index.html $deploy_path
  /bin/cp -fr favicon.ico $deploy_path
  /bin/cp -fr static $deploy_path
fi

# 删除无需部署的文件
rm -fr $deploy_path/*

# 实际部署文件
/bin/cp -fr index.html $deploy_path
/bin/cp -fr favicon.ico $deploy_path
/bin/cp -fr static $deploy_path


if [ "$deploy_first" = true ]; then
  deploy_first=false
fi