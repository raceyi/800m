import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {CheckConsultantPage} from '../check-consultant/check-consultant';
import {ServerProvider} from '../../providers/server/server';

/**
 * Generated class for the SearchConsultantPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search-consultant',
  templateUrl: 'search-consultant.html',
})
export class SearchConsultantPage {
  consultantId="";

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public server:ServerProvider,
              private alertCtrl: AlertController,              
              public storage: StorageProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SearchConsultantPage');
  }

  search(){
      if(this.consultantId.trim().length!=6){
        let alert = this.alertCtrl.create({
                title: '정상 설계사 아이디를 입력해주세요.',
                buttons: ['OK']
            });
        alert.present();
        return;
      }
      console.log("search- consultantId"+this.consultantId);
      let body={consultantId:this.consultantId};
      console.log("search- "+JSON.stringify(body));
      this.server.postWithAuth("/searchConsultant",body).then((res:any)=>{
          console.log("res:"+JSON.stringify(res));
          this.navCtrl.push(CheckConsultantPage,{consultant:res.consultant});
      });
  }
}
