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

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;
  //rootPage:any = ChatPage;
  //rootPage:any =SocialNumberPage;
  //rootPage:any =InsurancePage;
  //rootPage:any =BankAccountPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

