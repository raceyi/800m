var express = require('express');
var router = express.Router();
let crypto = require('crypto');
const CryptoJS = require('crypto-js');
var mongo = require("./mongo");
var serverResponse = require("./response");
var util=require("./util.js");
let config = require('../config');

function validityCheck(email,phone){
    console.log("come validityCheck function");
	  var emailPat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var emailCheck = false;

    // 1. email validity check
    //
    if(emailPat.test(email)){
        return true;
    }else{
        return false;
    }
}

router.signup=function(req,res){
  console.log("signup-req.body:"+JSON.stringify(req.body));
   
	if(validityCheck(req.body.email,req.body.phone)){
		  console.log("email is valid");
      let encryptedUser= util.encryptObj(req.body);
      // salt and password
        let salt = crypto.randomBytes(16).toString('hex');
        secretPassword = crypto.createHash('sha256').update(req.body.password + salt).digest('hex');
        encryptedUser.password=secretPassword;
        encryptedUser.salt=salt;
      mongo.addUser(encryptedUser).then((result)=>{
          console.log("session.uid:"+req.session.uid);
          req.session.uid=result._id;
					let response = new serverResponse.SuccResponse();
          res.send(JSON.stringify(response));
      },err=>{
          let response = new response.FailResponse(err);
          res.send(JSON.stringify(response));
      });
  }
}

router.login=function(req,res){
  console.log("login-req.body:"+JSON.stringify(req.body));
  let encryptedUser= util.encryptObj(req.body);
  mongo.findUser(encryptedUser).then((result)=>{
        let userInfo=result[0];
        util.decryptObj(userInfo);
        let secretPassword = crypto.createHash('sha256').update(req.body.password + userInfo.salt).digest('hex');
        if (secretPassword === userInfo.password) {
            req.session.uid=result[0]._id;
            console.log("uid:"+result[0]._id);
            let response = new serverResponse.SuccResponse();
            res.send(JSON.stringify(response));            
        }else{
            let response = new response.FailResponse("invalidUserInfo");
            res.send(JSON.stringify(response));          
        }
  },err=>{
      let response = new response.FailResponse(err);
      res.send(JSON.stringify(response));
  })

}

router.searchConsultant=function(req,res){
  mongo.findConsultantWithIDNumber(req.body.IDNumber).then((result)=>{
            let response = new serverResponse.SuccResponse();
            response.consult=result[0];
            res.send(JSON.stringify(response));            
  },err=>{
      let response = new response.FailResponse("NotFound");
      res.send(JSON.stringify(response));
  })
}

router.getUserInfo=function(req,res){
  console.log("getUserInfo "+JSON.stringify(req.body));

  let response = new serverResponse.Response("success");
  response.userPhone = CryptoJS.AES.decrypt(decodeURI(req.body.userPhone),config.tomcat.uPhonePwd).toString(CryptoJS.enc.Utf8);
  response.userName = CryptoJS.AES.decrypt(decodeURI(req.body.userName),config.tomcat.uNamePwd).toString(CryptoJS.enc.Utf8);
  response.userSex = CryptoJS.AES.decrypt(decodeURI(req.body.userSex),config.tomcat.uSexPwd).toString(CryptoJS.enc.Utf8);
  response.userAge = CryptoJS.AES.decrypt(decodeURI(req.body.userAge),config.tomcat.uAgePwd).toString(CryptoJS.enc.Utf8);
  console.log("response:"+JSON.stringify(response));
  res.send(JSON.stringify(response));
}

/*
mongo.addUser( { email: "kalen985@takib.biz", password: "111Highway 37",salt:"test", phone:"010",name:"이경주",birth:"19750111",sex:"F"}).then((res)=>{
  console.log("res:"+res);
},err=>{
  console.log("err:"+err);

});
*/

module.exports = router;
