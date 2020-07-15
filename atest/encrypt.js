const CryptoJS = require('crypto-js');



// const encry = encryptWithCryptoJS('holy fuck is fuck');
// console.log(encry);
//
//
// const decry = decryptionWithCryptoJS(encry);
// console.log(decry);

function encryptWithCryptoJS(plainText) {
    const key = CryptoJS.enc.Utf8.parse("hf8685nfhfhjs9h8");
    const iv1 = CryptoJS.enc.Utf8.parse("hf8685nfhfhjs9h8");
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
        keySize: 16,
        iv: iv1,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return encrypted + "";
}

function decryptionWithCryptoJS(cipher) {
    const key = CryptoJS.enc.Utf8.parse("hf8685nfhfhjs9h8");
    const iv1 = CryptoJS.enc.Utf8.parse("hf8685nfhfhjs9h8");
    const plainText = CryptoJS.AES.decrypt(cipher, key, {
        keySize: 16,
        iv: iv1,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return plainText.toString(CryptoJS.enc.Utf8);
}









function encry2(text){
    var encrypted = CryptoJS.RC4.encrypt(text, "Secret Passphrase");
    return encrypted + "";
}

function decry2(cipher){
    var decrypted = CryptoJS.RC4.decrypt(cipher, "Secret Passphrase");
    return decrypted.toString(CryptoJS.enc.Utf8);
}

const c2 = encry2('shit is shit');
console.log(c2);

const c3 = decry2(c2);
console.log(c3);

