import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,App,AlertController } from 'ionic-angular';
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
  selectedType="보상";

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public storage: StorageProvider, 
              private app:App,      
              private alertCtrl:AlertController,          
              private server:ServerProvider) {
       gCustomerContactPage=this;         
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
}
