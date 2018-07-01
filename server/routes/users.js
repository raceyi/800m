var express = require('express');
var router = express.Router();
let crypto = require('crypto');
const CryptoJS = require('crypto-js');
var mongo = require("./mongo");
var serverResponse = require("./response");
var util=require("./util.js");
let config = require('../config');
var notification=require("./notification");

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
          //console.log("session.uid:"+req.session.uid);
          req.session.uid=result._id;
		  let response = new serverResponse.SuccResponse();
          res.send(JSON.stringify(response));
      },err=>{
          let response = new serverResponse.FailResponse(err);
          res.send(JSON.stringify(response));
      });
  }
}

router.login=function(req,res){
  console.log("login-req.body:"+JSON.stringify(req.body));
  let encryptedUser= util.encryptObj(req.body);
  mongo.findUser(encryptedUser).then((result)=>{
      console.log("result.length:"+result.length);
      if(result.length==0){
            let response = new serverResponse.FailResponse("invalidUserInfo");
            res.send(JSON.stringify(response));          
      }else{
        let userInfo=result[0];
        util.decryptObj(userInfo);
        let secretPassword = crypto.createHash('sha256').update(req.body.password + userInfo.salt).digest('hex');
        if (secretPassword === userInfo.password) {
            req.session.uid=result[0]._id;
            console.log("uid:"+result[0]._id);
            // 보험 납부 정보를 검색하여 전달한다.
            //console.log("userInfo.insurances:"+userInfo.insurances);
            mongo.findInsurancePayments(userInfo.insurances).then((payment)=>{
                console.log("payment:"+JSON.stringify(payment));
                // 설계사 정보를 검색하여 전달한다.
                mongo.findConsultantWithIDNumber(userInfo.consultantId).then((consultantInfo)=>{
                    let response = new serverResponse.SuccResponse();
                    if(consultantInfo.length>0){
                        util.decryptObj(consultantInfo[0]);
                        console.log("consultantInfo:"+JSON.stringify(consultantInfo[0]));
                        req.session.cid=consultantInfo[0]._id;
                        let consultant={name: consultantInfo[0].name,email:consultantInfo[0].email,phone:consultantInfo[0].phone};
                        response.consultant=consultant;
                    }
                    response.userInfo=userInfo;
                    response.payment=payment;
                    console.log("response:"+JSON.stringify(response));
                    res.send(JSON.stringify(response));            
                },err=>{
                    let response = new serverResponse.FailResponse(err);
                    res.send(JSON.stringify(response));
                })
            },err=>{
                let response = new serverResponse.FailResponse(err);
                res.send(JSON.stringify(response));          
            })
        }else{
            let response = new serverResponse.FailResponse("invalidUserInfo");
            res.send(JSON.stringify(response));          
        }
      }
  },err=>{
      let response = new response.FailResponse(err);
      res.send(JSON.stringify(response));
  })

}

router.searchConsultant=function(req,res){
  mongo.findConsultantWithIDNumber(req.body.IDNumber).then((result)=>{
            let response = new serverResponse.SuccResponse();
            let consultantInfo=result[0];
             util.decryptObj(consultantInfo);
            response.consultant=consultantInfo;
            console.log("response.consultant:"+JSON.stringify(response.consultant));
            res.send(JSON.stringify(response));            
  },err=>{
      let response = new serverResponse.FailResponse("NotFound");
      res.send(JSON.stringify(response));
  })
}

router.registerConsultant=function(req,res){


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

router.registerConsultant=function(req,res){
    console.log("registerConsultant:"+JSON.stringify(req.body));
    mongo.registerConsultant(req.body.consultantId,req.session.uid).then(result=>{
        console.log("registerConsultant:"+JSON.stringify(result));
        req.session.cid=result._id;
        let response = new serverResponse.Response("success");
        res.send(JSON.stringify(response));
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    })
}

router.registrationId=function(req,res){
    console.log("registrationId:"+JSON.stringify(req.body));
    mongo.registrationId(req.body,req.session.uid).then(result=>{
        let response = new serverResponse.Response("success");
        res.send(JSON.stringify(response));
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    })
}

router.createNewChat=function(req,res){
    mongo.createNewChat(req.body.type,req.session.uid,req.session.cid).then(chatInfo=>{
        let msg={time:chatInfo.date, type:"action",action:"response",message:req.body.type+"상담문의"};
        notification.sendToConsultant(msg,req.session.cid).then((notifyRes)=>{
            let response = new serverResponse.Response("success");
            response.chatId=chatInfo._id;
            res.send(JSON.stringify(response));
        },err=>{
            let response = new serverResponse.FailResponse(err);
            res.send(JSON.stringify(response));
        }) 
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    })
}

router.terminateChat=function(req,res){
    mongo.terminateChat(req.body.chatId).then((result)=>{
        let msg={time:chatInfo.date, type:"action",action:"exit",message:"상담종료"};
        notification.sendToConsultant(msg,req.session.cid).then((notifyRes)=>{
            let response = new serverResponse.Response("success");
            res.send(JSON.stringify(response));
        },err=>{
            let response = new serverResponse.FailResponse(err);
            res.send(JSON.stringify(response));
        }) 
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));        
    })
}

router.saveChatMsg=function(req,res){
   // 1.DB에 저장하고 
   // 2.consultant의 token검색하여 consultant에게 전달한다. 
      
}

/*
mongo.addUser( { email: "kalen985@takib.biz", password: "111Highway 37",salt:"test", phone:"010",name:"이경주",birth:"19750111",sex:"F"}).then((res)=>{
  console.log("res:"+res);
},err=>{
  console.log("err:"+err);

});
*/

module.exports = router;
