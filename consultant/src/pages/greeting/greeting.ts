import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {TabsPage} from '../tabs/tabs';

/**
 * Generated class for the GreetingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-greeting',
  templateUrl: 'greeting.html',
})
export class GreetingPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,public storage:StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GreetingPage');
  }

  start(){
     this.navCtrl.push(TabsPage);
  }
}
