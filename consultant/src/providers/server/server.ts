import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';
import {AlertController,LoadingController,Platform,App,Events} from 'ionic-angular';
import {StorageProvider} from '../storage/storage';
import {HttpWrapperProvider} from '../http-wrapper/http-wrapper';
import { NativeStorage } from '@ionic-native/native-storage';
import {ConfigProvider} from "../config/config";
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Media, MediaObject } from '@ionic-native/media';

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {

  browserRef;

  userSenderID="956277141611";
  pushNotification:PushObject;
  file:MediaObject;

  constructor(public http: HttpClient
              ,private storage:StorageProvider
              ,private iab: InAppBrowser
              ,public alertCtrl:AlertController              
              ,private httpWrapper:HttpWrapperProvider
              ,private nativeStorage:NativeStorage
              ,private platform:Platform
              ,private app:App
              ,private events:Events
              ,private media: Media
              ,private push: Push)  {
    console.log('Hello ServerProvider');
    platform.ready().then(() => {
        this.registerPushService(); 
        if(this.platform.is('android'))
            this.file = this.media.create('file:///android_asset/www/assets/appbeep.wav');
        else{
            this.file = this.media.create('assets/appbeep.wav');
        }
        this.file.onStatusUpdate.subscribe(status => console.log(status)); // fires when file status changes
        this.file.onSuccess.subscribe(() => {
            console.log('Action is successful');
        });
        this.file.onError.subscribe(error => console.log('Error! '+JSON.stringify(error)));
    });    
  }

   updateChats(){
        return new Promise((resolve,reject)=>{
            this.postWithAuth("/consultant/getChats",{}).then((res:any)=>{
                this.storage.chats=res.chats;
                this.storage.contactList=[];
                console.log("updateChats-begin");
                this.storage.convertChatsToList();
                console.log("updateChats-end");
            },error=>{
                let alert = this.alertCtrl.create({
                            title: '서버로부터 상담 정보를 가져오는데 실패했습니다.',
                            buttons: ['OK']
                        });
                alert.present();
            })
        });        
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

              this.postWithAuth("/consultant/registrationId",body).then((res:any)=>{
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
                console.log("pushNotification.on-data:"+JSON.stringify(data));
                //time:chatInfo.date, type:"action",action:"response",message:req.body.type+"상담문의"
                //1.음성 playback
                this.file.play();
                //2.customer-contact에 반영하기
                this.updateChats(); 
                //3.tabs page의 countBadge 재계산
                //compute countBadge-NEW의 갯수를 세면 된다.
                this.events.publish("newChat",data.additionalData.custom);
            });

            this.pushNotification.on('error').subscribe((e:any)=>{
                console.log(e.message);
            });
    }

    postWithAuth(url,bodyIn){ 
        return new Promise((resolve,reject)=>{
          this.httpWrapper.post(url,bodyIn).then((res)=>{
            resolve(res);
          },err=>{
            console.log("post-err:"+JSON.stringify(err));
                if(err.hasOwnProperty("status") && err.status==401){
                    //login again with id
                    this.loginAgain().then(()=>{
                        //call http post again
                        this.httpWrapper.post(url,bodyIn).then((res:any)=>{
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
                            resolve(res.json());  
                         },(err)=>{
                             reject("NetworkFailure");
                         });
                    },(err)=>{
                        reject(err);
                    });
                 }else{
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
