const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register/facebook', authenticateFacebookSchema, registerNewFacebookCustomer);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.get('/:id/refresh-tokens', authorize(), getRefreshTokens);

module.exports = router;


function registerNewFacebookCustomer(req, res, next) {
    console.log('registerNewFacebookCustomer');
    var contype = req.headers['content-type'];
    console.log(contype);
    console.dir(req.body);
    //     deviceId: 'cb76f222f47582ee',
    //   accessToken: 'EAADYKeISEkoBAIAqPchRQSlLGONP4BRfhID7hERExtluTgomZAX5CWJZBLEXZCRnO1hZC7aAnd4Fc9DBXolXHl3ZAWrGfDm7Yd9UCcd3FiX6xT96E2Cbjjp5J4ndRRkYEeiuInpM3viQeGyZBvda4PZBreSOg2f5gvkQULfByB214uQlJc6LIEghMIkYId0i4YDZARJhZCZAbxAgZDZD',
    //   expires: '2021-06-27T17:48:06.162Z',
    //   permissions: [ 'public_profile', 'email' ],
    //   declinedPermissions: [],
    //   name: 'Leonardo Pucci',
    //   first_name: 'Leonardo',
    //   last_name: 'Pucci',
    //   email: 'leopucci@gmail.com',
    //   profileId: '4060744103947236',
    //   pictureUrl: 'https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=4060744103947236&height=200&width=200&ext=1622307771&hash=AeR0IU8u-DayXbJdpUo'
    const { deviceId,
        accessToken,
        expires,
        permissions,
        declinedPermissions,
        name,
        first_name,
        last_name,
        email,
        profileId,
        pictureUrl, } = req.body;

    const ipAddress = req.ip;
    //busco uma conta que ja tenha um e-mail. 
    //associo o id do face praquela conta. 
    //
    userService.createOrassociateFacebookAccount({
        deviceId,
        accessToken,
        expires,
        permissions,
        declinedPermissions,
        name,
        first_name,
        last_name,
        email,
        profileId,
        pictureUrl,
        ipAddress
    })
        .then(({ ...user }) => {
            if (typeof user.ErrorMsg === 'undefined') {
                //setTokenCookie(res, refreshToken);
                res.json(user);
            } else {
                res.status(415);
                res.send(user.ErrorMsg);
            }


        })
        .catch(next)
}

function authenticateFacebookSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        deviceId: Joi.string().required(),
        deviceModel: Joi.string().required(),
        accessToken: Joi.string().required(),
        expires: Joi.string().required(),
        name: Joi.string().required(),
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        profileId: Joi.string().required(),

    });
    validateRequest(req, next, schema);
}

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    const { username, password } = req.body;
    const ipAddress = req.ip;
    userService.authenticate({ username, password, ipAddress })
        .then(({ refreshToken, ...user }) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    userService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...user }) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getById(req, res, next) {
    // regular users can get their own record and admins can get any record
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(next);
}

function getRefreshTokens(req, res, next) {
    // users can get their own refresh tokens and admins can get any user's refresh tokens
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.getRefreshTokens(req.params.id)
        .then(tokens => tokens ? res.json(tokens) : res.sendStatus(404))
        .catch(next);
}

// helper functions

function setTokenCookie(res, token) {
    // create http only cookie with refresh token that expires in 7 days
    console.log('Fez o tal token cookie');
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}