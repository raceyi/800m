import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams ,Content} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {SearchConsultantPage} from '../search-consultant/search-consultant';

/**
 * Generated class for the BankAccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bank-account',
  templateUrl: 'bank-account.html',
})
export class BankAccountPage {
@ViewChild('bankAccount') contentRef: Content;

 lowBalance:number;
 showDone:boolean=false;

 accounts=[{bankName:"IBK기업",accountNo:"010*****8320", selection:false},
           {bankName:"우리"   ,accountNo:"1002*****9408", selection:false},
           {bankName:"농협"   ,accountNo:"3482*****2783", selection:false}];

  constructor(public navCtrl: NavController,
               public navParams: NavParams,
               public storage: StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BankAccountPage');
  }

  focus(){
     this.contentRef.scrollToBottom();
     this.showDone=true;
  }

  blur(){
     //this.showDone=false;
  }

  next(){
    this.showDone=true;
    this.navCtrl.push( SearchConsultantPage);
  }
}
