import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';

/**
 * Generated class for the CustomerContactPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-customer-contact',
  templateUrl: 'customer-contact.html',
})
export class CustomerContactPage {

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storage: StorageProvider,                
              private server:ServerProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerContactPage');
  }

  chat(){
    console.log("chat comes");
    this.navCtrl.push(ChatPage)
  }
}
