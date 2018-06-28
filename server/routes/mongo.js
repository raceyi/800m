var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var AsyncLock = require('async-lock');
var lock = new AsyncLock();

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
                                                    resolve(result.upserted[0]._id);
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
        dbo.collection("user").find({}, { email: object.email }).toArray(function(err, result) {
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

router.findConsultant=function(object){
  return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.dbName);
        dbo.collection("consultant").find({}, { email: object.email }).toArray(function(err, result) {
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

router.findConsultantWithIDNumber=function(idNumber){
  return new Promise((resolve,reject)=>{     
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(config.dbName);
        dbo.collection("consultant").find({}, { IDNumber: idNumber }).toArray(function(err, result) {
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

//lock을 사용한다. 각 사용자 id에 대해서 
router.saveChatLine=function(line){
  return new Promise((resolve,reject)=>{ 
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db(config.dbName); 
    //URI encoding
    dbo.collection("chat").insertOne(line ,function(err, res) {
      if (err){ 
          reject(err);
      }else{
          // 사용자와 마지막으로 채팅한 시간을 user에 저장한다.  
          resolve();
      }
    });
  });
  });
}

module.exports = router;

