var express = require('express');
var router = express.Router();
let crypto = require('crypto');
const CryptoJS = require('crypto-js');
var mongo = require("./mongo");
var serverResponse = require("./response");
var util=require("./util.js");
let config = require('../config');
var notification=require("./notification");
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

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

router.oauthSuccess=function(req,res){
	console.log("oauth success");
	let response = new serverResponse.Response("oauth success");
	res.send(JSON.stringify(response));
};

router.oauthFailure=function(req,res){
   let response = new serverResponse.Response("oauth failure");
   res.send(JSON.stringify(response));
};


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
          req.session.uid=result;
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
            console.log("searchConsultant:"+req.body.consultantId);
  mongo.findConsultantWithIDNumber(req.body.consultantId).then((result)=>{
            let response = new serverResponse.SuccResponse();
            if(result.length>0){
                let consultantInfo=result[0];
                util.decryptObj(consultantInfo);
                response.consultant=consultantInfo;
                console.log("response.consultant:"+JSON.stringify(response.consultant));
            }
            res.send(JSON.stringify(response));            
  },err=>{
      let response = new serverResponse.FailResponse("NotFound");
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

router.registerConsultant=function(req,res){
    console.log("registerConsultant:"+JSON.stringify(req.body));
    console.log("req.session.uid:"+req.session.uid);
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
    let uid="userId"+req.session.uid;
    lock.acquire(uid, function(callback) {
        console.log("createNewChat:"+JSON.stringify(req.body));
        mongo.createNewChat(req.body.type,req.session.uid,req.body.consultantId,req.body.userName,req.body.consultantName).then(chatInfo=>{
            console.log("chatInfo:"+JSON.stringify(chatInfo));
            let msg={time:chatInfo.date, type:"action",action:"response",text:req.body.type+"상담문의"};
            notification.sendToConsultant(msg,req.session.cid).then((notifyRes)=>{
                let response = new serverResponse.Response("success");
                console.log("chatId:"+chatInfo._id);
                response.chatId=chatInfo._id;
                res.send(JSON.stringify(response));
                callback(null);
            },err=>{
                let response = new serverResponse.FailResponse(err);
                res.send(JSON.stringify(response));
                callback(null);
            }) 
        },err=>{
            let response = new serverResponse.FailResponse(err);
            res.send(JSON.stringify(response));
            callback(null);
        })
    }, function(err, result) {
        console.log("createNewChat done"); 
    });
}

router.terminateChat=function(req,res){
    console.log("terminateChat:"+req.body.chatId);
    mongo.terminateChat(req.body.chatId,"user").then((result)=>{
        let msg={time:result.date, type:"action",action:"exit",message:"상담종료",chatId:req.body.chatId};
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

router.getChat=function(req,res){
    console.log("[getChat]chatId:"+req.body.chatId);
    mongo.findChatWithId(req.body.chatId).then((result)=>{
            let response = new serverResponse.Response("success");
            console.log()
            response.chatInfo=result;
            console.log("[getChat]"+JSON.stringify(response.chatInfo));
            res.send(JSON.stringify(response));
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));        
    })
}

router.addChat=function(req,res){
    mongo.addChat(req.body.chatId,'user',req.body.msg).then((result)=>{
          //consultant에게 push msg를 전달한다.
          let msg=result.msg;
          msg.chatId=req.body.chatId;
          notification.sendToConsultant(msg,req.session.cid).then((notifyRes)=>{
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

router.getUserChats=function(req,res){
        mongo.getUserMyChatList(req.session.uid,req.body.queryTime,req.body.limit).then(chats=>{
            let response = new serverResponse.Response("success");
            response.chats=chats;
            res.send(JSON.stringify(response));
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    });    
}

/////////////////////////////////////////////////////
router.passwordReset=function(req,res){
	console.log(req.body);
    let email=req.body.email;
	if(req.body.email!== null && req.body.phone !==null){
		//1)user의 email과 phone번호 확인
        let encryptedUser= util.encryptObj(req.body);
        console.log("encryptedUser.email:"+encryptedUser.email);

		mongo.findUser(encryptedUser).then((userInfo)=>{
            //console.log("userInfo:"+JSON.stringify(userInfo));
			 if(!userInfo || userInfo.length==0){
				let response = new serverResponse.FailResponse("user not found");
         	    res.send(JSON.stringify(response));
            }else{ 
                let user=userInfo[0];
                console.log("user.phone:"+user.phone);
				if(req.body.phone === user.phone){
					console.log("phone success");
					//2) random 패스워드 DB set
					let newPwd = crypto.randomBytes(3).toString('hex');
					
					let userInfo = {};
					userInfo.password = newPwd;
                    let decryptedUser=util.decryptObj(user);
					mongo.updateUserPassword(encryptedUser.email,newPwd).then(result=>{
							let subject="임시 비밀번호";
							let content=user.name+"님의 임시 비밀번호는 "+newPwd+" 입니다.";
							
							notification.sendEmail(email,subject,content,function(err,result){
								if(err){
									console.log(err);
									let response = new serverResponse.FailResponse(err);
         						    res.send(JSON.stringify(response));
								}else{
									let response = new serverResponse.Response("success");
         						    res.send(JSON.stringify(response));
								}
							});
					},err=>{
                        let response = new serverResponse.FailResponse(err); 
                        res.send(JSON.stringify(response));                        
                    });
				}else{
					let response = new serverResponse.FailResponse("phone number is invalid"); 
         		    res.send(JSON.stringify(response));
				}
			}
		},err=>{
				let response = new serverResponse.FailResponse("user doesn't exist");
         	    res.send(JSON.stringify(response));
        });
	}else{
		let response = new serverResponse.FailResponse("email or phone is null");
        res.send(JSON.stringify(response));
	}
}

router.modifyUserPassword=function(req,res){
	console.log("modifyUserPassword"+JSON.stringify(req.body));
    let email=req.body.email;
	if(req.body.email!== null){
		//1)user의 email과 비밀번호 확인
        let encryptedUser= util.encryptObj(req.body);
        console.log("encryptedUser.email:"+encryptedUser.email);

		mongo.findUser(encryptedUser).then((userInfo)=>{
            //console.log("userInfo:"+JSON.stringify(userInfo));
			 if(!userInfo || userInfo.length==0){
				let response = new serverResponse.FailResponse("user not found");
         	    res.send(JSON.stringify(response));
            }else{ 
                let user=userInfo[0];
                user=util.decryptObj(user);
                let secretPassword = crypto.createHash('sha256').update(req.body.oldPassword + user.salt).digest('hex');
                console.log("secretPassword:"+secretPassword);
                console.log("userInfo.password:"+user.password);

                if (secretPassword === user.password) {
					mongo.updateUserPassword(encryptedUser.email,req.body.newPassword).then(result=>{
									let response = new serverResponse.Response("success");
         						    res.send(JSON.stringify(response));
					},err=>{
                        let response = new serverResponse.FailResponse(err); 
                        res.send(JSON.stringify(response));                        
                    });
				}else{
					let response = new serverResponse.FailResponse("incorrect oldPassword"); 
         		    res.send(JSON.stringify(response));
				}
			}
		},err=>{
				let response = new serverResponse.FailResponse("user doesn't exist");
         	    res.send(JSON.stringify(response));
        });
	}else{
		let response = new serverResponse.FailResponse("email is null");
        res.send(JSON.stringify(response));
	}
}

router.modifyUserPhone=function(req,res){
    	console.log("modifyUserPassword"+JSON.stringify(req.body));
	if(req.body.email!== null){
		//1)user의 email과 비밀번호 확인
        let encryptedUser= util.encryptObj(req.body);
        console.log("encryptedUser.email:"+encryptedUser.email);

		mongo.findUser(encryptedUser).then((userInfo)=>{
            //console.log("userInfo:"+JSON.stringify(userInfo));
			 if(!userInfo || userInfo.length==0){
				let response = new serverResponse.FailResponse("user not found");
         	    res.send(JSON.stringify(response));
            }else{ 
					mongo.updateUserPhone(encryptedUser.email,encryptedUser.phone).then(result=>{
									let response = new serverResponse.Response("success");
         						    res.send(JSON.stringify(response));
					},err=>{
                        let response = new serverResponse.FailResponse(err); 
                        res.send(JSON.stringify(response));                        
                    });
			}
		},err=>{
				let response = new serverResponse.FailResponse("user doesn't exist");
         	    res.send(JSON.stringify(response));
        });
	}else{
		let response = new serverResponse.FailResponse("email is null");
        res.send(JSON.stringify(response));
	}
}

router.checkRegistrationId=function(req,res){
    mongo.findUserWithId(req.session.uid).then(user=>{
        let response = new serverResponse.Response("success");
        response.token=user.token;
        res.send(JSON.stringify(response));
    },err=>{
		let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    })
}

router.logout=function(req,res){
    //session 정보를 삭제한다.
    delete req.session.uid;
    let response = new serverResponse.Response("success");
    res.send(JSON.stringify(response));    
}

router.unregister=function(req,res){
    mongo.removeUserWithId(req.session.uid).then((res)=>{    
        delete req.session.uid;
        let response = new serverResponse.Response("success");
        res.send(JSON.stringify(response));    
    },err=>{
		let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));            
    })
}

/*
mongo.addUser( { email: "kalen985@takib.biz", password: "111Highway 37",salt:"test", phone:"010",name:"이경주",birth:"19750111",sex:"F"}).then((res)=>{
  console.log("res:"+res);
},err=>{
  console.log("err:"+err);

});
*/

module.exports = router;
