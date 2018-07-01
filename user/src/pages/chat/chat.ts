import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController} from 'ionic-angular';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';

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


  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl:AlertController,
              private storage:StorageProvider,
              public server:ServerProvider) {

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

  exitChat(){
    let body={chatId:this.storage.chatId};
    this.server.postWithAuth("/terminateChat",body).then((res)=>{
          let alert = this.alertCtrl.create({
                      title: '상담을 종료합니다.',
                      buttons: ['OK']
          });
          alert.present();
    },err=>{
          let alert = this.alertCtrl.create({
                      title: '상담을 종료에 실패했습니다.',
                      buttons: ['OK']
          });
          alert.present();       
    })
    this.navCtrl.pop();
  }
}
