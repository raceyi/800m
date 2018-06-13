import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {HomePage} from '../home/home';

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
    this.storage.name="홍길동";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GreetingPage');
  }

  start(){
    this.navCtrl.push(HomePage);
  }
}
