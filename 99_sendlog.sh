#!/bin/bash
envia_mensagem() {
    if [ $1 -eq 1 ]; then
        n=0
        until [ "$n" -ge 900000 ]; do
            response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendDocument -F chat_id=-1001163173913 -F document=@"/opt/POCKETCLOUD/SCRIPTS/DeployLog.txt" -F caption="")

            if [ "${response}" -ge "200" ]; then
                break
            fi
            #command && break  # substitute your command here
            n=$((n + 1))
            sleep 1
        done
    else
        n=0
        until [ "$n" -ge 900000 ]; do
            response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendDocument -F chat_id=-1001177781241 -F document=@"/opt/POCKETCLOUD/SCRIPTS/DeployLog.txt" -F caption="")
            if [ "${response}" -ge "200" ]; then
                break
            fi
            #command && break  # substitute your command here
            n=$((n + 1))
            sleep 1
        done
    fi
}

rm -rf /opt/POCKETCLOUD/SCRIPTS/DeployLog.txt
sleep 4
tail -n 40 /opt/POCKETCLOUD/SCRIPTS/hooksout.log >>/opt/POCKETCLOUD/SCRIPTS/DeployLog.txt
envia_mensagem $1
sleep 2
rm -rf /opt/POCKETCLOUD/SCRIPTS/DeployLog.txt
