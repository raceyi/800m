var express = require('express');
var router = express.Router();
let crypto = require('crypto');
let config = require('../config');

router.encryption=function(data, pwd) {
    var cipher = crypto.createCipher('aes256', pwd);
    var secretData = cipher.update(data, 'utf8', 'hex');
    secretData += cipher.final('hex');

    return secretData;
}

router.decryption=function(secretData, pwd) {
    var decipher = crypto.createDecipher('aes256', pwd);
    var data = decipher.update(secretData, 'hex', 'utf8');
    data += decipher.final('utf8');

    return data;
}

router.decryptObj=function(obj) {
    if (obj.hasOwnProperty('name') && obj.name !== null) {
        obj.name = router.decryption(obj.name, config.namePwd);
    }

    if (obj.hasOwnProperty('email') && obj.email !== null) {
        obj.email = router.decryption(obj.email, config.emailPwd);
    }

    if (obj.hasOwnProperty('phone') && obj.phone !== null) {
        obj.phone = router.decryption(obj.phone, config.phonePwd);
    }

    if (obj.hasOwnProperty('birth') && obj.birth !== null) {
        obj.birth = router.decryption(obj.birth, config.birthPwd);
    }
}

router.encryptObj=function(obj){
    if (obj.hasOwnProperty('name') && obj.name !== null) {
        obj.name = router.encryption(obj.name, config.namePwd);
    }

    if (obj.hasOwnProperty('email') && obj.email !== null) {
        obj.email = router.encryption(obj.email, config.emailPwd);
    }

    if (obj.hasOwnProperty('phone') && obj.phone !== null) {
        obj.phone = router.encryption(obj.phone, config.phonePwd);
    }

    if (obj.hasOwnProperty('birth') && obj.birth !== null) {
        obj.birth = router.encryption(obj.birth, config.birthPwd);
    }
    return obj;
}


router.validityCheck=function (email,phone){
    console.log("come validityCheck function");
	  var emailPat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var emailCheck = false;

    // 1. email validity check
    //
    if(emailPat.test(email)){
        emailCheck=true;
    }

    var phonePat = /\d{10,}/;
    var phoneCheck = false;

    // 2. phone validity check
    if(phonePat.test(phone)){
    	phoneCheck=true;
    }

    // 3. email과 phone 모두 유효성 확인되면 true return
    if(emailCheck & phoneCheck){
        return true;
    }else{
        return false;
    }
}

module.exports = router;
