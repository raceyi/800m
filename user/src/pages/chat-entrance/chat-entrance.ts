import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ChatPage} from '../chat/chat';
import {ServerProvider} from '../../providers/server/server';

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

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public server:ServerProvider,
              private alertCtrl:AlertController,
              public storage:StorageProvider) {
    //this.storage.name="홍길동";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatEntrancePage');
  }

  close(){
    this.navCtrl.pop();
  }

  chat(type){
     let body={type:type,consutlantId:this.storage.consultantId};

    this.server.postWithAuth("/createNewChat",body).then((res:any)=>{
        if(res.result=="success"){
            this.storage.chatId=res.chatId;
            this.navCtrl.push(ChatPage);
        }else{
          let alert = this.alertCtrl.create({
                      title: '설계사분과 연락에 실패했습니다.',
                      subTitle:'전화를 사용해 주시기 바랍니다',
                      buttons: ['OK']
          });
          alert.present();
        }
    },err=>{
        let alert = this.alertCtrl.create({
                    title: '설계사분과 연락에 실패했습니다.',
                    subTitle:'전화를 사용해 주시기 바랍니다',
                    buttons: ['OK']
        });
        alert.present();
    })  
  }
}
