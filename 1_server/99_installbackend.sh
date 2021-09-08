#!/bin/bash
THEDATE=$(date +%Y%m%d_%H%M%S)
RUNNINGUSER=$(whoami)
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
git clone https://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@github.com/leopucci/pocketcloud.git # --branch release_backend
if [ $? -eq 0 ]; then

    cd pocketcloud
    cp -r 4_website/pocketcloud/99_installfrontend.sh /opt/POCKETCLOUD/SCRIPTS/
    cd 1_server/
    cp -r 99_installbackend.sh /opt/POCKETCLOUD/SCRIPTS/
    chmod 755 /opt/POCKETCLOUD/SCRIPTS/99_installbackend.sh
    chmod 755 /opt/POCKETCLOUD/SCRIPTS/99_installfrontend.sh
    cp -r /root/POCKETCLOUDCONF/envproducaoexpressapi ./.env

    mkdir -p /opt/POCKETCLOUD/BACKENDAPI/$THEDATE
    cp -R ./ /opt/POCKETCLOUD/BACKENDAPI/$THEDATE/
    cd /opt/POCKETCLOUD/BACKENDAPI/$THEDATE/
    rm -rf /opt/POCKETCLOUD/TEMP/$THEDATE
    npm install
    if [ $? -eq 0 ]; then
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
        response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001163173913 -d text="FALHA NA EXECUCAO DO COMANDO GH GITHUB usuario: $RUNNINGUSER")
        if [ "${response}" -ge "200" ]; then
            break
        fi
        #command && break  # substitute your command here
        n=$((n + 1))
        sleep 1
    done
fi
