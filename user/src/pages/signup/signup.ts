import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {SocialNumberPage} from '../social-number/social-number';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
    phone;
    name;
    birthYear;
    birthMonth;
    birthDay;
    password;
    passwordConfirm;
    
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storage: StorageProvider) {
    //let user=navParams.get('user'); 
    let user={name:'홍길동', phone:'01012341234',birthDate:'19800111'}
    this.name=user.name;
    this.phone=this.autoHypenPhone(user.phone);
    this.birthYear=user.birthDate.substr(0,4);
    this.birthMonth=user.birthDate.substr(4,2);
    this.birthDay=user.birthDate.substr(6,2);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

    autoHypenPhone(str) {
        str = str.replace(/[^0-9]/g, '');
        var tmp = '';
        if (str.length >= 2 && str.startsWith('02')) {
            tmp += str.substr(0, 2);
            tmp += '-';
            if (str.length < 7) {
                tmp += str.substr(2);
            }
            else {
                tmp += str.substr(2, 3);
                tmp += '-';
                tmp += str.substr(5);
            }
            return tmp;
        }
        else if (str.length < 4) {
            return str;
        }
        else if (str.length < 7) {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3);
            return tmp;
        }
        else if (str.length < 11) {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3, 3);
            tmp += '-';
            tmp += str.substr(6);
            return tmp;
        }
        else {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3, 4);
            tmp += '-';
            tmp += str.substr(7);
            return tmp;
        }
    };
    
    cancel(){
      this.navCtrl.pop();
    }

    signup(){
      //console.log("signup comes");
     this.storage.name=this.name;
     this.storage.phone=this.phone;
     this.storage.birthYear=this.birthYear;
     this.storage.birthMonth=this.birthMonth;
     this.storage.birthDay=this.birthDay;
     this.navCtrl.push(SocialNumberPage);
    }
}
