#!/bin/bash
err_report() {
    n=0
    until [ "$n" -ge 900000 ]; do
        response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001163173913 -d text="Script de deploy falhou: Error na linha 99_reactdeploy.sh: $1")
        if [ "${response}" -ge "200" ]; then
            break
        fi
        #command && break  # substitute your command here
        n=$((n + 1))
        sleep 1
    done

    echo "Error on line $1"
    exit
}
trap 'err_report $LINENO' ERR

THEDATE=$(date +%Y%m%d_%H%M%S)

n=0
until [ "$n" -ge 900000 ]; do
    response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001163173913 -d text="DEPLOY INICIADO installapi.sh $THEDATE")
    if [ "${response}" -ge "200" ]; then
        break
    fi
    #command && break  # substitute your command here
    n=$((n + 1))
    sleep 1
done
mkdir -p /opt/POCKETCLOUD/BACKENDAPI/
mkdir -p /opt/POCKETCLOUD/FRONTENDREACT/
mkdir -p /opt/POCKETCLOUD/SCRIPTS/
mkdir -p /opt/POCKETCLOUD/TEMP/
cd /opt/POCKETCLOUD/TEMP
mkdir $THEDATE
cd $THEDATE
gh repo clone pocketcloud
if [ $? -eq 0 ]; then

    cd pocketcloud
    cd 1_server/
    cp -r 99_installapi.sh /opt/POCKETCLOUD/SCRIPTS/
    chmod 755 /opt/POCKETCLOUD/SCRIPTS/99_installapi.sh
    cp -r /root/POCKETCLOUDCONF/envproducaoexpressapi ./.env

    mkdir -p /opt/POCKETCLOUD/BACKENDAPI/$THEDATE
    cp -R ./ /opt/POCKETCLOUD/BACKENDAPI/$THEDATE/
    cd /opt/POCKETCLOUD/BACKENDAPI/$THEDATE/
    rm -rf /opt/POCKETCLOUD/TEMP/$THEDATE
    npm install
    if [ $? -eq 0 ]; then
        echo "NPM INSTALL OK, AGORA COPIAR E APONTAR"
        pm2 install pm2-server-monit
        pm2 install pm2-telegram-notification
        pm2 set pm2-telegram-notification:bot_token 1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60
        pm2 set pm2-telegram-notification:chat_id g-1001163173913
        pm2 delete PktCloudApiPRODUCAO &
        pm2 save
        pm2 start ecosystem.config.producao.json
        pm2 save
        $(find /opt/POCKETCLOUD/BACKENDAPI/* ! -name $THEDATE -maxdepth 0 -type d -exec rm -rf {} +)

        n=0
        until [ "$n" -ge 900000 ]; do
            response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001163173913 -d text="Deploy terminado")
            if [ "${response}" -ge "200" ]; then
                break
            fi
            #command && break  # substitute your command here
            n=$((n + 1))
            sleep 1
        done
    else
        echo "BUILD FALHOU"
        n=0
        until [ "$n" -ge 900000 ]; do
            response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001163173913 -d text="BUILD FALHOU NO SERVER Deploy nao foi feito")
            if [ "${response}" -ge "200" ]; then
                break
            fi
            #command && break  # substitute your command here
            n=$((n + 1))
            sleep 1
        done
    fi

else
    n=0
    until [ "$n" -ge 900000 ]; do
        response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001163173913 -d text="FALHA NA EXECUCAO DO COMANDO GH GITHUB")
        if [ "${response}" -ge "200" ]; then
            break
        fi
        #command && break  # substitute your command here
        n=$((n + 1))
        sleep 1
    done
fi
