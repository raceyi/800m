import { Component,NgZone ,ViewChild} from '@angular/core';
import { IonicPage, NavController, Content, NavParams ,AlertController,Events} from 'ionic-angular';
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
  @ViewChild('content') contentRef: Content;  
  //type : join, exit, message(?)
  data = { type:'message', nickname:'kalen', message:'' };
  chats = [];
  roomkey:string;
  nickname:string;
  offStatus:boolean = false;

  chatInfo:any={};
  chatId;

  bankAccount;
  duplicateWithrawl;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl:AlertController,
              private storage:StorageProvider,
              private events:Events,
              private ngZone:NgZone,
              public server:ServerProvider) {
    
    this.chatId=navParams.get("chatId");
    console.log("chatId:"+this.chatId);
    let body={chatId:this.chatId};
    this.server.postWithAuth("/getChat",body).then((res:any)=>{
        //console.log("getChat-res:"+JSON.stringify(res));      
        this.chatInfo=res.chatInfo;
        /*
        //just for testing-begin
        this.chatInfo.contents.push({type:"action",text:"청구서류 안내",action:"청구서류",time:"2018-07-03 10:03:24.482",origin:"consultant"});
        this.chatInfo.contents.push({type:"action",text:"연체예방법 안내",action:"연체예방법",time:"2018-07-03 10:03:24.482",origin:"consultant"});
        this.chatInfo.contents.push({type:"action",text:"납입방법 안내",action:"납입방법",time:"2018-07-03 10:03:24.482",origin:"consultant"});
        //just for testing-end
        */
        this.chatInfo.contents.forEach(chat=>{
          chat.date=new Date(chat.time);
        })
         
        if(this.contentRef){
            this.contentRef.scrollToBottom();
          }
    },err=>{
          let alert = this.alertCtrl.create({
                  title: '상담내역을 불러오는데 실패했습니다.',
                  buttons: ['OK']
              });
          alert.present();
    })

    events.subscribe("newChat",(param)=>{
        let msg=param;
        msg.date=new Date(msg.time);
        console.log("contents:"+JSON.stringify(this.chatInfo.contents));
        if(msg.type=="action"&& msg.action=="exit"){
          let alert = this.alertCtrl.create({
                      title: '상담이 종료되었습니다.',
                      buttons: ['OK']
          });
          alert.present(); 
          this.navCtrl.pop();         
        }else{
          if(msg.type=="action" && msg.action==''){

          }else{
            this.ngZone.run(()=>{
                this.chatInfo.contents.push(param);
            });
            //if(this.contentRef && this.contentRef!=null){
            //    this.contentRef.scrollToBottom();
            //}
          }
        }
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    //move scroll to bottom
    this.contentRef.scrollToBottom();
  }

  sendMessage() {
    //send data
    let body={chatId:this.chatId,msg:{type:"text",text:this.data.message}};
    this.server.postWithAuth("/addChat",body).then((res:any)=>{
        //this.chatInfo.contents.unshift(res.msg);
          this.ngZone.run(()=>{
              console.log("res.msg:"+JSON.stringify(res.msg));
              let msg=res.msg;
              msg.date=new Date(msg.time);
              this.chatInfo.contents.push(msg);
          });
          this.contentRef.scrollToBottom();
    },err=>{
                let alert = this.alertCtrl.create({
                        title: '메시지 전달에 실패했습니다.',
                        buttons: ['OK']
                    });
                alert.present();    
    })     
    this.data.message = '';
  }

  ionViewWillLeave(){
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
  }

  exitChat(){
    this.navCtrl.pop();  
  }

  focus(){
     console.log("focus comes");
     this.contentRef.scrollToBottom();
  }
  
}
