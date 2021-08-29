#!/bin/bash
err_report() {

    datahoravoltou=$(date +"%d-%m-%y %H:%M:%S")

    n=0
    until [ "$n" -ge 900000 ]; do
        response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001177781241 -d text="Script de deploy falhou: Error na linha 99_reactdeploy.sh: $1 Conectou $datahoravoltou%0AIp: $iface_addr")
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

cd /opt/reactbuildtempa
rm -rf pocketcloud
gh repo clone pocketcloud
cd pocketcloud
cd 4_website/
cd pocketcloud
cp /root/POCKETCLOUDCONF/envproducaoreactsite ./.env
npm install
npm run build
if [ $? -eq 0 ]; then
    echo "BUILD OK AGORA VAI COPIAR"
    THEDATE=$(date +%Y%m%d_%H%M%S)
    mkdir /opt/nginxroot/htmlpubshr/$THEDATE
    cp -R build/* /opt/nginxroot/htmlpubshr/$THEDATE
    rm -f /opt/nginxroot/htmlpubshr/locationdinamico
    ln -sf /opt/nginxroot/htmlpubshr/$THEDATE /opt/nginxroot/htmlpubshr/locationdinamico
    service nginx reload
    $(find /opt/nginxroot/htmlpubshr/* ! -name $THEDATE -maxdepth 0 -type d -exec rm -rf {} +)

else
    echo "BUILD FALHOU"
fi
