#!/bin/bash

# Este script saiu de dentro do package.json por problemas de execucao. (Assertion failed! Expression: wargc == argc)
# Alguma coisa na hora de rodar o jq, mas no gitbash roda legal. 

# Objetivo é:
#   1 - extrair os simbolos do código
#   2 - fazer um merge entre os simbolos e a linguagem padrao en-us. https://github.com/formatjs/formatjs/issues/1554#issuecomment-719859636 
#   3 - gerar um novo en-us.json que sera usado nas ferramentas de tradução
echo "Extraindo ids de dentro do codigo pra formar um arquivo de ids"
npx formatjs extract 'src/**/*.{ts,js,tsx,jsx}' --out-file src/locales/raw_locales/extracted_formatjs.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'
rm -rf src/locales/raw_locales/merged.json
echo "Jogando estes Ids via merge pro arquivo en.json ja que ele eh a base de toda tradução"
jq -s '.[0] * .[1]' src/locales/raw_locales/en.json src/locales/raw_locales/extracted_formatjs.json > src/locales/raw_locales/merged.tmpjson && cp src/locales/raw_locales/merged.tmpjson src/locales/raw_locales/en.json
echo "Estou fazendo upload pro crowdin, mas ja esta tudo configurado no BabelEdit"
crowdin upload sources
