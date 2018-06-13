import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {GreetingPage} from '../greeting/greeting';

/**
 * Generated class for the CheckConsultantPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-check-consultant',
  templateUrl: 'check-consultant.html',
})
export class CheckConsultantPage {
  consultant;
  constructor(public navCtrl: NavController, public navParams: NavParams,public storage: StorageProvider) {
    //let consultant=navParams.get('consultant'); 
    //this.storage.consultantName=consultant.name;
    this.consultant="이송미";

    this.storage.consultantName=this.consultant;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CheckConsultantPage');
  }

  found(){
    this.navCtrl.push(GreetingPage);
  }
}
