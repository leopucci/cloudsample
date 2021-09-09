#!/bin/bash
envia_mensagem() {
    n=0
    until [ "$n" -ge 900000 ]; do
        response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001177781241 -d text="$1")
        if [ "${response}" -ge "200" ]; then
            break
        fi
        #command && break  # substitute your command here
        n=$((n + 1))
        sleep 1
    done
}
err_report() {

    datahoravoltou=$(date +"%d-%m-%y %H:%M:%S")

    n=0
    until [ "$n" -ge 900000 ]; do
        response=$(curl --write-out '%{http_code}' --silent --output /dev/null https://api.telegram.org/bot1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60/sendMessage -d chat_id=-1001177781241 -d text="Script de deploy falhou: Error na linha 99_expressapideploy.sh: $1 $2")
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
RUNNINGFOLDER=$(basename /opt/nginxroot/htmlpubshr/*)

envia_mensagem "DEPLOY INICIADO 99_installfrontend.sh \n Commit trigger: $1 \n From user $2"

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
    cd 4_website/
    cd pocketcloud
    cp /root/POCKETCLOUDCONF/envproducaoreactsite ./.env
    npm install
    if [ $? -eq 0 ]; then
        envia_mensagem 'Npm Install OK, agora vai buildar'
        npm run build
        if [ $? -eq 0 ]; then
            envia_mensagem "BUILD OK AGORA VAI COPIAR"
            mkdir /opt/nginxroot/htmlpubshr/$THEDATE
            cp -R build/* /opt/nginxroot/htmlpubshr/$THEDATE
            rm -f /opt/nginxroot/htmlpubshr/locationdinamico
            ln -sf /opt/nginxroot/htmlpubshr/$THEDATE /opt/nginxroot/htmlpubshr/locationdinamico
            service nginx reload
            envia_mensagem 'Feito... Esta no ar (?) Apagando diretorios antigos...'
            status_code=$(curl --head --write-out %{http_code} --silent --output /dev/null https://www.pubshr.com/)
            if [[ "$status_code" -eq 200 ]]; then
                envia_mensagem "Verificando acesso http - pingou ok! $status_code"
                # Aqui eu consigo pegar o diretorio que tem no disco, verificar o status do pm2, se der merda consigo voltar o antigo
                $(find /opt/nginxroot/htmlpubshr/* ! -name $THEDATE -maxdepth 0 -type d -exec rm -rf {} +)
                envia_mensagem 'Deploy terminado'
            else
                envia_mensagem "Falha na verificacao de acesso do Frontend. Http Status code:  $status_code \n Ambiente fora do ar, necessaria intervençao manual"
                envia_mensagem 'Voltando servidor pra pasta antiga...'
                cd /opt/nginxroot/htmlpubshr/$RUNNINGFOLDER
                rm -f /opt/nginxroot/htmlpubshr/locationdinamico
                ln -sf /opt/nginxroot/htmlpubshr/$RUNNINGFOLDER /opt/nginxroot/htmlpubshr/locationdinamico
                service nginx reload
                rm -rf /opt/nginxroot/htmlpubshr/$THEDATE
                status_code2=$(curl --head --write-out %{http_code} --silent --output /dev/null https://www.pubshr.com/)
                if [[ "$status_code" -eq 200 ]]; then
                    envia_mensagem "Verificando acesso http - pingou ok! $status_code"
                else
                    envia_mensagem "Falha na verificacao de acesso do FrontEnd. Http Status code:  $status_code \n Ambiente fora do ar, necessaria intervençao manual"
                    envia_mensagem 'Eu tentei, voltei o backup, mesmo assim deu merda, necessaria intervencao manual'
                fi
                envia_mensagem 'Deploy terminado'
            fi
        else
            envia_mensagem 'Falha no build. NPM BUILD FALHOU. Sistema ainda no ar com versao antiga. '
        fi
    else
        envia_mensagem 'NPM Install FALHOU. Sistema ainda no ar com versao antiga. '
    fi
else
    echo "Git clone falhou. Sistema ainda no ar com versao antiga."
    envia_mensagem 'Git clone falhou. Sistema ainda no ar com versao antiga.'
fi
