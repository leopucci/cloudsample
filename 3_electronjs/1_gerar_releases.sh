#!/bin/bash
rm -rf out
npm run pack
git fetch
git pull
git add 'out/Pocket.Cloud Setup 1.0.0.exe'
git commit -m 'Commit automatico do Mac gerando release'
git push 'https://leopucci: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@github.com/leopucci/pocketcloud.git/'
curl --silent --output /dev/null https://api.telegram.org/bot1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo/sendMessage -d chat_id=@notificacoespc -d text="Build terminou no mac %0A"