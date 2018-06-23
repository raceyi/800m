import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the SocialNumberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-social-number',
  templateUrl: 'social-number.html',
})
export class SocialNumberPage {
  birth;
  socialNumber;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
               public storage: StorageProvider) {

  this.birth=this.storage.birthYear+
              this.storage.birthMonth+
              this.storage.birthDay;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SocialNumberPage');
  }

/*
  inputSocialNumber(){
      if(this.socialNumber && this.socialNumber.length==7){

      }
  }
*/

  checkSocialNumber(){
    
  }
}
