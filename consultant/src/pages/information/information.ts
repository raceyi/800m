import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,App,AlertController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {ServerProvider} from '../../providers/server/server';
import {ConfigurePasswordPage} from '../configure-password/configure-password';

/**
 * Generated class for the InformationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-information',
  templateUrl: 'information.html',
})
export class InformationPage {
  phone;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public storage: StorageProvider,  
              private app:App,
              private alertCtrl: AlertController,
              private server:ServerProvider) {
    this.phone=this.autoHypenPhone(storage.phone);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InformationPage');
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

  modifyPhone(){
        this.server.mobileAuth().then((res:any)=>{
      console.log("res:"+JSON.stringify(res));
      let user={name:res.userName, phone:res.userPhone,birthDate:res.userAge,sex:res.userSex}
      // 휴대폰 변경 server 호출함.
          let body= {
                      email:this.storage.email,
                      phone:res.userPhone
                    };
          this.server.postWithAuth("/consultant/modifyUserPhone",body).then((res:any)=>{
             console.log("res:"+JSON.stringify(res));
             if(res.result=="success"){
                this.storage.phone=res.userPhone;
                let alert = this.alertCtrl.create({
                            title: "회원 정보가 수정되었습니다",
                            buttons: ['OK']
                        });
                        alert.present();
                        this.navCtrl.pop();
             }else{
                let alert = this.alertCtrl.create({
                            title: "회원 정보 수정에 실패했습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
             }
         },(err)=>{
                let alert = this.alertCtrl.create({
                            title: "서버와 통신에 문제가 있습니다.",
                            buttons: ['OK']
                        });
                        alert.present();
         });
    },err=>{
            let alert = this.alertCtrl.create({
                        title: '휴대폰 본인 인증에 실패했습니다.',
                        buttons: ['OK']
                    });
            alert.present();
    })
  }

  modifyPassword(){
    this.app.getRootNavs()[0].push(ConfigurePasswordPage,{class:'ConfigurePasswordPage'});
  }
}
