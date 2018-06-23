var express = require('express');
var router = express.Router();
let crypto = require('crypto');
const CryptoJS = require('crypto-js');
var mongo = require("./mongo");
var response = require("./response");
var util=require("./util.js");

router.signup=function(req,res){
  console.log("signup-req.body:"+JSON.stringify(req.body));
   
	if(validityCheck(req.body.email,req.body.phone)){
		  console.log("email and phone is valid");
      let encryptedUser= util.encryptObj(req.body);
      // salt and password
        let salt = crypto.randomBytes(16).toString('hex');
        secretPassword = crypto.createHash('sha256').update(req.body.password + salt).digest('hex');
        encryptedUser.password=secretPassword;
      mongo.addUser(encryptedUser).then((res)=>{
          console.log("session.uid:"+session.uid);
          req.session.uid=result;
					let response = new response.SuccResponse();
          res.send(JSON.stringify(response));
      },err=>{
          let response = new response.FailResponse(err);
          res.send(JSON.stringify(response));
      });
  }
}

router.login=function(req,res){
  console.log("login-req.body:"+JSON.stringify(req.body));
  mongo.findUser(req.body).then((result)=>{
        let userInfo=result[0];
        let secretPassword = crypto.createHash('sha256').update(req.body.password + userInfo.salt).digest('hex');
        if (secretPassword === userInfo.password) {
            req.session.uid=result[0]._id;
            let response = new response.SuccResponse();
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
            let response = new response.SuccResponse();
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
