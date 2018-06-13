import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {CheckConsultantPage} from '../check-consultant/check-consultant';

/**
 * Generated class for the SearchConsultantPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search-consultant',
  templateUrl: 'search-consultant.html',
})
export class SearchConsultantPage {

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storage: StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchConsultantPage');
  }

  search(){
      this.navCtrl.push(CheckConsultantPage,{consultant:'이송미'});
  }
}
