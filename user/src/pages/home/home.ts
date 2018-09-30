import { Component } from '@angular/core';
import { NavController,AlertController ,Platform} from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {ChatEntrancePage} from '../chat-entrance/chat-entrance';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {BankAccountPage} from '../bank-account/bank-account';
import {MyPage} from '../my/my';
import {SearchConsultantPage} from '../search-consultant/search-consultant';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
/*
  insurances:any=[
          {month:6, name:'동부화재자동차', preminum:true},
          {month:6,name:'동양생명실비보험', preminum:true},
          {month:6,name:'메리츠화재보험', preminum:false},
          {month:5,name:'동부화재자동차', preminum:true},
          {month:5,name:'동양생명실비보험', preminum:true},
          {month:5,name:'메리츠화재보험', preminum:false}];
*/

 // lastQueryChatTime;
 // chatList=[];


  constructor(public navCtrl: NavController,
              public storage:StorageProvider,
              public server:ServerProvider,
              private platform:Platform,
              private alertCtrl:AlertController) {

    platform.ready().then(() => {
        this.server.registerPushService(); 
        this.server.lastQueryChatTime=new Date();
   });    
  }

  ionViewWillEnter() {
        console.log("ionViewWillEnter-homePage");
        let now=new Date();
        this.server.lastQueryChatTime=new Date(now.getTime()+1*60*1000); // one minute later. 서버의 시차문제가 있을수 있다. 
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
        });
  }

    doInfinite(infiniteScroll) {
        console.log('Begin async operation');
        this.server.getUserChats().then((chats:any)=>{
          if(chats.length>0){
              console.log("more is true");
              chats.forEach(chat=>{
                    this.storage.chatList.push(chat);
              })
              infiniteScroll.complete();
          }else{
              console.log("more is false");
              infiniteScroll.enable(false); //stop infinite scroll
          }
        },err=>{
              // hum...
        });
    }



  withdrawal(insurance){
              let alert = this.alertCtrl.create({
                    title: "우리은행 1002*****9408 계좌에서 "+ insurance.monthPremium+"원을 납부합니다.",
                   buttons: [
                                    {
                                        text: '아니오',
                                        handler: () => {
                                        }
                                    },
                                    {
                                        text: '네',
                                        handler: () => {
                                            insurance.preminum=true;   
                                        }
                                    }
                                ]
                });
                alert.present();
  }

  openChat(){
        this.navCtrl.push(ChatEntrancePage,{class:'ChatEntrancePage'});
  }

  configureBounds(){
        this.navCtrl.push(MyPage);
  }

  enterChat(chat){
      console.log("enterChat:"+JSON.stringify(chat));
      this.storage.chatId=chat._id;
      this.navCtrl.push(ChatPage, {chatId:chat._id, class:"ChatPage"});
  }

  specifyConsultant(){
      this.navCtrl.push(SearchConsultantPage);
  }
}
