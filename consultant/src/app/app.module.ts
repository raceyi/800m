import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import {LoginPageModule} from '../pages/login/login.module';
import {SignupPageModule} from '../pages/signup/signup.module';
import {GreetingPageModule} from '../pages/greeting/greeting.module';
import { StorageProvider } from '../providers/storage/storage';
import {CalendarPageModule} from '../pages/calendar/calendar.module';
import {CustomerContactPageModule} from '../pages/customer-contact/customer-contact.module';
import {CustomerListPageModule} from '../pages/customer-list/customer-list.module';
import {InformationPageModule} from '../pages/information/information.module';
import {TabsPage} from '../pages/tabs/tabs';
import { CalendarModule } from "ion2-calendar";
import {ChatPageModule} from '../pages/chat/chat.module';
import { HttpClientModule } from '@angular/common/http';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import {ChatEntrancePageModule} from '../pages/chat-entrance/chat-entrance.module';
import {CustomerInfoPageModule} from '../pages/customer-info/customer-info.module';
import { NativeStorage } from '@ionic-native/native-storage';
import { ServerProvider } from '../providers/server/server';
import { HttpWrapperProvider } from '../providers/http-wrapper/http-wrapper';
import { ConfigProvider } from '../providers/config/config';
import { InAppBrowser } from '@ionic-native/in-app-browser'
import {HTTP} from '@ionic-native/http'
import { Media, MediaObject } from '@ionic-native/media';

import {MyErrorHandler} from '../classes/my-error-handler';

@NgModule({
  declarations: [
    MyApp,
    TabsPage
  ],
  imports: [
    CustomerInfoPageModule,
    ChatEntrancePageModule,
    ChatPageModule,
    CalendarModule,
    InformationPageModule,
    CustomerListPageModule,
    CustomerContactPageModule,
    CalendarPageModule,
    LoginPageModule,
    SignupPageModule,
    GreetingPageModule,
    BrowserModule,
    HttpClientModule,    
    IonicModule.forRoot(MyApp,{mode:'ios',animate:false})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
  ],
  providers: [
    StorageProvider,
    HTTP,    
    InAppBrowser,  
    ServerProvider,
    HttpWrapperProvider,
    ConfigProvider,
    StatusBar,
    SplashScreen,
    NativeStorage,
    Push,
    Media,
    {provide: ErrorHandler, useClass: MyErrorHandler}
  ]
})
export class AppModule {}
