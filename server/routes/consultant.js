var express = require('express');
var router = express.Router();
let crypto = require('crypto');
var mongo = require("./mongo");
var response = require("./response");
var util=require("./util.js");
var serverResponse = require("./response");
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
      mongo.addConsultant(encryptedUser).then((result)=>{
          console.log("session.uid:"+req.session.uid);
          req.session.uid=result.id;
					let response = new serverResponse.SuccResponse();
          response.consultantId=result.IDNumber;
          res.send(JSON.stringify(response));
      },err=>{
          let response = new serverResponse.FailResponse(err);
          res.send(JSON.stringify(response));
      });
  }
}

router.login=function(req,res){
  console.log("consultant/login-req.body:"+JSON.stringify(req.body));
  let consultant=req.body;
  let encryptedUser= util.encryptObj(consultant);
  mongo.consultantLogin(encryptedUser).then((result)=>{        
        let secretPassword = crypto.createHash('sha256').update(req.body.password + result.consultant.salt).digest('hex');
        if (secretPassword === result.consultant.password) {
            req.session.uid=result.consultant._id;
            console.log("uid:"+result.consultant._id);
            let response = new serverResponse.SuccResponse();
            response.userInfo=result;
            res.send(JSON.stringify(response));            
        }else{
            let response = new serverResponse.FailResponse("invalidUserInfo");
            res.send(JSON.stringify(response));          
        }
  },err=>{
      let response = new serverResponse.FailResponse(err);
      res.send(JSON.stringify(response));
  })
}

router.getChats=function(req,res){
    mongo.getConsultantChats(req.session.uid).then((result)=>{  
            let response = new serverResponse.SuccResponse();
            response.chats=result;
            res.send(JSON.stringify(response));     
    },err=>{
          let response = new serverResponse.FailResponse(err);
          res.send(JSON.stringify(response));
    });
}

router.getChat=function(req,res){
    console.log("chatId:"+req.body.chatId);
    mongo.findChatWithId(req.body.chatId).then((result)=>{
            let response = new serverResponse.Response("success");
            response.chatInfo=result;
            res.send(JSON.stringify(response));
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));        
    })
}

router.confirmChat=function(req,res){
    mongo.confirmConsultantChat(req.body.chatId).then((result)=>{
          let response = new serverResponse.SuccResponse();
          res.send(JSON.stringify(response));     
    },err=>{
          let response = new serverResponse.FailResponse(err);
          res.send(JSON.stringify(response));      
    }) 
}

router.addChat=function(req,res){
    mongo.addChat(req.body.chatId,'consultant',req.body.msg).then((result)=>{
          //고객에게 push msg를 전달한다.
          let msg=result.msg;
          msg.chatId=req.body.chatId;
          notification.sendToUser(msg,result.userId).then((notifyRes)=>{
              let response = new serverResponse.Response("success");
              response.msg=result.msg;
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

router.replaceChat=function(req,res){
    mongo.replaceChat(req.body.chatId,req.body.index,'consultant',req.body.msg).then((result)=>{
          //고객에게 push msg를 전달한다.
          let msg=result.msg;
          msg.chatId=req.body.chatId;          
          notification.sendToUser(msg,result.userId).then((notifyRes)=>{
              let response = new serverResponse.Response("success");
              response.msg=result.msg;
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

router.registrationId=function(req,res){
    console.log("registrationId:"+JSON.stringify(req.body));
    mongo.registrationConsultId(req.body,req.session.uid).then(result=>{
        let response = new serverResponse.Response("success");
        res.send(JSON.stringify(response));
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    })
}

router.terminateChat=function(req,res){
    console.log("terminateChat:"+req.body.chatId);
    mongo.terminateChat(req.body.chatId,"consultant").then((result)=>{
        let msg={time:result.date, type:"action",action:"exit",message:"상담종료",chatId:req.body.chatId};
        console.log("userId:"+result.userId);
        notification.sendToUser(msg,result.userId).then((notifyRes)=>{
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

/*
mongo.addConsultant( { email: "kalen02101@takib.biz", password: "111Highway 37",salt:"test", phone:"010",name:"이경주",birth:"19750111",sex:"F"}).then((res)=>{
  console.log("res:"+res);
},err=>{
  console.log("err:"+err);

});
*/
module.exports = router;
