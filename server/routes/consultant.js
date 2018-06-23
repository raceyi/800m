var express = require('express');
var router = express.Router();
let crypto = require('crypto');
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
      mongo.addConsultant(encryptedUser).then((res)=>{
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
  mongo.findConsultant(req.body).then((result)=>{
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

mongo.addConsultant( { email: "kalen02101@takib.biz", password: "111Highway 37",salt:"test", phone:"010",name:"이경주",birth:"19750111",sex:"F"}).then((res)=>{
  console.log("res:"+res);
},err=>{
  console.log("err:"+err);

});

module.exports = router;
