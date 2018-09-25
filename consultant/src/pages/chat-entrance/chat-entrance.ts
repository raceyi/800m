import { Component } from '@angular/core';
import { IonicPage, ViewController,NavController, NavParams,AlertController,App } from 'ionic-angular';
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
  userId;
  name;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public server:ServerProvider,
              private alertCtrl:AlertController,
              public app:App,
              public storage:StorageProvider) {

      this.userId=this.navParams.get("userId");
      this.name=this.navParams.get("name");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatEntrancePage');
  }

  close(){
    this.navCtrl.pop();
  }

  chat(type){
     let body={type:type ,userId:this.userId};

    this.server.postWithAuth("/consultant/createNewChat",body).then((res:any)=>{
      console.log("createNewChat-res:"+JSON.stringify(res));
        if(res.result=="success"){
            console.log("res:"+JSON.stringify(res));
            this.navCtrl.push(ChatPage, {chatId:res.chatId, class:"ChatPage",name:this.name});
        }else{
          let alert = this.alertCtrl.create({
                      title: '고객분과 연락에 실패했습니다.',
                      subTitle:'전화를 사용해 주시기 바랍니다',
                      buttons: ['OK']
          });
          alert.present();
        }
    },err=>{
        console.log("createNewChat-err:"+JSON.stringify(err));
        if(err!="duplicate chat"){
          let alert = this.alertCtrl.create({
                      title: '고객분과 연락에 실패했습니다.',
                      subTitle:'전화를 사용해 주시기 바랍니다',
                      buttons: ['OK']
          });
          alert.present();
        }
    })  
  }
}
