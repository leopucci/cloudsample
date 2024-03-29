#!/bin/bash
envia_mensagem() {
  n=0
  until [ "$n" -ge 900000 ]; do
    response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001163173913 -d text="$1")
    if [ "${response}" -ge "200" ]; then
      break
    fi
    #command && break  # substitute your command here
    n=$((n + 1))
    sleep 1
  done
}
envia_log() {
  screen -dm -S TESTE /opt/POCKETCLOUD/SCRIPTS/99_sendlog.sh 1 &
}
mata_processos() {
  MATAPROCESSOSPM2=$(ps aux | grep PM2 | grep -v grep | awk '{print $2}' | wc -l)
  PIDPROCESSOSPM2=$(ps aux | grep PM2 | grep -v grep | awk '{print $2}')
  if [ "$MATAPROCESSOSPM2" -ne 0 ]; then
    envia_mensagem "Ainda tem processos PM2 no ar, matando $MATAPROCESSOSPM2"
    echo "Ainda tem processos PM2 no ar, matando $MATAPROCESSOSPM2"
    kill -9 "$PIDPROCESSOSPM2" || true
  fi
  NUMOFPROCESSES=$(ps -ef | grep BACKENDAPI | grep -v grep | awk '{print $2}' | wc -l)
  PIDOFPROCESSES=$(ps -ef | grep BACKENDAPI | grep -v grep | awk '{print $2}')
  if [ "$NUMOFPROCESSES" -ne 0 ]; then
    envia_mensagem "Ainda tem processos no ar, matando $NUMOFPROCESSES"
    echo "Ainda tem processos no ar, matando $NUMOFPROCESSES"
    kill -9 "$PIDOFPROCESSES" || true
  fi
  MATAPROCESSOSPM2=$(ps aux | grep PM2 | grep -v grep | awk '{print $2}' | wc -l)
  PIDPROCESSOSPM2=$(ps aux | grep PM2 | grep -v grep | awk '{print $2}')
  if [ "$MATAPROCESSOSPM2" -ne 0 ]; then
    envia_mensagem "Ainda tem processos PM2 no ar, matando $MATAPROCESSOSPM2"
    echo "Ainda tem processos PM2 no ar, matando $MATAPROCESSOSPM2"
    kill -9 "$PIDPROCESSOSPM2" || true
  fi
  NUMOFPROCESSES=$(ps -ef | grep BACKENDAPI | grep -v grep | awk '{print $2}' | wc -l)
  PIDOFPROCESSES=$(ps -ef | grep BACKENDAPI | grep -v grep | awk '{print $2}')
  if [ "$NUMOFPROCESSES" -ne 0 ]; then
    envia_mensagem "Ainda tem processos no ar, matando $NUMOFPROCESSES"
    echo "Ainda tem processos no ar, matando $NUMOFPROCESSES"
    kill -9 "$PIDOFPROCESSES" || true
  fi
  MATAPROCESSOSPM2=$(ps aux | grep PM2 | grep -v grep | awk '{print $2}' | wc -l)
  PIDPROCESSOSPM2=$(ps aux | grep PM2 | grep -v grep | awk '{print $2}')
  if [ "$MATAPROCESSOSPM2" -ne 0 ]; then
    envia_mensagem "Ainda tem processos PM2 no ar, matando $MATAPROCESSOSPM2"
    echo "Ainda tem processos PM2 no ar, matando $MATAPROCESSOSPM2"
    kill -9 "$PIDPROCESSOSPM2" || true
  fi
  NUMOFPROCESSES=$(ps -ef | grep BACKENDAPI | grep -v grep | awk '{print $2}' | wc -l)
  PIDOFPROCESSES=$(ps -ef | grep BACKENDAPI | grep -v grep | awk '{print $2}')
  if [ "$NUMOFPROCESSES" -ne 0 ]; then
    envia_mensagem "Ainda tem processos no ar, matando $NUMOFPROCESSES"
    echo "Ainda tem processos no ar, matando $NUMOFPROCESSES"
    kill -9 "$PIDOFPROCESSES" || true
  fi
}
verifica_lock() {
  if [ -e /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt ]; then
    echo "DEPLOY RODANDO, segunda instancia bloqueada... se tiver problemas delete /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt"
    envia_mensagem "DEPLOY RODANDO, segunda instancia bloqueada... se tiver problemas delete /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt"
    exit
  else
    envia_mensagem "Instalando lock /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt"
    echo "Instalando lock /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt"
    echo "$1" >/opt/POCKETCLOUD/SCRIPTS/backend-lock.txt
  fi
}
remove_lock() {
  if [ -e /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt ]; then
    echo "Removendo lock /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt"
    envia_mensagem "Removendo lock /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt"
    rm -rf /opt/POCKETCLOUD/SCRIPTS/backend-lock.txt
  fi
}
apaga_diretorios() {
  echo "Apagando temp"
  envia_mensagem "Apagando temp $1"
  rm -rf /opt/POCKETCLOUD/TEMP/$1
  for f in /opt/POCKETCLOUD/BACKENDAPI/*; do
    if [ "$f" = "/opt/POCKETCLOUD/BACKENDAPI/$1" ]; then
      echo "Ignorando diretorio atual $1"
      envia_mensagem "Ignorando diretorio atual $1"
    else
      envia_mensagem "Apagando $f"
      echo "Apagando $f"
      rm -rf "$f"
    fi
  done
}
err_report() {
  envia_log

  n=0
  until [ "$n" -ge 900000 ]; do
    response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001163173913 -d text="Script de deploy falhou: Error na linha 99_installbackend.sh: $1 $2")
    if [ "${response}" -ge "200" ]; then
      break
    fi
    #command && break  # substitute your command here
    n=$((n + 1))
    sleep 1
  done
  remove_lock
  echo "Script de deploy falhou: Erro na linha $1 $2"
  exit
}
trap 'err_report $LINENO' ERR

THEDATE=$(date +%Y%m%d_%H%M%S)
verifica_lock $THEDATE
RUNNINGUSER=$(whoami)

NUMOFFOLDERS=$(find /opt/POCKETCLOUD/BACKENDAPI/* -maxdepth 0 -type d -print | wc -l)
if [ "$NUMOFFOLDERS" -ne 1 ]; then
  RUNNINGFOLDER="ERROR"
else
  RUNNINGFOLDER=$(basename /opt/POCKETCLOUD/BACKENDAPI/*)
fi

envia_mensagem "DEPLOY INICIADO  99_installbackend.sh %0A Commit trigger: $1 %0A From user $2 %0A Rodando como usuario: $RUNNINGUSER"

mkdir -p /opt/POCKETCLOUD/BACKENDAPI/
mkdir -p /opt/POCKETCLOUD/FRONTENDREACT/
mkdir -p /opt/POCKETCLOUD/SCRIPTS/
mkdir -p /opt/POCKETCLOUD/TEMP/
cd /opt/POCKETCLOUD/TEMP
mkdir "$THEDATE"
cd "$THEDATE"
envia_mensagem "Clonando repositorio"
git clone https://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@github.com/leopucci/pocketcloud.git --branch release_backend --single-branch
if [ $? -eq 0 ]; then
  envia_mensagem "Clone OK! Dando npm install"
  cd pocketcloud
  cp -r 4_website/pocketcloud/99_installfrontend.sh /opt/POCKETCLOUD/SCRIPTS/
  cd 1_server/
  cp -r 99_installbackend.sh /opt/POCKETCLOUD/SCRIPTS/
  cp -r 99_sendlog.sh /opt/POCKETCLOUD/SCRIPTS/
  chmod 755 /opt/POCKETCLOUD/SCRIPTS/99_installbackend.sh
  chmod 755 /opt/POCKETCLOUD/SCRIPTS/99_installfrontend.sh
  chmod 755 /opt/POCKETCLOUD/SCRIPTS/99_sendlog.sh
  cp -r /root/POCKETCLOUDCONF/envproducaoexpressapi ./.env

  mkdir -p /opt/POCKETCLOUD/BACKENDAPI/$THEDATE
  cp -R ./ /opt/POCKETCLOUD/BACKENDAPI/$THEDATE/
  cd /opt/POCKETCLOUD/BACKENDAPI/$THEDATE/
  rm -rf /opt/POCKETCLOUD/TEMP/$THEDATE
  npm install
  if [ $? -eq 0 ]; then
    envia_mensagem "Npm Install OK, agora vai baixar e reapontar "
    echo "NPM INSTALL OK, AGORA COPIAR E APONTAR"
    pm2 stop all || true
    sleep 1
    pm2 delete all || true
    sleep 1
    pm2 save --force
    pm2 reset all || true
    pm2 kill || true
    #rm -rf ~/.pm2
    envia_mensagem "Matando processos antigos"
    mata_processos
    sleep 1
    mata_processos
    sleep 1
    mata_processos
    mata_processos

    #pm2 reset all
    #echo ‘Calling pm2-runtime …’
    #pm2-runtime ecosystem.config.js --no-deamon --name MyApp

    #pm2 kill
    # sleep 1
    pm2 update || true
    envia_mensagem "instalando modulos de monitoramento"
    #pm2 install pm2-server-monit
    #pm2 install pm2-telegram-notification
    #pm2 set pm2-telegram-notification:bot_token 1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60
    #pm2 set pm2-telegram-notification:chat_id g-1001507578888
    #pm2 install leopucci/pm2-telegram-notify
    #pm2 set pm2-telegram-notify:telegram_url https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage
    #pm2 set pm2-telegram-notify:chat_id g-1001507578888
    pm2 start /opt/POCKETCLOUD/BACKENDAPI/$THEDATE/ecosystem.config.producao.json
    pm2 save --force
    envia_mensagem "Feito... Pm2 Esta no ar (?) Apagando diretorios antigos..."
    status_code=$(curl --retry 4 --retry-delay 1 --head --write-out %{http_code} --silent --output /dev/null https://api.pubshr.com/ping)
    if [[ "$status_code" -eq 200 ]]; then
      envia_mensagem "Verificando acesso http - pingou ok! $status_code"
      # Aqui eu consigo pegar o diretorio que tem no disco, verificar o status do pm2, se der merda consigo voltar o antigo
      apaga_diretorios $THEDATE
      pm2 save --force
      remove_lock
      envia_mensagem "Deploy terminado"

    else
      envia_mensagem "Falha na verificacao de acesso da api. Http Status code:  $status_code \n Ambiente fora do ar, necessaria intervençao manual"
      envia_mensagem "Voltando servidor pra pasta antiga....."
      pm2 stop PktCloudApiPRODUCAO || true
      pm2 delete PktCloudApiPRODUCAO
      sleep 1
      pm2 kill
      sleep 1
      pm2 save --force
      cd /opt/POCKETCLOUD/BACKENDAPI/$RUNNINGFOLDER
      pm2 start ecosystem.config.producao.json
      sleep 1
      pm2 save --force
      rm -rf /opt/POCKETCLOUD/BACKENDAPI/$THEDATE
      status_code2=$(curl --retry 4 --retry-delay 1 --head --write-out %{http_code} --silent --output /dev/null https://api.pubshr.com/ping)
      if [[ "$status_code" -eq 200 ]]; then
        envia_mensagem "Verificando acesso http - pingou ok! $status_code"
      else
        envia_mensagem "Falha na verificacao de acesso da api. Http Status code:  $status_code \n Ambiente fora do ar, necessaria intervençao manual"
        envia_mensagem "Eu tentei, voltei o backup, mesmo assim deu merda, necessaria intervencao manual"
        envia_log
      fi
      remove_lock
      envia_mensagem "Deploy terminado"

    fi

  else
    echo "Falha no build. NPM INSTALL FALHOU. Sistema ainda no ar com versao antiga."
    envia_mensagem "Falha no build. NPM INSTALL FALHOU. Sistema ainda no ar com versao antiga. "
    envia_log
  fi

else
  echo "Git clone falhou. Sistema ainda no ar com versao antiga."
  envia_mensagem "Git clone falhou. Sistema ainda no ar com versao antiga."
  envia_log
fi
#ERROESTRANHO
