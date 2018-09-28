let express = require('express');
let router = express.Router();
let gcm = require('node-gcm');
let config = require('../config');
var mongo = require("./mongo");
let nodemailer = require("nodemailer");

router.sendToConsultant=function(msg,id){
     return new Promise((resolve,reject)=>{ 
         mongo.findConsultantWithId(id).then((consultant)=>{
                console.log("consultant:"+JSON.stringify(consultant));

                let pushId=[consultant.token];
                let platform=consultant.platform;
                
                if(platform=="android"){  
                            let sender = new gcm.Sender(config.consultantAPIKey);
                            message = new gcm.Message({
                                priority: 'high',
                                collapseKey: '800m',
                                timeToLive: 3,
                                data : {
                                    title : msg.text,
                                    message : msg.text,
                                    custom  : JSON.stringify(msg),
                                    "content-available": 1
                                }
                            });
                            sender.send(message, {"registrationTokens":pushId}, 4, function (err, result) {
                                if(err){
                                    console.log("err sender:"+JSON.stringify(err));
                                    reject(err);
                                }else{
                                    console.log("success sender:"+JSON.stringify(result));
                                    resolve(result);
                                }
                            });
                }else if(platform=="ios"){
                    reject("Not yet implemented");
                }
         },err=>{
             reject(err);
        })
	});
}

/*
router.sendToConsultant({type:"text",text:"잠시후 연락드리겠습니다.",time:"2018-07-02 22:35:23.544",origin:"consultant"},"5b36f2e96654502e8d5945c1");
router.sendToConsultant("To 고객님...","5b36e7486654502e8d5941ef");
*/

router.sendToUser=function(msg,id){
     return new Promise((resolve,reject)=>{ 
                console.log("sendToUser with id:"+id);
         mongo.findUserWithId(id).then((user)=>{
                console.log("user:"+JSON.stringify(user));
                if(user.platform && user.token){
                    let pushId=[user.token];
                    let platform=user.platform;
                    
                    if(platform=="android"){  
                                let sender = new gcm.Sender(config.userAPIKey);
                                message = new gcm.Message({
                                    priority: 'high',
                                    collapseKey: '800m',
                                    timeToLive: 3,
                                    data : {
                                        title : msg.text,
                                        message : msg.text,
                                        custom  : JSON.stringify(msg),
                                        "content-available": 1
                                    }
                                });
                                sender.send(message, {"registrationTokens":pushId}, 4, function (err, result) {
                                    if(err){
                                        console.log("err sender:"+JSON.stringify(err));
                                        reject(err);
                                    }else{
                                        console.log("success sender:"+JSON.stringify(result));
                                        resolve(result);
                                    }
                                });
                    }else if(platform=="ios"){
                        reject("Not yet implemented");
                    }
            }else
                reject("user not registered");
         },err=>{
             reject(err);
        })
	});
}

router.sendEmail=function(email,subject,content, next){
	const smtpTransport = nodemailer.createTransport({
		host: config.smtpServer, //'smtp.daum.net'
		port: 465,
		secure: true, // use SSL
		//tls : ssl_options
		auth : {
			user:config.smtpId,
			pass:config.smtpPwd
		}
	});

	const mailOptions = {
		from: config.smtpId,
		to: email,
		subject: subject,
		text: content
	};

	smtpTransport.sendMail(mailOptions, function(err, response){
		if(err){
			console.log(err);
			next(err);
		}else{
			console.log("Message sent: " + JSON.stringify(response));
			next();
		}
	});
}

module.exports = router;