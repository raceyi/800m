import { Component ,ViewChild,NgZone} from '@angular/core';
import { IonicPage, NavController, Events,NavParams ,AlertController,Content} from 'ionic-angular';
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
  userName;
  data = { type:'message', nickname:'kalen', message:'' };
  //chats = [];
  roomkey:string;
  nickname:string;
  offStatus:boolean = false;

  chatId;
  chatInfo:any={};

  actionHide:boolean=true;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl:AlertController,
              private ngZone:NgZone,
              private events:Events, // 나중에 EventEmitter로 변경하자. Events는 오류가 있는듯싶다. ㅜㅜ 
              private storage:StorageProvider,
              public server:ServerProvider) {

    this.chatId=navParams.get("chatId");
    this.userName=navParams.get("name");
    console.log("this.chatId:"+navParams.get("chatId"));

    let body={chatId:this.chatId};
    this.server.postWithAuth("/consultant/getChat",body).then((res:any)=>{
        console.log("res:"+JSON.stringify(res));      
        this.ngZone.run(()=>{
          this.chatInfo=res.chatInfo;
          this.chatInfo.contents.forEach(chat=>{
            chat.date=new Date(chat.time);
          })
          if(this.contentRef){
            this.contentRef.scrollToBottom();
          }
        });
        console.log("chatInfo:"+JSON.stringify(this.chatInfo));
        if(this.chatInfo.lastOrigin=="user" && this.chatInfo.confirm==false){
             //update chatInfo
             this.server.postWithAuth("/consultant/confirmChat",body).then((res:any)=>{
                   //화면에서 나갈때 업데이트한다. 
             },err=>{
                let alert = this.alertCtrl.create({
                        title: '서버와 통신에 실패했습니다.',
                        buttons: ['OK']
                    });
                alert.present();               
             })
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
        console.log("!!!newChat:"+JSON.stringify(msg));
        console.log("msg.chatId:"+msg.chatId);
        if(msg.chatId==this.chatId){
            console.log("type:"+msg.type+ "action:"+msg.action);
            if(msg.type=="action"&& msg.action && msg.action=="exit"){
                let alert = this.alertCtrl.create({
                            title: '상담이 종료되었습니다.',
                            buttons: ['OK']
                });
                alert.present(); 
                this.navCtrl.pop();         
            }else{
                this.ngZone.run(()=>{
                    msg.date=new Date(msg.time);
                    let lastIndex=this.chatInfo.contents.length-1;
                    console.log("lastIndex time:"+this.chatInfo.contents[lastIndex].time);
                    console.log("param time:"+param.time);
                    if(this.chatInfo.contents[lastIndex].time!=param.time){  
                        this.chatInfo.contents.push(param);
                    }
                });
                console.log("this.contentRef:"+this.contentRef);
                //if(this.contentRef && this.contentRef!=null)
                //    this.contentRef.scrollToBottom();
                let body={chatId:this.chatId};
                this.server.postWithAuth("/consultant/confirmChat",body).then((res:any)=>{
                    //화면에서 나갈때 업데이트한다. 
                },err=>{
                    let alert = this.alertCtrl.create({
                            title: '서버와 통신에 실패했습니다.',
                            buttons: ['OK']
                        });
                    alert.present();               
                })
            }
        }
    });
  }

  ionViewWillLeave(){
    /* button을 추가하자.  
    let body={chatId:this.chatId};
    this.server.postWithAuth("/consultant/terminateChat",body).then((res)=>{
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
    */
    let views=this.navCtrl.getViews();
        views.forEach(view=>{
            console.log("view:"+view.getNavParams().get("class"));
            if(view.getNavParams().get("class")!=undefined){
                console.log("class:"+view.getNavParams().get("class"));
                if(view.getNavParams().get("class")=="ChatEntrancePage")  {
                        console.log("remove "+view.getNavParams().get("class"));
                        this.navCtrl.removeView(view);
                }
            }
        })
/*        
      //chat정보를 서버로 부터 가져온다.
      this.server.updateChats().then(()=>{

      },err=>{
                let alert = this.alertCtrl.create({
                        title: '서버와 통신에 실패했습니다.',
                        buttons: ['OK']
                    });
                alert.present();    
      });
*/      
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    //move scroll to bottom
    this.contentRef.scrollToBottom();
  }

  sendMessage() {
    //send data
    //this.chats.push({type: 'message',user:this.data.nickname ,message:this.data.message,sendDate:Date()});
    let body={chatId:this.chatId,msg:{type:"text",text:this.data.message}};
    this.server.postWithAuth("/consultant/addChat",body).then((res:any)=>{
        //this.chatInfo.contents.unshift(res.msg);
        this.ngZone.run(()=>{
            console.log("res.msg:"+JSON.stringify(res.msg));
            let msg=res.msg;
            msg.date=new Date(msg.time);
            this.chatInfo.contents.push(msg);
             this.contentRef.scrollToBottom();
        });
    },err=>{
                let alert = this.alertCtrl.create({
                        title: '메시지 전달에 실패했습니다.',
                        buttons: ['OK']
                    });
                alert.present();    
    })     
    this.data.message = '';
  }

  onChange(event){
    console.log("event:"+JSON.stringify(event));
  }

  exitChat(){
   
    this.navCtrl.pop();
  }

  responseLater(index){
    console.log("send response later to user");
    let body={chatId:this.chatId,index:index,msg:{type:"text",text:"잠시후 연락드리겠습니다."}};
    this.server.postWithAuth("/consultant/replaceChat",body).then((res:any)=>{
        //this.chatInfo.contents.unshift(res.msg);
        this.ngZone.run(()=>{
            let msg=res.msg;
            msg.date=new Date(msg.time);
            this.chatInfo.contents.splice(index,1,msg);
        })
    },err=>{
                let alert = this.alertCtrl.create({
                        title: '메시지 전달에 실패했습니다.',
                        buttons: ['OK']
                    });
                alert.present();    
    })
  }

  focus(){
     console.log("focus comes");
     this.contentRef.scrollToBottom();
  }

  showActionButtons(flag){
    this.actionHide=!flag;
  }

  doAction(action){
      let body
      if(action=='납입확인'){
          body={chatId:this.chatId,msg:{type:"text",text:" 고객님 15일 일자로 납입이 확인되었습니다."}};
      }else if(action=='청구서류'){
          body={chatId:this.chatId,msg:{type:"action",text:'청구서류 안내',action:"청구서류"}};  
      }else if(action=='연체예방법'){
          body={chatId:this.chatId,msg:{type:"action",text:'연체예방법 안내"  ',action:"연체예방법"}};
      }else if(action=='납입방법'){
          body={chatId:this.chatId,msg:{type:"action",text:"납입방법 안내",action:"납입방법"}};
      }
    this.server.postWithAuth("/consultant/addChat",body).then((res:any)=>{
        //this.chatInfo.contents.unshift(res.msg);
        this.ngZone.run(()=>{
            console.log("res.msg:"+JSON.stringify(res.msg));
            let msg=res.msg;
            msg.date=new Date(msg.time);
            this.chatInfo.contents.push(msg);
             this.contentRef.scrollToBottom();
        });
    },err=>{
                let alert = this.alertCtrl.create({
                        title: '메시지 전달에 실패했습니다.',
                        buttons: ['OK']
                    });
                alert.present();    
    })           
  }
}
