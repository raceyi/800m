import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';
import {AlertController,LoadingController,Platform,App,Events,ViewController} from 'ionic-angular';
import {StorageProvider} from '../storage/storage';
import {HttpWrapperProvider} from '../http-wrapper/http-wrapper';
import { NativeStorage } from '@ionic-native/native-storage';
import {ConfigProvider} from "../config/config";
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import {ChatPage} from '../../pages/chat/chat';
var gServerProvider;

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {

  browserRef;
  userSenderID="637913321456";

  pushNotification:PushObject;
  msgAlert=false;

  constructor(public http: HttpClient
              ,private storage:StorageProvider
              ,private iab: InAppBrowser
              ,public alertCtrl:AlertController              
              ,private httpWrapper:HttpWrapperProvider
              ,private nativeStorage:NativeStorage
              ,public loadingCtrl: LoadingController
              ,private app:App
              ,private events:Events              
              ,private platform:Platform
              ,private push: Push)  {
    console.log('Hello ServerProvider');
    gServerProvider=this;
//    platform.ready().then(() => {
//                    this.registerPushService(); 
//
//   });    
  }

    registerPushService(){ // Please move this code into tabs.ts
            this.pushNotification=this.push.init({
                android: {
                    senderID: this.userSenderID,
                    sound: "true",
                   // clearBadge: "true"
                },
                ios: {
                    "alert": "true",
                    "sound": "true",
                    "badge": "true",
                   // "clearBadge": "true"
                },
                windows: {}
            });

            console.log("senderId:"+this.userSenderID);
                        
            this.pushNotification.on('registration').subscribe((response:any)=>{
              console.log("registration..."+response.registrationId);
              var platform;
              if(this.platform.is("android")){
                  platform="android";
              }else if(this.platform.is("ios")){
                  platform="ios";
              }else{
                  platform="unknown";
              }

              let body = {registrationId:response.registrationId, platform: platform};

              this.postWithAuth("/registrationId",body).then((res:any)=>{
                  console.log("registrationId sent successfully");
                  var result:string=res.result;
                  if(result=="success"){

                  }else{
                    
                  }
             },(err)=>{
                 if(err=="NetworkFailure"){
                        console.log("registrationId sent failure");
                        //this.storageProvider.errorReasonSet('네트웍 연결이 원할하지 않습니다'); 
                        //Please move into ErrorPage!
                        //this.app.getRootNav().setRoot(ErrorPage);
                 }else{
                     console.log("Hum...registrationId-HttpError");
                 } 
                });
            });

            this.pushNotification.on('notification').subscribe((data:any)=>{ 
                console.log("pushNotification.on-data:"+JSON.stringify(data.additionalData.custom));
                console.log("pushNotification.on-data:"+data.additionalData.custom.chatId);
                console.log("checkChatPageExist:"+this.checkChatPageExist());
                if(this.app.getRootNavs()[0]==undefined ||this.app.getRootNavs()[0].getViews().length<1){ 
                    // root navigator가 아직 생성되지 않거나 아직 home page생성이 안되었음.
                    //Just show alert and then promote. 상담사로 부터 도착한 메시지를 확인하시겠습니까?
                    //humm... It is not enougth for duplicate alert msg.
/*
                    let loading = this.loadingCtrl.create({
                        content: '앱을 구동중입니다.',
                        duration: 30000,// 30 seconds
                    });
                    console.log("create loadingCtrl");
                    var timer=setInterval(function(){ 
                        if(gServerProvider.app.getRootNavs()!=undefined ||gServerProvider.app.getRootNavs()[0].getViews().length>=1){
                            loading.dismiss();
                            clearInterval(timer); 
                            console.log("open new chat Page");
                            gServerProvider.storage.chatId=data.additionalData.custom.chatId; // 일시적인 해결책임. 여러개의 상담내역이 있을수 있다. 
                            gServerProvider.app.getRootNavs()[0].push(ChatPage, {chatId:data.additionalData.custom.chatId, class:"ChatPage"});                               
                        } 
                    }, 100); // 100 milliseconds
*/
                    if(!this.msgAlert){
                            this.msgAlert=true;
                            let confirm = this.alertCtrl.create({
                                title: '상담사로 부터 도착한 메시지를 확인하시겠습니까?',
                                buttons: [
                                    {
                                    text: '아니오',
                                    handler: () => {
                                        console.log('Disagree clicked');
                                        this.msgAlert=false;
                                    }
                                    },
                                    {
                                    text: '네',
                                    handler: () => {
                                            this.msgAlert=false;
                                            console.log('Agree clicked');
                                            console.log("open new chat Page");
                                            this.storage.chatId=data.additionalData.custom.chatId; // 일시적인 해결책임. 여러개의 상담내역이 있을수 있다. 
                                            this.app.getRootNavs()[0].push(ChatPage, {chatId:data.additionalData.custom.chatId, class:"ChatPage"});   
                                        }
                                    }
                                ]
                                });
                            confirm.present();
                        }
                }else if(!this.checkChatPageExist()){//채팅창이 열려있지 않을 경우
                    console.log("open new chat Page");
                    this.storage.chatId=data.additionalData.custom.chatId; // 일시적인 해결책임. 여러개의 상담내역이 있을수 있다. 
                    this.app.getRootNavs()[0].push(ChatPage, {chatId:data.additionalData.custom.chatId, class:"ChatPage"});   
                }else{
                    console.log("show existing chat Page");
                    //time:chatInfo.date, type:"action",action:"response",message:req.body.type+"상담문의"
                    if(data.additionalData.custom.type=='action'){
                        //채팅 화면이 현재 열려있다면 update하도록 한다. event를 사용해보자. 안되면 EventEmitter를 직접사용하자.
                        //customerContact page를 다시 만들도록한다.
                        this.events.publish("newChat",data.additionalData.custom);
                    }else if(data.additionalData.custom.type=='text'){
                        this.events.publish("newChat",data.additionalData.custom);
                    }
                }
            });

            this.pushNotification.on('error').subscribe((e:any)=>{
                console.log(e.message);
            });
    }

    checkChatPageExist(){
        let  views:ViewController[];
        views=this.app.getRootNavs()[0].getViews();
        for(let i=0;i<views.length;i++){
            let view=views[i];
            console.log("pages:"+view.getNavParams().get("class"));            
            if(view.getNavParams().get("class")!=undefined){
                console.log("class:"+view.getNavParams().get("class"));
                if(view.getNavParams().get("class")=="ChatPage")  {
                        return true;
                }
            }
        }
        return false;
    }

    loginAgain(){
        return new Promise((resolve,reject)=>{

          let passwordPromise=this.nativeStorage.getItem("password");
          let emailPromise=this.nativeStorage.getItem("email");

          Promise.all([passwordPromise, emailPromise]).then(function(values) {
              console.log(values);
              let password=this.storage.decryptValue("password",decodeURI(values[0]));
              let email=this.storage.decryptValue("email",decodeURI(values[1]));
              let body={email:email,password:password};

              this.postWithoutAuth('/login',body).then(res=>{
                  resolve(res);
              },err=>{
                  reject(err);  
              })
          },err=>{
              reject(err);
          });
        }); 
    }

    postWithAuth(url,bodyIn){ 
        return new Promise((resolve,reject)=>{
            let loading = this.loadingCtrl.create({
                content: '서버에 요청 중입니다.'
            });
          this.httpWrapper.post(url,bodyIn).then((res:any)=>{
            loading.dismiss();
            if(res.result=="success")
                resolve(res);
            else
                reject(res.error);    
          },err=>{
            console.log("post-err:"+JSON.stringify(err));
                if(err.hasOwnProperty("status") && err.status==401){
                    //login again with id
                    this.loginAgain().then(()=>{
                        //call http post again
                        this.httpWrapper.post(url,bodyIn).then((res:any)=>{
                            loading.dismiss();
                            console.log("post version:"+res.version+" version:"+this.storage.version);
                            if(parseFloat(res.version)>parseFloat(this.storage.version)){
                                console.log("post invalid version");
                                let alert = this.alertCtrl.create({
                                            title: '앱버전을 업데이트해주시기 바랍니다.',
                                            subTitle: '현재버전에서는 일부 기능이 정상동작하지 않을수 있습니다.',
                                            buttons: ['OK']
                                        });
                                alert.present();
                            }
                            if(res.result=="success")
                                resolve(res);
                            else
                                reject(res.error);    
                         },(err)=>{
                             loading.dismiss();
                             reject("NetworkFailure");
                         });
                    },(err)=>{
                        loading.dismiss();
                        reject(err);
                    });
                 }else{
                    loading.dismiss();
                    reject("NetworkFailure");
                }   
          })
        });
    }

    postWithoutAuth(url,bodyIn){
        return new Promise((resolve,reject)=>{
          this.httpWrapper.post(url,bodyIn).then((res)=>{
            resolve(res);
          },err=>{
            reject(err);
          })
        });
    };

    mobileAuth(){
      console.log("mobileAuth");
    return new Promise((resolve,reject)=>{
      // move into CertPage and then 
      if(this.platform.is("android")){
            this.browserRef=this.iab.create(this.storage.certUrl,"_blank" ,'toolbar=no,location=no');
      }else{ // ios
            console.log("ios");
            this.browserRef=this.iab.create(this.storage.certUrl,"_blank" ,'location=no,closebuttoncaption=종료');
      }
              this.browserRef.on("exit").subscribe((event)=>{
                  console.log("InAppBrowserEvent(exit):"+JSON.stringify(event)); 
                  this.browserRef.close();
              });
              this.browserRef.on("loadstart").subscribe((event:InAppBrowserEvent)=>{
                  console.log("InAppBrowserEvent(loadstart):"+String(event.url));
                  if(event.url.startsWith(this.storage.authReturnUrl)){ // Just testing. Please add success and failure into server 
                        console.log("cert success");
                        var strs=event.url.split("userPhone=");    
                        if(strs.length>=2){
                            var nameStrs=strs[1].split("userName=");
                            if(nameStrs.length>=2){
                                var userPhone=nameStrs[0];
                                var userSexStrs=nameStrs[1].split("userSex=");
                                var userName=userSexStrs[0];
                                var userAgeStrs=userSexStrs[1].split("userAge=");
                                var userSex=userAgeStrs[0];
                                var userAge=userAgeStrs[1];
                                console.log("userPhone:"+userPhone+" userName:"+userName+" userSex:"+userSex+" userAge:"+userAge);
                                let body = {userPhone:userPhone,userName:userName,userSex:userSex,userAge:userAge};
                                this.httpWrapper.post("/getUserInfo",body).then((res:any)=>{
                                    console.log("/getUserInfo res:"+JSON.stringify(res));
                                    if(res.result=="success"){
                                        resolve(res);
                                    }else{
                                        reject("invalidUserInfo");
                                    }
                                },(err)=>{
                                    if(err=="NetworkFailure"){
                                            let alert = this.alertCtrl.create({
                                                subTitle: '네트웍상태를 확인해 주시기바랍니다',
                                                buttons: ['OK']
                                            });
                                            alert.present();
                                    }
                                    reject(err);
                                });
                            } 
                            ///////////////////////////////
                        }
                        this.browserRef.close();
                        return;
                  }else if(event.url.startsWith(this.storage.authFailReturnUrl)){
                        console.log("cert failure");
                        this.browserRef.close();
                         reject();
                        return;
                  }
              });
    });
  }

  
}
