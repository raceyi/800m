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

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public server:ServerProvider,
              private alertCtrl:AlertController,
              public app:App,
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
     let body={type:type,consultantId:this.storage.consultantId};

    this.server.postWithAuth("/createNewChat",body).then((res:any)=>{
        console.log("res:"+JSON.stringify(res));
        if(res.result=="success"){
            this.storage.chatId=res.chatId;
            /* 필요없다. homePage의 ionViewWillEnter가 호출되지 않을 경우 사용한다.
            //update chatList of storage
            this.server.lastQueryChatTime=new Date();
            this.storage.chatList=[];
            this.server.getUserChats().then((chats:any)=>{
              if(chats.length>0){
                  console.log("more is true");
                  chats.forEach(chat=>{
                          this.storage.chatList.push(chat);
                  })
              }else{
                  console.log("more is false");
              }
            },err=>{
                let alert = this.alertCtrl.create({
                                  title: '서버와 통신에 실패했습니다.',
                                  buttons: ['OK']
                        });
                        alert.present();
            });
            */
            this.navCtrl.push(ChatPage, {chatId:res.chatId, class:"ChatPage"});
        }else{
          if(res.error=="duplicate chat"){
              console.log("Just ignore it due to duplication chat");
          }else{
            let alert = this.alertCtrl.create({
                      title: '설계사분과 연락에 실패했습니다.',
                      subTitle:'전화를 사용해 주시기 바랍니다',
                      buttons: ['OK']
            });
            alert.present();
          }
        }
    },err=>{
      console.log("createNewChat-err:"+JSON.stringify(err));
      if(err!="duplicate chat"){
        let alert = this.alertCtrl.create({
                    title: '설계사분과 연락에 실패했습니다.',
                    subTitle:'전화를 사용해 주시기 바랍니다',
                    buttons: ['OK']
        });
        alert.present();
      }
    })  
  }
}
