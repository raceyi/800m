var express = require('express');
var router = express.Router();
let crypto = require('crypto');
var mongo = require("./mongo");
var response = require("./response");
var util=require("./util.js");
var serverResponse = require("./response");
var notification=require("./notification");
var moment=require('moment');
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
        console.log("secretPassword:"+secretPassword);
        console.log("result.consultant.password:"+result.consultant.password);
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

router.createNewChat=function(req,res){
    console.log("createNewChatByConsultant:"+JSON.stringify(req.body)); 
    let uid="consultantId"+req.session.uid;   
    lock.acquire(uid, function(callback) {
        //console.log("createNewChatByConsultant:"+JSON.stringify(req.body));
            mongo.createNewChatByConsultant(req.body.type,req.body.userId ,req.session.uid,req.body.name,req.body.consultantName).then(chatInfo=>{
                console.log("chatInfo:"+JSON.stringify(chatInfo));
                let msg={time:chatInfo.date, type:"text",text:"고객님"+req.body.type+"으로 연락드립니다.",chatId: chatInfo._id};        
                notification.sendToUser(msg,req.body.userId).then((notifyRes)=>{
                    let response = new serverResponse.Response("success");
                    console.log("done - chatId:"+chatInfo._id);
                    response.chatId=chatInfo._id;
                    res.send(JSON.stringify(response));
                    console.log("createNewChat response success ");
                    callback(null);
                },err=>{
                    console.log("err "+err+ "happens");
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
        console.log("createNewChatByConsultant done"); 
    });
}

router.getUsers=function(req,res){
    mongo.getUserList(req.session.uid).then(users=>{
            let response = new serverResponse.Response("success");
            response.users=users;
            res.send(JSON.stringify(response));
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    });    
}

router.getUserChats=function(req,res){
        mongo.getUserChatList(req.session.uid,req.body.userId,req.body.queryTime,req.body.limit).then(chats=>{
            let response = new serverResponse.Response("success");
            response.chats=chats;
            res.send(JSON.stringify(response));
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    });    

}

var getDaysInMonth = function(year,month) {
    let date=new Date();
    date.setMonth(month-1);
    date.setFullYear(year);
    console.log("date:"+date);
    var m = moment(date); 
    return m.daysInMonth();
};

router.getMonthChats=function(req,res){
    // 한달간의 설계사의 모든 상담 목록을 가져온다.
    // 가져올때는 모든 채팅 목록이 나와야 한다.
    console.log("getMonthChats-body:"+JSON.stringify(req.body));
    mongo.getMonthChats(req.session.uid,req.body.year,req.body.month).then(chats=>{ // 채팅 start의 time과 chat의 date시간이 범위를 포함하는경우만 가져온다.
        console.log("chats:"+chats);
        if(chats.length>0){
            let monthDays=getDaysInMonth(req.body.year,req.body.month);
            let month=[];
            for(i=0;i<monthDays;i++)
                month.push({eachEvent:[]});
            chats.forEach(chat=>{       // 채팅 목록에 따라 날짜별로 분류한다. (local time과 global time의 문제)
                for(i=0;i<chat.contents.length;i++){
                    let eachLine=chat.contents[i];
                    let timeDate=new Date(eachLine.time);
                    
                    if(timeDate.getMonth()==(req.body.month-1) && timeDate.getFullYear()==req.body.year){ //동일 년/월일 경우만
                        // 동일날짜에 동일 userId를 검색한다. 없으면 추가하고 있으면 endTime을 조정한다
                        console.log("timeDate:"+timeDate);
                        let date=timeDate.getDate()-1;
                        //console.log("eachEvent:"+JSON.stringify(month[date].eachEvent));
                        let index=month[date].eachEvent.findIndex(function (element) {
                            //console.log("userId:"+element.userId+ " userId:"+chat.userId);
                            console.log("chat._id:"+JSON.stringify(chat)+" "+JSON.stringify(element));
                            return (element.userId==chat.userId && element.chatId==chat._id);
                        });
                        console.log("index:"+index);
                        if(index<0){
                            month[date].eachEvent.push({userId:chat.userId,chatId:chat._id, type:chat.type,starttime:timeDate,endtime:timeDate,userName:chat.userName});
                        }else{
                            month[date].eachEvent[index].endtime=timeDate;
                        }
                    }
                    //console.log("month:"+JSON.stringify(month));
                }
            });
            //console.log("month:"+JSON.stringify(month));
            let events=[];
                month.forEach(day=>{
                    day.eachEvent.forEach(chat=>{
                        events.push(chat);
                    })
                })
                console.log("events:"+JSON.stringify(events));
                let response = new serverResponse.Response("success");
                response.events=events;
                res.send(JSON.stringify(response));
         /*            
            for(let i=0;i<month.length;i++)
                console.log("i:"+i+" "+JSON.stringify( month[i].eachEvent));
            // 고객 이름을 검색한다. 이름정도는 따로 저장하는것도 괜찬다... 동일 고객이 있을수 있음으로 고객 id만 저장한 array를 만드록 가져오자.
            let customer=[];
            month.forEach(day=>{
                day.eachEvent.forEach(chat=>{
                        let index=customer.findIndex(function (element) {
                            return element.userId==chat.userId;
                        });
                        if(index<0){
                            customer.push(chat.userId);
                        }
                })
            });
            console.log("month--:"+JSON.stringify(month));            
            mongo.getCustomerName(customer).then((names)=>{
                console.log("!!!!names:"+JSON.stringify(names));
                month.forEach(day=>{
                    day.eachEvent.forEach(chat=>{
                            console.log("chat.userId:"+chat.userId);
                            let index=names.findIndex(function (element) {
                                console.log("element:"+JSON.stringify(element));
                                return element._id==chat.userId;
                            });
                            if(index<0){
                                console.log("hum... customer name not found\n");
                            }else{
                                chat.name=names[index].name;
                            }
                    })
                });       
                let events=[];
                month.forEach(day=>{
                    day.eachEvent.forEach(chat=>{
                        events.push(chat);
                    })
                })
                console.log("events:"+JSON.stringify(events));
                let response = new serverResponse.Response("success");
                response.events=events;
                res.send(JSON.stringify(response));
            },err=>{
                console.log("err:"+JSON.stringify(err));
                let response = new serverResponse.FailResponse(err);
                res.send(JSON.stringify(response));
            })
            */
    }else{
            console.log("chats is undefined");
            let response = new serverResponse.Response("success");
            response.events=[];
            res.send(JSON.stringify(response));            
        }
    },err=>{
        let response = new serverResponse.FailResponse(err);
        res.send(JSON.stringify(response));
    });
}

router.modifyConsultantPassword=function(req,res){
	console.log("modifyUserPassword"+JSON.stringify(req.body));
    let email=req.body.email;
	if(req.body.email!== null){
		//1)user의 email과 비밀번호 확인
        let encryptedUser= util.encryptObj(req.body);
        console.log("encryptedUser.email:"+encryptedUser.email);

		mongo.findConsultant(encryptedUser).then((userInfo)=>{
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
					mongo.updateConsultantPassword(encryptedUser.email,req.body.newPassword).then(result=>{
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

		mongo.findConsultant(encryptedUser).then((userInfo)=>{
            //console.log("userInfo:"+JSON.stringify(userInfo));
			 if(!userInfo || userInfo.length==0){
				let response = new serverResponse.FailResponse("user not found");
         	    res.send(JSON.stringify(response));
            }else{ 
					mongo.updateConsultantPhone(encryptedUser.email,encryptedUser.phone).then(result=>{
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

router.passwordReset=function(req,res){
	console.log(req.body);
    let email=req.body.email;
	if(req.body.email!== null && req.body.phone !==null){
		//1)user의 email과 phone번호 확인
        let encryptedUser= util.encryptObj(req.body);
        console.log("encryptedUser.email:"+encryptedUser.email);

		mongo.findConsultant(encryptedUser).then((userInfo)=>{
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
					mongo.updateConsultantPassword(encryptedUser.email,newPwd).then(result=>{
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

router.getUserInfo=function(req,res){
    console.log("getUserInfo:"+JSON.stringify(req.body));
    mongo.findUserWithId(req.body.userId).then(user=>{
        let response = new serverResponse.Response("success");
        util.decryptObj(user);
        response.user=user;
        res.send(JSON.stringify(response));
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
