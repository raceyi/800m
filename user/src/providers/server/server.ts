import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InAppBrowser,InAppBrowserEvent } from '@ionic-native/in-app-browser';
import {AlertController,LoadingController,Platform} from 'ionic-angular';
import {StorageProvider} from '../storage/storage';
import {HttpWrapperProvider} from '../http-wrapper/http-wrapper';
import { NativeStorage } from '@ionic-native/native-storage';
import {ConfigProvider} from "../config/config";

/*
  Generated class for the ServerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ServerProvider {

  browserRef;

  constructor(public http: HttpClient
              ,private storage:StorageProvider
              ,private iab: InAppBrowser
              ,public alertCtrl:AlertController              
              ,private httpWrapper:HttpWrapperProvider
              ,private nativeStorage:NativeStorage
              ,private platform:Platform)  {
    console.log('Hello ServerProvider');
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
