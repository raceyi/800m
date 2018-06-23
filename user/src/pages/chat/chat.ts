import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  //type : join, exit, message(?)
  data = { type:'message', nickname:'kalen', message:'' };
  chats = [];
  roomkey:string;
  nickname:string;
  offStatus:boolean = false;


  constructor(public navCtrl: NavController, public navParams: NavParams) {

//db.createCollection("mycol", { capped : true, autoIndexId : true, size : 
//   6142800, max : 10000 } )
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
  }

  sendMessage() {
    //send data
    this.chats.push({type: 'message',user:this.data.nickname ,message:this.data.message,sendDate:Date()});
    
    this.data.message = '';
  }

  onChange(event){
    console.log("event:"+JSON.stringify(event));
  }
}
