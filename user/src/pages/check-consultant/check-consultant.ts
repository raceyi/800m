import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {GreetingPage} from '../greeting/greeting';
import {ServerProvider} from '../../providers/server/server';

/**
 * Generated class for the CheckConsultantPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-check-consultant',
  templateUrl: 'check-consultant.html',
})
export class CheckConsultantPage {
  consultant;
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public server:ServerProvider,
              private alertCtrl: AlertController,              
              public storage: StorageProvider) {
    let consultant=navParams.get('consultant'); 
    this.consultant=consultant.name;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CheckConsultantPage');
  }

  found(){
    let consultant=this.navParams.get('consultant'); 
    let body={consultantId:consultant.IDNumber};
    this.server.postWithAuth("/registerConsultant",body).then((res)=>{
          this.storage.consultantName=consultant.name;
          this.storage.consultantId=consultant.IDNumber;
          this.storage.consultantPhone=consultant.phone;
          this.navCtrl.push(GreetingPage);
    },err=>{
          let alert = this.alertCtrl.create({
                  title: '설계사 등록에 실패하였습니다.',
                  subTitle:"다시 실행해 주시기바랍니다",
                  buttons: ['OK']
              });
          alert.present();
 
    })
  }

  back(){
    this.navCtrl.pop();
  }
}
