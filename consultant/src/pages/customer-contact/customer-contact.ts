import { Component,NgZone } from '@angular/core';
import { IonicPage, Events,NavController, NavParams,App,AlertController } from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
var gCustomerContactPage;

/**
 * Generated class for the CustomerContactPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-customer-contact',
  templateUrl: 'customer-contact.html',
})
export class CustomerContactPage {
  relationship;

  selectedType="보상";

    badgeCount=0;
    reward=0;
    overdue=0;
    newSignUp=0;
    termination=0;
    etc=0;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storage: StorageProvider, 
              private app:App,  
              public ngZone:NgZone,
              private events:Events,    
              private alertCtrl:AlertController,          
              private server:ServerProvider) {
       gCustomerContactPage=this;   

            this.reward=this.storage.reward;
            this.overdue=this.storage.overdue;
            this.newSignUp=this.storage.newSignUp;
            this.termination=this.storage.termination;
            this.etc=this.storage.etc;

   this.events.subscribe("badgeCount",param=>{
      console.log("CustomerContact-badgeCount "+param);
        this.ngZone.run(()=>{
            this.reward=this.storage.reward;
            this.overdue=this.storage.overdue;
            this.newSignUp=this.storage.newSignUp;
            this.termination=this.storage.termination;
            this.etc=this.storage.etc;
        })
  });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerContactPage');

  }

  ionViewWillEnter() {
        console.log("ionViewWillEnter-CustomerContactPage");
      //chat정보를 서버로 부터 가져온다.
      this.server.updateChats().then(()=>{
          //각 종류별로 신규 상담 숫자를 넣어주자.

      },err=>{
                let alert = this.alertCtrl.create({
                        title: '서버와 통신에 실패했습니다.',
                        buttons: ['OK']
                    });
                alert.present();    
      });
  }

  chat(userInfo){
    console.log("chat comes "+JSON.stringify(userInfo));
    this.app.getRootNavs()[0].push(ChatPage,{chatId:userInfo._id,name:userInfo.name});
  }

  select(type){
    this.selectedType=type;
  }

  checkListExist(day,selectedType){
      let index=day.list.findIndex(function(element){
          if(element.type==selectedType)
              return true;
          return false;    
      })
      if(index>=0){
          return false;
      }
      return true;

  }
}
