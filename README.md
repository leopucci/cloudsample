# prompty


Apesar do nome a ideia aqui eh um dropbox. 
O Prompty é com websockets e com rabbitmq. ainda nao consegui colocar tudo na cabeça pra entender o todo. 
tem muita ponta solta, entao não estou ainda preparado pra lidar com o RabbitMq logo de cara. 

Entao como aprendizado, estou fazendo um dropbox-like. 
As ideias vieram mais analisando como os caras resolveram os problemas de 
escalabilidade do proprio dropbox. (https://m.youtube.com/watch?v=PE4gwstWhmc&t=10s)

Entao ficou a seguinte estrutura:
diretorios e nomes dos arquivos ficam dentro do banco de dados meu. 
já o arquivo fica dentro do amazon s3 (ou la em casa usando minio)
nao tem arquivo duplicado. os clientes geram hash, eles fizeram de 4 em 4 mega. 
fica uma coisa meio chata, porque ele tem que armazenar pedaços de arquivos e nao arquivos. 
ao mesmo tempo economiza cpu, ja que ele pode fazer igual eu fiz no pubshare, 
nao acho que eu precise complicar no começo porque eu tenho muito pra aprender. 

entao o cliente tem que gerar hash, eu comparo.. se eu ja salvei no S3, eu nao preciso fazer upload. 
mas dae eu tenho o controle no mongodb, dos arquivos das pastas, e isto fica sincronizado. 

Como arquitetura, ainda nao estou entrando no ponto do computador, so do celular. 
O celular vai ter um filesystem watcher, vai ter o firebase messaging
Adicionei um arquivo no celular:
processa hashes, joga pro servidor se nao tiver faz upload. se tiver faz linkagem. 
deleto um arquivo, marco pra deletar no banco. 
no celular vai ter um banco local, eu pensei em fazer em sqlite mas o rato fala pra eu usar realtime DB. o firebase msm. 
situação complicada eh a seuginte:
apagay o arquivo no celular offline. dae fui la no PC e renomeei o arquivo. 
quando ele sincronizar, o celular vai tentar deletar o arquivo, mas ele nao vai existir mais. 
apaguei no pc, e o cel offline, dae renomeei no cel... vai tentar renomear um arquivo que nao existe mais. 
pastas... apaguei uma pasta pc.. depois vou no cel offline, renomeio um arquivo dentro da pasta... na hora que conectar vai dar conflito. 
dae nao sei como proceder, se eu sinalizo o conflito pro cliente... se eu faço meio a meio.. deleto os arquivos, e renomeio ao mesmo tempo. 
Isto sao problemas futuros, mas estou tentando pensar a arquitetura já prevendo estes desafios. 
a ideia eh apagar os arquivos so apos uns 90 dias. assim tem como lidar com qquer entrave que der. 
Entao o banco no celular, sqlite. se eu pensar so no celular, fica tranquilo... mas como vai ter o pc o banco tem que ser online prevendo o offline. 

- eu tenho que ter 
funçoes que alimentam o banco sqlite, 
- inserçao de arquivos/pasta
- deletar arquivos/pastas
- renomear
- mover

Alguma parada que fique vigiando o banco e sincronize com a nave mae quando houver alteraçao. 
filesystem vai ficar processando e jogando pro sqlite. 
posso usar sockjs pra conectar com o servidor, ja fazer as chamadas com ele, ja pensando no rabbitmq. 

estes dois aqui sao um começo com autenticacao, 
pra eu me livrar do firebase e ter que pagar. 
https://www.youtube.com/watch?v=2D_76lkyF1c
https://github.com/rajayogan/flutterauth-MongoDB