import { Component } from '@angular/core';
import { NavController,AlertController ,Platform} from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {ChatEntrancePage} from '../chat-entrance/chat-entrance';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {BankAccountPage} from '../bank-account/bank-account';
import {MyPage} from '../my/my';

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

  lastQueryChatTime;
  chatList=[];


  constructor(public navCtrl: NavController,
              public storage:StorageProvider,
              public server:ServerProvider,
              private platform:Platform,
              private alertCtrl:AlertController) {

    platform.ready().then(() => {
        this.server.registerPushService(); 
        this.lastQueryChatTime=new Date();
   });    
  }

  ionViewWillEnter() {
        this.getUserChats().then((chats:any)=>{
            if(chats.length>0){
                console.log("more is true");
                chats.forEach(chat=>{
                        this.chatList.push(chat);
                })
            }else{
                console.log("more is false");
            }
        });
  }

    doInfinite(infiniteScroll) {
        console.log('Begin async operation');
        this.getUserChats().then((chats:any)=>{
          if(chats.length>0){
              console.log("more is true");
              chats.forEach(chat=>{
                    this.chatList.push(chat);
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

    getUserChats(){
        return new Promise((resolve,reject)=>{
              let body={ queryTime:this.lastQueryChatTime,limit:10};
              //server에 저장되는 chatting time이  ios시간인가? 아니면 local time인가??? 확인이 필요하다.ㅜ....
              this.server.postWithAuth("/getUserChats",body).then((res:any)=>{
                  if(res.result=="failure"){
                      reject(res.error);
                  }else{
                    if(res.chats){
                            let chats=res.chats;
                            chats.sort(function(a, b){
                                let aDate=new Date(a.date);
                                let bDate=new Date(b.date);
                                if(aDate>bDate){
                                    return -1;
                                }else if(aDate<bDate){
                                    return 1;
                                }
                                return 0;
                            });
                            let lastIndex=chats.length-1;
                            if(lastIndex>=0)
                                this.lastQueryChatTime=chats[lastIndex].date;
                            chats.forEach(chat=>{
                                chat.timeString=chat.date.substr(0,4)+"년 "+chat.date.substr(5,2)+"월 "+chat.date.substr(8,2)+"일";
                            })    
                            resolve(chats);
                    }else{ //no more chats
                        resolve([]);
                    }
                  }
              },err=>{
                  let alert = this.alertCtrl.create({
                                  title: '네트웍상태를 확인해주세요.',
                                  buttons: ['OK']
                              });
                  alert.present();
                  reject(err);
              })
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
}
