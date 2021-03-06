import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import {LoginPage} from '../pages/login/login';
import {SignupPage} from '../pages/signup/signup';
import {SearchConsultantPage} from '../pages/search-consultant/search-consultant';
import {CheckConsultantPage} from '../pages/check-consultant/check-consultant';
import {GreetingPage} from '../pages/greeting/greeting';
import {ChatPage} from '../pages/chat/chat';
import {SocialNumberPage} from '../pages/social-number/social-number';
import {InsurancePage} from '../pages/insurance/insurance';
import {BankAccountPage} from '../pages/bank-account/bank-account';
import {ChatEntrancePage} from '../pages/chat-entrance/chat-entrance';
import { NativeStorage } from '@ionic-native/native-storage';
import { StorageProvider } from '../providers/storage/storage';
import { ServerProvider } from '../providers/server/server';
import { ConfigProvider} from '../providers/config/config';

var gMyApp;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  //rootPage:any = LoginPage;
  //rootPage:any = ChatEntrancePage;
  //rootPage:any =SocialNumberPage;
  //rootPage:any =InsurancePage;
  //rootPage:any =BankAccountPage;
  //rootPage:any = HomePage;
  //rootPage:any = ChatPage;
  constructor(platform: Platform, statusBar: StatusBar, 
              private storage:StorageProvider,
              private config:ConfigProvider,
              splashScreen: SplashScreen,
              private serverProvider:ServerProvider,
              private nativeStorage:NativeStorage) {

    gMyApp=this;

    platform.ready().then(() => {
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
              serverProvider.postWithoutAuth('/login',body).then((res:any)=>{
                  if(res.result=="success"){
                        console.log("res.userInfo:"+JSON.stringify(res.userInfo));
                        storage.storeUserInfo(res);
                        if(!storage.consultantId){
                            gMyApp.rootPage=SearchConsultantPage;
                        }else{
                            gMyApp.rootPage = HomePage;
                        }
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
        }else{ //Just for testing
              let body={email:this.config.testId,password:this.config.testPassword};
              serverProvider.postWithoutAuth('/login',body).then((res:any)=>{
                  if(res.result=="success"){
                        console.log("res.userInfo:"+JSON.stringify(res.userInfo));
                        storage.storeUserInfo(res);
                        storage.email=this.config.testId; 
                        if(!storage.consultantId){
                            gMyApp.rootPage=SearchConsultantPage;
                        }else{
                            gMyApp.rootPage = HomePage;
                        }
                  }else{
                        gMyApp.rootPage=LoginPage; 
                  }
              });
        }
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

