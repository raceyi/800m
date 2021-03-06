import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {LoginPage} from '../pages/login/login';
import {ChatPage} from '../pages/chat/chat';
import {SignupPage} from '../pages/signup/signup';
import {TabsPage} from '../pages/tabs/tabs';
import { NativeStorage } from '@ionic-native/native-storage';
import { StorageProvider } from '../providers/storage/storage';
import { ConfigProvider } from '../providers/config/config';
import { ServerProvider } from '../providers/server/server';
import {CustomerInfoPage} from '../pages/customer-info/customer-info';

var gMyApp;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  //rootPage:any = TabsPage;
  //rootPage:any =ChatPage;
  
  constructor(platform: Platform, statusBar: StatusBar,
              private nativeStorage:NativeStorage,
              private storage:StorageProvider,
              private serverProvider:ServerProvider, 
              private config:ConfigProvider,
              splashScreen: SplashScreen) {
    gMyApp=this;
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if(this.storage.device){
          let passwordPromise=this.nativeStorage.getItem("password");
          let emailPromise=this.nativeStorage.getItem("email");

          Promise.all([passwordPromise, emailPromise]).then(function(values) {
              console.log(JSON.stringify(values));
              let password=storage.decryptValue("password",decodeURI(values[0]));
              let email=storage.decryptValue("email",decodeURI(values[1]));
              let body={email:email,password:password};
              console.log("email:"+email);
              console.log("password:"+password);
              serverProvider.postWithoutAuth('/consultant/login',body).then((res:any)=>{
                  if(res.result=="success"){
                    storage.saveLoginInfo(res);
                    gMyApp.rootPage=TabsPage;
                  }else{
                    gMyApp.rootPage=LoginPage;    
                  }  
              },err=>{
                  gMyApp.rootPage=LoginPage;  
              })
          },err=>{
              //move into error page
              this.rootPage=LoginPage;
          });
      }else{
              let email= config.testId;
              let password=config.testPassword; 
              let body={email:email,password:password};
              console.log("email:"+email);
              console.log("password:"+password);
              serverProvider.postWithoutAuth('/consultant/login',body).then((res:any)=>{
                    if(res.result=="success"){
                    storage.saveLoginInfo(res);
                    gMyApp.rootPage=TabsPage;
                  }else{
                    gMyApp.rootPage=LoginPage;    
                  }  
              },err=>{
                  gMyApp.rootPage=LoginPage;  
              })
      }
      statusBar.styleDefault();
      splashScreen.hide();
    });
    
  }
}

