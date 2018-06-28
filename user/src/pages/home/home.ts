import { Component } from '@angular/core';
import { NavController,AlertController } from 'ionic-angular';
import {ChatPage} from '../chat/chat';
import {ChatEntrancePage} from '../chat-entrance/chat-entrance';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  insurances:any=[
          {month:6, name:'동부화재자동차', preminum:true},
          {month:6,name:'동양생명실비보험', preminum:true},
          {month:6,name:'메리츠화재보험', preminum:false},
          {month:5,name:'동부화재자동차', preminum:true},
          {month:5,name:'동양생명실비보험', preminum:true},
          {month:5,name:'메리츠화재보험', preminum:false}];

  constructor(public navCtrl: NavController,
              private alertCtrl:AlertController) {

  }

  withdrawal(insurance){
              let alert = this.alertCtrl.create({
                    title: "우리은행 1002*****9408 계좌에서 50,000원을 납부합니다.",
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
    this.navCtrl.push(ChatEntrancePage);
  }

}
