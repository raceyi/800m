var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var AsyncLock = require('async-lock');
var lock = new AsyncLock();
var util=require("./util.js");
let config = require('../config');

var url=config.mongoURL;

String.prototype.padZero= function(len, c){
    var s= '', c= c || '0', len= (len || 2)-this.length;
    while(s.length<len) s+= c;
    return s+this;
}

Number.prototype.padZero= function(len, c){
    return String(this).padZero(len,c);
}

router.addUser=function(object){
  return new Promise((resolve,reject)=>{ 
  MongoClient.connect(url, function(err, db) {
    if (err){
        reject(err);  
    }else{ 
        var dbo = db.db(config.dbName); 
        dbo.collection("user").updateOne({email: object.email},{$set:{email:object.email}},{upsert:true} ,function(err, res) {
            if (err){ 
                reject(err);
            }else{
                let result=JSON.parse(res);
                console.log("result.upserted:"+JSON.stringify(result.upserted));
                if(result.upserted==undefined){
                    console.log(" existing user comes "+JSON.stringify(res));
                    db.close(); 
                    reject("existingUser");
                }else{ //result.upserted is object
                    console.log(" New user comes "+JSON.stringify(res));
                    //save other fields like password, phone,name,birth,sex
                    dbo.collection("user").updateOne({email: object.email},{$set:object},{upsert:false} ,function(err, res) {
                            db.close();
                            resolve(result.upserted[0]._id);
                    },err=>{
                            reject(err);
                    })
                }
            }
        });
    }
  });
  });
}

function getNextId(dbo,collectionName) {
  return new Promise((resolve,reject)=>{ 
        lock.acquire(collectionName, function(done) {
                        dbo.collection("counters").findAndModify(
                            { "_id": collectionName },
                            [['_id','asc']], 
                                { "$inc": { "seq": 1 } },
                                function(err,doc) {
                                    // work here
                                    if (err) {
                                        done(err);
                                    } else {
                                        done(null,doc.value.seq);
                                    }
                                });
        },function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result); 
            }
    });
  });
}

router.addConsultant=function(object){
  return new Promise((resolve,reject)=>{ 
            MongoClient.connect(url, function(err, db) {
                if (err){
                    reject(err);
                }else{
                        var dbo = db.db(config.dbName); 
                            dbo.collection("consultant").updateOne({email: object.email},{$set:{email:object.email}},{upsert:true} ,function(err, res) {
                                if (err){ 
                                    reject(err);
                                }else{
                                    console.log("res:"+res);
                                    let result=JSON.parse(res);
                                    if(result.upserted==undefined){
                                        console.log(" existing consultant comes "+JSON.stringify(res));
                                        db.close(); 
                                        reject("existingUser");
                                    }else{
                                        let result=JSON.parse(res);
                                        //console.log("result.upserted:"+JSON.stringify(result.upserted));
                                        console.log(" New user comes "+JSON.stringify(res));
                                        //save other fields like password, phone,name,birth,sex
                                        getNextId(dbo,"consultant").then((autoIndex)=>{
                                            //console.log("autoIndex:"+Number.padZero(6,autoIndex));
                                            object.IDNumber=autoIndex.padZero(6);
                                            console.log("autoIndex:"+autoIndex.padZero(6));
                                            dbo.collection("consultant").updateOne({email: object.email},{$set:object},{upsert:false} ,function(err, res) {
                                                    db.close();
                                                    let consultant={id:result.upserted[0]._id,IDNumber:object.IDNumber};
                                                    resolve(consultant);
                                            },err=>{
                                                    reject(err);
                                            })
                                        });
                                    }
                                }
                            });
                }
            });
  });
}

router.findUser=function(object){
  return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.dbName);
        dbo.collection("user").find({ email: object.email }).toArray(function(err, result) {
            if (err){
                reject(err);
            }else{ 
                db.close();
                console.log("result:"+JSON.stringify(result));
                resolve(result);
            }
        });
    });
  })
}

router.findUserWithId=function(id){
  return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.dbName);
        dbo.collection("user").find({ "_id": ObjectId(id) }).toArray(function(err, result) {
            if (err){
                reject(err);
            }else{ 
                db.close();
                console.log("result:"+JSON.stringify(result));
                if(result.length>0){
                    resolve(result[0]);
                }else
                    reject("user not found");   
            }
        });
    });
  })
}

router.findConsultant=function(object){
  return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.dbName);
        dbo.collection("consultant").find({ email: object.email }).toArray(function(err, result) {
            if (err){
                reject(err);
            }else{ 
                console.log(result);
                db.close();
                resolve(result);
            }
        });
    });
  })
}

router.consultantLogin=function(object){
    return new Promise((resolve,reject)=>{    
    MongoClient.connect(url, function(err, db) {
        if (err){ 
            reject(err);
        }else{
                var dbo = db.db(config.dbName);
                console.log("email:"+object.email);
                dbo.collection("consultant").find({ email: object.email }).toArray(function(err, mine) {
                    if (err){
                        reject(err);
                    }else{ 
                        //console.log("result:"+mine);
                        let consultant=mine[0];
                        util.decryptObj(consultant);
                        // 고객 정보를 검색한다.
                        console.log("consultant:"+JSON.stringify(consultant));
                        let userIds=[];
                        consultant.userIds.forEach(userId=>{
                            userIds.push(ObjectId(userId));
                        })
                            dbo.collection("user").find({"_id": { $in: userIds }}).toArray(function(err, users) {
                                // name, phone,... 고객 정보를 가져온다. 
                                // 보험 목록에서 연체 여부를 확인한다.
                                console.log("users.length:"+users.length);
                                // cursor를 생각하자. 현재는 데이터가 적음으로 find에서 cursor를 고려하지는 않았다. 
                                users.forEach(user=>{
                                    util.decryptObj(user);
                                    delete user.password;
                                    delete user.salt;
                                })
                                //현재 상담중인 목록을 가져온다.
                                //chat 테이블에서 consultantId로 검색한다.
                                console.log("consultant._id:"+consultant._id.toString());
                                let consultantId=consultant._id.toString();
                                dbo.collection("chat").find({consultantId:consultantId,progress:true}).toArray(function(err, chats) {
                                    console.log("chats:"+JSON.stringify(chats));
                                    let loginInfo={users:users,chats:chats,consultant:consultant}
                                    console.log("consultant:"+JSON.stringify(loginInfo));
                                    db.close();
                                    resolve(loginInfo);
                                });                         
                            });
                        }     
                })
            }
        })
    });
}

router.getConsultantChats=function(consultantId){
return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err){ 
            reject(err);
        }else{
            var dbo = db.db(config.dbName);
                dbo.collection("chat").find({consultantId:consultantId,progress:true}).toArray(function(err, chats) {
                if (err){
                    reject(err);
                }else{ 
                    console.log(chats);
                    db.close();
                    resolve(chats);
                }
            });            
        }
    });
  })
}

//router.getConsultantChats("5b36f2e96654502e8d5945c1").then((chats)=>{
//    console.log("chats:"+JSON.stringify(chats));
//});

router.confirmConsultantChat=function(chatid){
    //lastorigin이 consultant라면 confirm을 true로 설정함. mongodb에 update의 조건문 사용
 return new Promise((resolve,reject)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) {
            reject(err);
        }else{
            var dbo = db.db(config.dbName); 
            console.log("chatId:"+chatid);
            dbo.collection("chat").updateOne({_id:ObjectId(chatid),lastOrigin:'user'},{$set:{confirm:true}},{upsert:false} ,function(err, res) {
                if (err){ 
                    reject(err);
                }else{
                    db.close();
                    resolve(res);
                }
            });
        }
    });  
  });
}


router.registerConsultant=function(consultantId,userId){
  // user에 consultantId를 저장하고 consultant에 userId를 저장한다.
  return new Promise((resolve,reject)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) {
            reject(err);
        }else{
            var dbo = db.db(config.dbName); 
            console.log("userId:"+userId);
            dbo.collection("user").updateOne({_id:ObjectId(userId)},{$set:{consultantId:consultantId}},{upsert:false} ,function(err, res1) {
                if (err){ 
                    reject(err);
                }else{
                        dbo.collection("consultant").findOneAndUpdate({IDNumber: consultantId},{$push: { userIds: userId }},{upsert:false} ,function(err, res2) {
                                if(err){
                                    reject(err);
                                }else{
                                    console.log("updated consultant "+JSON.stringify(res2));
                                    db.close();
                                    resolve(res2.value);
                                }
                        });
                }
            });
        }
    });  
  });
}

router.registrationId=function(tokenInfo,userId){
return new Promise((resolve,reject)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) {
            reject(err);
        }else{
            var dbo = db.db(config.dbName); 
            console.log("userId:"+userId);
            dbo.collection("user").updateOne({_id:ObjectId(userId)},{$set:{token:tokenInfo.registrationId,platform:tokenInfo.platform}},{upsert:false} ,function(err, res1) {
                if (err){ 
                    reject(err);
                }else{
                    db.close();
                    resolve();   
                }
            });
        }
    });  
  });
}

router.registrationConsultId=function(tokenInfo,userId){
return new Promise((resolve,reject)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) {
            reject(err);
        }else{
            var dbo = db.db(config.dbName); 
            console.log("userId:"+userId);
            dbo.collection("consultant").updateOne({_id:ObjectId(userId)},{$set:{token:tokenInfo.registrationId,platform:tokenInfo.platform}},{upsert:false} ,function(err, res1) {
                if (err){ 
                    reject(err);
                }else{
                    db.close();
                    resolve();   
                }
            });
        }
    });  
  });
}

router.findInsurancePayments=function(insurances){
  return new Promise((resolve,reject)=>{ 
      if(!insurances){
          resolve([]);
      }else{    
        MongoClient.connect(url, function(err, db) {
        if (err){ 
            reject(err);
        }else{
            var dbo = db.db(config.dbName);
            console.log("insurances:"+JSON.stringify(insurances));
            let insuranceObjs=[];
            insurances.forEach((insurance)=>{
                insuranceObjs.push(ObjectId(insurance));
            })
            dbo.collection("insurance").find({  _id:{$in: insuranceObjs } }).toArray(function(err, result) {
                if (err){
                    reject(err);
                }else{ 
                    console.log(result);
                    db.close();
                    resolve(result);
                }
            });            
        }
        });
      }
  })
}

router.findConsultantWithIDNumber=function(idNumber){
  return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.dbName);
        dbo.collection("consultant").find({ IDNumber: idNumber }).toArray(function(err, result) {
            if (err){
                reject(err);
            }else{ 
                console.log(result);
                db.close();
                resolve(result);
            }
        });
    });
  })
}

router.findConsultantWithId=function(id){
  return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.dbName);
        dbo.collection("consultant").find({ _id: ObjectId(id) }).toArray(function(err, result) {
            if (err){
                reject(err);
            }else{ 
                console.log(result);
                db.close();
                if(result.length>0)
                    resolve(result[0]);
                else
                    reject("consultant not found");    
            }
        });
    });
  })
}

router.findChatWithId=function(id){
  return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.dbName);
        dbo.collection("chat").find({ _id: ObjectId(id)}).toArray(function(err, result) {
            if (err){
                reject(err);
            }else{ 
                console.log(result);
                db.close();
                if(result.length>0)
                    resolve(result[0]);
                else
                    reject("chat not found");    
            }
        });
    });
  })
}

router.terminateChat=function(chatId,origin){
return new Promise((resolve,reject)=>{
    MongoClient.connect(url, function(err, db) {
        if (err) {
            reject(err);
        }else{
            var dbo = db.db(config.dbName); 
            console.log("chatId:"+chatId);
            let now=new Date();
            dbo.collection("chat").findOneAndUpdate({_id:ObjectId(chatId)},{$set:{progress:false,lastOrigin:origin,confirm:true, date:now}},{upsert:false} ,function(err, res) {
                if (err){ 
                    reject(err);
                }else{
                    db.close();
                    resolve(res.value);   
                }
            });
        }
    });  
  });
}

router.createNewChat=function(type,uid,consultantId){
 return new Promise((resolve,reject)=>{ 
  MongoClient.connect(url, function(err, db) {
    if (err){
        reject(err);  
    }else{ 
        var dbo = db.db(config.dbName);
        let now=new Date();
        let content={ time:now, type:"action", action:"response", origin:"user", text:type+"상담문의"}; 
        dbo.collection("chat").insertOne({type: type,userId:uid,consultantId:consultantId,date: now,progress:true,confirm:false,lastOrigin:"user",contents:[content]} ,function(err, res) {
            if (err){ 
                reject(err);
            }else{
                db.close();
                console.log("res:"+JSON.stringify(res.ops[0]));
                resolve(res.ops[0]);
            }
        },err=>{
            reject(err);
        });
    }
  });
  });
}

router.createNewChatByConsultant=function(type,uid,consultantId){
 return new Promise((resolve,reject)=>{ 
  MongoClient.connect(url, function(err, db) {
    if (err){
        reject(err);  
    }else{ 
        var dbo = db.db(config.dbName);
        let now=new Date();
        let content={ time:now, type:"text", origin:"consultant", text:type+"으로 연락드립니다."}; 
        dbo.collection("chat").insertOne({type: type,userId:uid,consultantId:consultantId,date: now,progress:true,confirm:false,lastOrigin:"consultant",contents:[content]} ,function(err, res) {
            if (err){ 
                reject(err);
            }else{
                db.close();
                console.log("res:"+JSON.stringify(res.ops[0]));
                resolve(res.ops[0]);
            }
        },err=>{
            reject(err);
        });
    }
  });
  });
}

router.replaceChat=function(chatId,index,origin,msg){
  return new Promise((resolve,reject)=>{ 
  MongoClient.connect(url, function(err, db) {
    if (err){
        reject(err);
    }else{
        var dbo = db.db(config.dbName); 
        //URI encoding
        msg.time=new Date();
        msg.origin=origin;
        console.log("chatId:"+chatId);
        var setObject = {};
        setObject["contents."+ index] = msg;
        setObject["lastOrigin"]='consultant';
        setObject["confirm"]=false;
        setObject["date"]=msg.time;

        dbo.collection("chat").findOneAndUpdate({_id:ObjectId(chatId)},{
          $set:setObject},function(err, res) {
                    if (err){ 
                console.log("err:"+JSON.stringify(err));
                reject(err);
            }else{
                    db.close();  
                    console.log("res.value:"+res.value);
                    resolve({msg:msg,userId:res.value.userId});
            }
        });
    }
    });
  });        
}

router.getUserList=function(consultantId){
  return new Promise((resolve,reject)=>{

  MongoClient.connect(url, function(err, db) {
    if (err){
        reject(err);
    }else{
         var dbo = db.db(config.dbName);
         dbo.collection("consultant").find({ _id: ObjectId(consultantId)}).toArray(function(err, mine) {
                    if (err){
                        reject(err);
                    }else{
                       console.log("mine:"+JSON.stringify(mine));
                       let userIds=[];
                       if(!mine[0].userIds){
                           resolve([]); 
                       }else{
                        mine[0].userIds.forEach(userId=>{
                           userIds.push(ObjectId(userId));
                        })
                        dbo.collection("user").find({"_id": { $in: userIds }}).toArray(function(err, users) {
                            if(err){
                                reject(err);
                            }else{ 
                               //console.log("users:"+JSON.stringify(users));
                               users.forEach(user=>{
                                   util.decryptObj(user);
                                   delete user.password;
                                   delete user.salt;
                               });
                               resolve(users);
                            }
                        });
                       }
                    }
         });
    }
   });
  });
}

//router.getUserList("5b6c29c028db34e3eef92c70").then((users)=>{console.log(JSON.stringify(users))});

router.addChat=function(chatId,origin,msg){
  return new Promise((resolve,reject)=>{ 
  MongoClient.connect(url, function(err, db) {
    if (err){
        reject(err);
    }else{
        var dbo = db.db(config.dbName); 
        //URI encoding
        msg.time=new Date();
        msg.origin=origin;
        console.log("chatId:"+chatId);
        dbo.collection("chat").findOneAndUpdate({_id:ObjectId(chatId)},
        /*   Array 앞에 추가할 경우 사용함.
            {$push: {
                contents: {
                $each: [ msg ],
                $position: 0
                }
            }
         */  {$push: {
                contents:  msg 
            },$set:{lastOrigin:origin,confirm:false,date: msg.time}},function(err, res) {
                    if (err){ 
                console.log("err:"+JSON.stringify(err));
                reject(err);
            }else{
                    db.close();  
                    console.log("res.value:"+res.value);
                    resolve({msg:msg,userId:res.value.userId});
            }
        });
    }
    });
  });        
}
//router.addChat("5b39c3f333b466123f05f412","consultant",{text:"test"});

/*
//lock을 사용한다. 각 사용자 id에 대해서 
router.saveChatLine=function(line){
  return new Promise((resolve,reject)=>{ 
  MongoClient.connect(url, function(err, db) {
    if (err){
        reject(err);
    }else{
        var dbo = db.db(config.dbName); 
        //URI encoding
        dbo.collection("chat").insertOne(line ,function(err, res) {
        if (err){ 
            reject(err);
        }else{
            // 사용자와 마지막으로 채팅한 시간을 user에 저장한다.
            db.close();  
            resolve();
        }
        });
    } 
  });
  });
}
*/
////////////////////////////////////////////
/*
let _id="5b3b1de15c423295103c2d8e";
MongoClient.connect(url, function(err, db) {
        if (err) {
            reject(err);
        }else{
            var dbo = db.db(config.dbName); 
            dbo.collection("insurance").updateOne({_id:ObjectId(_id)},{$push: { payments: {month:6,payment:false }}},{upsert:false} ,function(err, res1) {
                if (err){ 
                    console.log("error:"+JON.stringify(err));
                }else{
                    console.log("res:"+JSON.stringify(res1)); 
                     db.close();  
                }
            });
        }
    });  
*/
module.exports = router;

