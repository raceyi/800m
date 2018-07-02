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
import { ServerProvider } from '../providers/server/server';

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
              splashScreen: SplashScreen) {
    gMyApp=this;
    
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

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
                    storage.saveLoginInfo(res);
                    gMyApp.rootPage=TabsPage;  
              },err=>{
                  gMyApp.rootPage=LoginPage;  
              })
          },err=>{
              //move into error page
              this.rootPage=LoginPage;
          });

      statusBar.styleDefault();
      splashScreen.hide();
    });
    
  }
}

