#!/bin/bash
#Este arquivo compilar pra AST porque eh o que o react pede. 
# We recommending compiling your messages into AST as it allows us to skip parsing them during runtime. This makes your app more performant.
# https://formatjs.io/docs/getting-started/message-distribution/
npx formatjs compile src/locales/raw_locales/en.json --ast --out-file src/locales/compiled_locales/en.json