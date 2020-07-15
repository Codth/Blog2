const CryptoJS = require('crypto-js');
module.exports = {


    encry: function (text) {
        var encrypted = CryptoJS.RC4.encrypt(text, "Secret Passphrase");
        return encrypted + "";
    },

    decry: function (cipher) {
        var decrypted = CryptoJS.RC4.decrypt(cipher, "Secret Passphrase");
        return decrypted.toString(CryptoJS.enc.Utf8);
    }


};