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
import {CustomerPageModule} from '../pages/customer/customer.module';

@NgModule({
  declarations: [
    MyApp,
    TabsPage
  ],
  imports: [
    CustomerPageModule,
    CalendarModule,
    InformationPageModule,
    CustomerListPageModule,
    CustomerContactPageModule,
    CalendarPageModule,
    LoginPageModule,
    SignupPageModule,
    GreetingPageModule,
    BrowserModule,
    IonicModule.forRoot(MyApp,{mode:'ios'})
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
  ],
  providers: [
    StorageProvider,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
