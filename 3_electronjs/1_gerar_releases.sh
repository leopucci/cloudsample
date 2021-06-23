#!/bin/bash
rm -rf out
npm run pack
git add 'out/Pocket.Cloud Setup 1.0.0.exe'
git commit -m 'Commit automatico do Mac gerando release'
git push 'https://leopucci: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@github.com/leopucci/pocketcloud.git/'