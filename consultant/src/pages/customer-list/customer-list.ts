import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CustomerPage} from '../customer/customer';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';

/**
 * Generated class for the CustomerListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-customer-list',
  templateUrl: 'customer-list.html',
})
export class CustomerListPage {
  filter="twoMonth";
  sortValue="character";

  textClasses={
    redcolor: true,
    greencolor:false,
   };

  constructor(public navCtrl: NavController, public navParams: NavParams, 
              public storage: StorageProvider,                
              private server:ServerProvider) {
  }

  selectColor(){
    if(this.filter=="twoMonth"){
        return "#ff6e6e";
    }else if(this.filter=="oneMonth"){
        return "#00c161";
    }
    return "black";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerListPage');
  }

  moveToCustomerInfo(){
    this.navCtrl.push(CustomerPage);
  }

  sortByCharacter(){
    this.storage.sortByCharacter();
  }

  sortByContact(){
    this.storage.sortByContact();
  }
}
