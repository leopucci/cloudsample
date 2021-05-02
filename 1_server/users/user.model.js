const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    email: { type: String, unique: true, required: true },
    enabled: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    lastUpdated: { type: Date },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    passwordHash: { type: String, required: false },
    facebookAccounts: [{
        profileId: String,
        profileName: String,
        profileFirstName: String,
        profileLastName: String,
        pictureUrl: String,
        accessToken: String,
        expires: { type: Date },
        authDate: { type: Date, default: Date.now },
        expired: { type: Boolean, default: false }
    }],
    devices: [{ deviceId: String, deviceName: String }],
    role: { type: String,  default: 'User' }
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.passwordHash;
    }
});

module.exports = mongoose.model('User', schema);
