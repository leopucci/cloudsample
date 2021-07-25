https://medium.com/jspoint/packaging-and-distributing-electron-applications-using-electron-builder-311fc55178d9
https://github.com/course-one/electron-lessons/tree/file-io-builder
Comecei direto deste ponto sem react porque:
Ja tem build configurado pras 3 plataformas
Ja tem a comunicação de io entre o chokdir/filesystem node com a UI usando IPC

//Todo: fazer crash report online https://www.thorsten-hans.com/electron-crashreporter-stay-up-to-date-if-your-app-fucked-up/
o crash report meio que eu ja fiz, usando https://app.glitchtip.com/mycompany/issues que eh o bagulho que ficou pago..
este eu posso hospedar no meu server, mas por hora ta no free. 


UPLOAD
isso aqui eh um exemplo de pipe, so pra nao estourar memoria na hora de fazer upload dos arquivos. 
https://stackoverflow.com/a/58103144/3156756
isto aqui eh um exemplo de require("stream-throttle") que tem agrupamento
pra ele ler o stream/arquivo aos poucos. 
https://stackoverflow.com/a/57918466/3156756
isto precisa colocar bater na api mais lentamente.  
https://github.com/aishek/axios-rate-limit


Este documento explica como adicionar o sync no windows explorer
https://docs.microsoft.com/en-us/windows/win32/shell/integrate-cloud-storage#step-3-add-your-extension-to-the-navigation-pane-and-make-it-visible

Aqui tem um exemplo de como usar o cloud mirror mas ele usa um esquema diferente. 
https://github.com/microsoft/Windows-classic-samples/tree/master/Samples/CloudMirror/CloudMirrorPackage

Este aqui eh um exemplo de webdav e outros exemplos.. de cloud no mac e tal.. 
https://github.com/ITHit/UserFileSystemSamples

Aqui tem o esquema de usar o WINRT, mas eu acho que vou fazer o basico com regedit, pra poder oferecer o mesmo at� no windows 7
pra ser cloud storage provider dae isto aqui daria certo, mas tudo eh muito novo, melhor esperar..
acho que da pra usar com o node mesmo, mais pra frente.. 
https://www.npmjs.com/package/@nodert-win10-rs4/windows.storage.provider


PROTECAO DE CODIGO FONTE
https://stackoverflow.com/a/50042857/3156756
bytenode parece ser interessante, mas ele tem problemas com electron, tem que usar depois de bem maduro. 
https://github.com/bytenode/bytenode  => read this https://www.reddit.com/r/electronjs/comments/n155qh/compile_your_js_code_new_bytenode_support_for/
https://github.com/sleeyax/asarmor

Servicos de localizacao.. pra traducao.. usando o github
https://crowdin.com/project   https://docusaurus.io/docs/2.0.0-beta.0/i18n/crowdin
é feito por estes caras aqui https://alconost.com/en/localization/crowdin-alconost
que tambem fazem videos e campanhas de marketing

esta tambem e uma boa opção
https://lokalise.com/blog/category/tutorials/

este ipc eh mais completo
https://www.npmjs.com/package/electron-common-ipc

https://github.com/atom/node-keytar

https://medium.com/@bella.jonas1112/case-assignment-freemium-pricing-at-dropbox-c826f88ad758


HOTP pra fazer token em javascript, 
eu pensei em usar, mas isso vai contra JWT API pq dae como que eu vou disponibilizar API pra galera. 
https://github.com/jiangts/JS-OTP


montar um pacote javascript, no NPM que faça todo o meio de campo, (login) listar arquivos, fazer upload. deletar.. eh tipo um SAAS, ja deixa o serviço 
exposto pra qualquer aplicação..
nao precisa ser só em javascript, posso montar isto em outras linguagens, pra deixar pronto pro programador. 
