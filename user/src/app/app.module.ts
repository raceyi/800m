import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {LoginPageModule} from '../pages/login/login.module';
import {SignupPageModule} from '../pages/signup/signup.module';
import {SearchConsultantPageModule} from '../pages/search-consultant/search-consultant.module';
import {CheckConsultantPageModule} from '../pages/check-consultant/check-consultant.module';
import {GreetingPageModule} from '../pages/greeting/greeting.module';
import { StorageProvider } from '../providers/storage/storage';
import {ChatPageModule} from '../pages/chat/chat.module';
import {SocialNumberPageModule} from '../pages/social-number/social-number.module';
import {MyPageModule} from '../pages/my/my.module';
import { ServerProvider } from '../providers/server/server';
import { HttpWrapperProvider } from '../providers/http-wrapper/http-wrapper';
import { ConfigProvider } from '../providers/config/config';
import { InAppBrowser } from '@ionic-native/in-app-browser'
import {HTTP} from '@ionic-native/http'
import {InsurancePageModule} from '../pages/insurance/insurance.module';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import {BankAccountPageModule} from '../pages/bank-account/bank-account.module';
import {ChatEntrancePageModule} from '../pages/chat-entrance/chat-entrance.module';
import {MyErrorHandler} from '../classes/my-error-handler';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { NativeStorage } from '@ionic-native/native-storage';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { Media, MediaObject } from '@ionic-native/media';
import {CustomIconsModule} from 'ionic2-custom-icons';
import {PasswordResetPageModule} from '../pages/password-reset/password-reset.module';
import{ConfigurePasswordPageModule} from '../pages/configure-password/configure-password.module';
import { Device } from '@ionic-native/device';

@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    DragulaModule,    
    BrowserModule,
    HttpClientModule,
    InsurancePageModule,
    SocialNumberPageModule,
    LoginPageModule,
    SignupPageModule,
    SearchConsultantPageModule,
    CheckConsultantPageModule,
    GreetingPageModule,
    ChatPageModule,
    BankAccountPageModule,
    ChatEntrancePageModule,
    MyPageModule,
    PasswordResetPageModule,
    ConfigurePasswordPageModule,
    CustomIconsModule,
    IonicModule.forRoot(MyApp,{mode:'ios',animate:false})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: MyErrorHandler},
    HTTP,  
    Media,  
    Push,
    Device,
    NativeStorage,
    InAppBrowser,  
    StorageProvider,
    ServerProvider,
    HttpWrapperProvider,
    ConfigProvider
  ]
})
export class AppModule {}
