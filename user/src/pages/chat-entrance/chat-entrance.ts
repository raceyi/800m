import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ChatPage} from '../chat/chat';

/**
 * Generated class for the ChatEntrancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat-entrance',
  templateUrl: 'chat-entrance.html',
})
export class ChatEntrancePage {

  constructor(public navCtrl: NavController, public navParams: NavParams,public storage:StorageProvider) {
    this.storage.name="홍길동";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatEntrancePage');
  }

  close(){
    this.navCtrl.pop();
  }

  chat(type){
      this.navCtrl.push(ChatPage,{type:type});
  }
}
