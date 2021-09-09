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

err_report() {
    nohup /opt/POCKETCLOUD/SCRIPTS/99_sendlog.sh 1 &
    datahoravoltou=$(date +"%d-%m-%y %H:%M:%S")

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

    echo "Error on  line $1 $2"
    exit
}
trap 'err_report $LINENO' ERR

THEDATE=$(date +%Y%m%d_%H%M%S)
RUNNINGUSER=$(whoami)
RUNNINGFOLDER=$(basename /opt/POCKETCLOUD/BACKENDAPI/*)

envia_mensagem "DEPLOY INICIADO  99_installbackend.sh %0A Commit trigger: $1 %0A From user $2 %0A Rodando como usuario: $RUNNINGUSER"

mkdir -p /opt/POCKETCLOUD/BACKENDAPI/
mkdir -p /opt/POCKETCLOUD/FRONTENDREACT/
mkdir -p /opt/POCKETCLOUD/SCRIPTS/
mkdir -p /opt/POCKETCLOUD/TEMP/
cd /opt/POCKETCLOUD/TEMP
mkdir $THEDATE
cd $THEDATE
envia_mensagem 'Clonando repositorio'
git clone https://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@github.com/leopucci/pocketcloud.git # --branch release_backend
if [ $? -eq 0 ]; then
    envia_mensagem 'Clone OK! Dando npm install'
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
        envia_mensagem 'Npm Install OK, agora vai baixar e reapontar '
        echo "NPM INSTALL OK, AGORA COPIAR E APONTAR"
        #pm2 install pm2-server-monit
        #pm2 install pm2-telegram-notification
        #pm2 set pm2-telegram-notification:bot_token 1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60
        #pm2 set pm2-telegram-notification:chat_id g-1001507578888
        ##pm2 install leopucci/pm2-telegram-notify
        #pm2 set pm2-telegram-notify:telegram_url https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage
        #pm2 set pm2-telegram-notify:chat_id g-1001507578888
        pm2 delete PktCloudApiPRODUCAO &
        sleep 1
        pm2 save
        pm2 start ecosystem.config.producao.json
        pm2 save
        envia_mensagem 'Feito... Pm2 Esta no ar (?) Apagando diretorios antigos...'
        status_code=$(curl --head --write-out %{http_code} --silent --output /dev/null https://api.pubshr.com/ping)
        if [[ "$status_code" -eq 200 ]]; then
            envia_mensagem "Verificando acesso http - pingou ok! $status_code"
            # Aqui eu consigo pegar o diretorio que tem no disco, verificar o status do pm2, se der merda consigo voltar o antigo
            $(find /opt/POCKETCLOUD/BACKENDAPI/* ! -name $THEDATE -maxdepth 0 -type d -exec rm -rf {} +)
            envia_mensagem 'Deploy terminado'
        else
            envia_mensagem "Falha na verificacao de acesso da api. Http Status code:  $status_code \n Ambiente fora do ar, necessaria intervençao manual"
            envia_mensagem 'Voltando servidor pra pasta antiga.....'
            pm2 delete PktCloudApiPRODUCAO &
            sleep 1
            pm2 save
            cd /opt/POCKETCLOUD/BACKENDAPI/$RUNNINGFOLDER
            pm2 start ecosystem.config.producao.json
            pm2 save
            rm -rf /opt/POCKETCLOUD/BACKENDAPI/$THEDATE
            status_code2=$(curl --head --write-out %{http_code} --silent --output /dev/null https://api.pubshr.com/ping)
            if [[ "$status_code" -eq 200 ]]; then
                envia_mensagem "Verificando acesso http - pingou ok! $status_code"
            else
                envia_mensagem "Falha na verificacao de acesso da api. Http Status code:  $status_code \n Ambiente fora do ar, necessaria intervençao manual"
                envia_mensagem 'Eu tentei, voltei o backup, mesmo assim deu merda, necessaria intervencao manual'
            fi
            envia_mensagem 'Deploy terminado'
        fi

    else
        echo "Falha no build. NPM INSTALL FALHOU. Sistema ainda no ar com versao antiga."
        envia_mensagem 'Falha no build. NPM INSTALL FALHOU. Sistema ainda no ar com versao antiga. '
    fi

else
    echo "Git clone falhou. Sistema ainda no ar com versao antiga."
    envia_mensagem 'Git clone falhou. Sistema ainda no ar com versao antiga.'
fi
