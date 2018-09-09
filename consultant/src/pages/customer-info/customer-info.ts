import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App ,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {ChatEntrancePage} from '../chat-entrance/chat-entrance';

/**
 * Generated class for the CustomerInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-customer-info',
  templateUrl: 'customer-info.html',
})
export class CustomerInfoPage {
  user;
  birth;
  phone;
  email;
  name;
  lastQueryChatTime;
  mailto:string;
  tel:string;
  chatList=[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public storage: StorageProvider,  
              public app:App,             
              private alertCtrl:AlertController, 
              private server:ServerProvider) {

    this.user=this.navParams.get("user");
    console.log("user:"+JSON.stringify(this.user));
    this.name=this.user.name;
    this.birth=this.user.birth.substr(0,4)+"."+this.user.birth.substr(4,2)+"."+this.user.birth.substr(6,2);
    this.email=this.user.email;
    this.phone=this.autoHypenPhone(this.user.phone);
    this.mailto="mailto:"+this.email;
    this.tel="tel:"+this.user.phone;
    this.lastQueryChatTime=new Date();
    
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerInfoPage');
  }

    autoHypenPhone(str) {
        str = str.replace(/[^0-9]/g, '');
        var tmp = '';
        if (str.length >= 2 && str.startsWith('02')) {
            tmp += str.substr(0, 2);
            tmp += '-';
            if (str.length < 7) {
                tmp += str.substr(2);
            }
            else {
                tmp += str.substr(2, 3);
                tmp += '-';
                tmp += str.substr(5);
            }
            return tmp;
        }
        else if (str.length < 4) {
            return str;
        }
        else if (str.length < 7) {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3);
            return tmp;
        }
        else if (str.length < 11) {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3, 3);
            tmp += '-';
            tmp += str.substr(6);
            return tmp;
        }
        else {
            tmp += str.substr(0, 3);
            tmp += '-';
            tmp += str.substr(3, 4);
            tmp += '-';
            tmp += str.substr(7);
            return tmp;
        }
    };

    back(){
      this.navCtrl.pop();
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
              let body={userId:this.user._id, queryTime:this.lastQueryChatTime,limit:10};
              //server에 저장되는 chatting time이  ios시간인가? 아니면 local time인가??? 확인이 필요하다.ㅜ....
              this.server.postWithAuth("/consultant/getUserChats",body).then((res:any)=>{
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

  openChat(user){
    console.log("openChat "+JSON.stringify(user));
    this.app.getRootNavs()[0].push(ChatEntrancePage,{userId:user._id,name:user.name,class:'ChatEntrancePage'});
  }

}
