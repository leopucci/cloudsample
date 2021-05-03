const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const db = require('_helpers/db');
const https = require('https');
//const FB = require('fb');
const FBGraphAPI = require('fb-graph-api');
const fetch = require("node-fetch");
const AWS = require('aws-sdk');
module.exports = {
    createOrassociateFacebookAccount,
    authenticate,
    refreshToken,
    revokeToken,
    getAll,
    getById,
    getRefreshTokens
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getBucketName(email) {

    var name = email.substring(0, email.lastIndexOf("@"));
    var domain = email.substring(email.lastIndexOf("@") + 1);

    return 'pocketcloud-' + name + '-' + domain;
}
function createBucket(email) {

    var credentials = new AWS.SharedIniFileCredentials({ profile: 'b2' });
    AWS.config.credentials = credentials;
    var ep = new AWS.Endpoint('s3.us-west-000.backblazeb2.com');
    var s3 = new AWS.S3({ endpoint: ep });

    var bucketName = 'node-sdk-sample-';
    var keyName = 'hello_world.txt';

    s3.createBucket({ Bucket: bucketName, ObjectLockEnabledForBucket: true }, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.Location);
        }
      });

        // var params = { Bucket: bucketName, Key: keyName, Body: 'Hello World!' };
        // s3.putObject(params, function (err, data) {
        //     if (err)
        //         console.log(err)
        //     else
        //         console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
        // });
    


}
async function createOrassociateFacebookAccount({ deviceId,
    accessToken,
    expires,
    permissions,
    declinedPermissions,
    name,
    first_name,
    last_name,
    email,
    profileId,
    pictureUrl, ipAddress }) {




    const response = await fetch('https://graph.facebook.com/me?access_token=' + accessToken + '&fields=name,first_name,last_name,email,picture.type(large)');
    const data = await response.json();
    //Token invalido
    if (typeof data['id'] === 'undefined') {
        return {
            ErrorMsg: 'Error 195',
            ErrorCode: '195',
        };
    }
    console.dir(data);
    //Token bateu, mas o profile que mandou eh diferente do que foi verificado
    if (data.id != profileId) {
        return {
            ErrorMsg: 'Error 196',
            ErrorCode: '196',
        };

    }
    if (data.email != email) {
        return {
            ErrorMsg: 'Error 197',
            ErrorCode: '197',
        };

    }
    if (data.id == profileId && data.email == email) {
        console.log('Ids e e-mail bateu, vou procurar se existe conta' + data.id);

        let user = await db.User.findOne({ email: email });

        //Uma conta só ativa por email.. 
        //Se o cara trocar o email da conta dele no face, 
        //na hora que eu autenticar uma conta, eu desautentico a outra. 
        if (user != undefined) {
            console.log('Encontrada conta para ' + email + 'vamos associar a conta...');
            var cadastroFeito = false;
            //desativo todas as outras contas, e deixo só uma ativa. 

            const tamanho = user.facebookAccounts.length;
            for (var i = 0; i < tamanho; i++) {
                //            console.log('Loop:' + i)
                //Se tiver alguma ativa tenho que desativar la na sdk do face
                if (user.facebookAccounts[i].expired == false) {
                    console.log('Existe conta ativa, vou desativar o token');
                    // ESTA DANDO ESTE RETORNO
                    //{
                    //     message: '(#803) Some of the aliases you requested do not exist: logout',
                    //     type: 'OAuthException',
                    //     code: 803,
                    //     fbtrace_id: 'A3qA5epifjTqG5i0g27nJYw'
                    //   }
                    // await FB.api('logout', {
                    //     //client_id: 'app_id',
                    //     access_token: user.facebookAccounts[i].accessToken,
                    // }, function (res) {
                    //     if (!res || res.error) {
                    //         console.log(!res ? 'Erro fazendo logout do facebook' : res.error);
                    //         return;
                    //     }
                    //     console.log('FEito' + res);
                    // });
                    console.log('Funcao de desativaçao de conta executada');
                    user.facebookAccounts[i].expired = true;

                    //Se a conta ja existir dentro do usuario, vou só atualizar os dados. 

                    if (profileId == user.facebookAccounts[i].profileId) {
                        console.log('ja existe a conta do face, vou atualizar os dados');
                        user.facebookAccounts[i].profileId = profileId;
                        user.facebookAccounts[i].profileName = name;
                        user.facebookAccounts[i].profileFirstName = first_name;
                        user.facebookAccounts[i].profileLastName = last_name;
                        user.facebookAccounts[i].pictureUrl = pictureUrl;
                        user.facebookAccounts[i].accessToken = accessToken;
                        user.facebookAccounts[i].expires = expires;
                        user.facebookAccounts[i].authDate = Date.now();

                        user.facebookAccounts[i].expired = false;
                        cadastroFeito = true;
                    }

                }


                if (cadastroFeito == false) {
                    console.log('cadastro ainda nao foi feito.. fazendo..');
                    var novoCadastro = {
                        profileId: profileId,
                        profileName: name,
                        profileFirstName: first_name,
                        profileLastName: last_name,
                        pictureUrl: pictureUrl,
                        accessToken: accessToken,
                        expires: expires,
                        authDate: Date.now(),
                        bucket_name: getBucketName(email),
                    };
                    // await sleep(2000);
                    console.log('Vai dar o push');
                    user.facebookAccounts.push(novoCadastro);
                    console.log('FEz o push');
                }




            }
            console.log('Vai salvar...');
            user.save();
            console.log('Salvou');
        } else {
            console.log('Nao tem conta de email para ' + email + 'vamos criar uma');
            await createBucket(email);
            novoUsuario = new db.User();
            novoUsuario.email = email;
            novoUsuario.firstName = first_name;
            novoUsuario.lastName = last_name;

            var novoCadastroFb = {
                profileId: profileId,
                profileName: name,
                profileFirstName: first_name,
                profileLastName: last_name,
                pictureUrl: pictureUrl,
                accessToken: accessToken,
                expires: expires,
                authDate: Date.now(),
                bucket_name: getBucketName(email),
            };
            novoUsuario.facebookAccounts.push(novoCadastroFb);
            novoUsuario.save();
            user = novoUsuario;
        }

        // authentication successful so generate jwt and refresh tokens
        const jwtToken = generateJwtToken(user);
        const refreshToken = generateRefreshToken(user, ipAddress);
        console.log('refreshToken: ' + refreshToken.token);
        const refresh = refreshToken.token;
        // save refresh token
        await refreshToken.save();

        // return basic details and tokens
        return {
            ...basicDetails(user),
            email: email,
            jwtToken,
            refreshToken: refresh
        };
    }
    console.log('Caiu aqui');
    // const FB = new FBGraphAPI({
    //     clientID: '237674398093898',
    //     clientSecret: '4a496c3b9a503afaea59915051b10a87'
    //     //appAccessToken: '...' // Optional
    return {
        ErrorMsg: 'Error 288',
        ErrorCode: '288',
    };
    // });


    // FB.isValid(accessToken)
    //     .then(valid => {
    //         console.log('Token eh valido', valid); // true or false
    //     })
    //     .catch(e => console.log('e', e));


}

async function authenticate({ username, password, ipAddress }) {
    const user = await db.User.findOne({ username });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        throw 'Username or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const { user } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(user);

    // return basic details and tokens
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function getAll() {
    const users = await db.User.find();
    return users.map(x => basicDetails(x));
}

async function getById(id) {
    const user = await getUser(id);
    return basicDetails(user);
}

async function getRefreshTokens(userId) {
    // check that user exists
    await getUser(userId);

    // return refresh tokens for user
    const refreshTokens = await db.RefreshToken.find({ user: userId });
    return refreshTokens;
}

// helper functions

async function getUser(id) {
    if (!db.isValidId(id)) throw 'User not found';
    const user = await db.User.findById(id);
    if (!user) throw 'User not found';
    return user;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('user');
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function generateJwtToken(user) {
    // create a jwt token containing the user id that expires in 15 minutes
    return jwt.sign({ sub: user.id, id: user.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(user, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        user: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(user) {
    const { id, firstName, lastName, username, role } = user;
    return { id, firstName, lastName, username, role };
}

