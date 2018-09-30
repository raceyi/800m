import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,App } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {BankAccountPage} from '../bank-account/bank-account';
import{ConfigurePasswordPage} from '../configure-password/configure-password';
import {ServerProvider} from '../../providers/server/server';
import { Device } from '@ionic-native/device';
import {LoginPage} from '../login/login';

/**
 * Generated class for the MyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my',
  templateUrl: 'my.html',
})
export class MyPage {

  phoneNumber;
  consultantPhoneNumber;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
                public server:ServerProvider,   
                private alertCtrl: AlertController,
                public device: Device,  
                private app:App,
                public storage: StorageProvider) {
      if(this.storage.phone){              
            this.phoneNumber=this.autoHypenPhone(this.storage.phone);
      }
      if(this.storage.consultantPhone){
            this.consultantPhoneNumber=this.autoHypenPhone(this.storage.consultantPhone);
      }
  }

configureBounds(){
 this.navCtrl.push(BankAccountPage);
}

configurePassword(){
  this.navCtrl.push(ConfigurePasswordPage);
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyPage');
  }

  close(){
    this.navCtrl.pop();  
  }

  modifyPhone(){
    this.server.mobileAuth().then((res:any)=>{
      console.log("res:"+JSON.stringify(res));
      let user={name:res.userName, phone:res.userPhone,birthDate:res.userAge,sex:res.userSex}
      // 휴대폰 변경 server 호출함.
          let body= {
                      email:this.storage.email,
                      phone:res.userPhone
                    };
          this.server.postWithAuth("/modifyUserPhone",body).then((res:any)=>{
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

logout(){
    this.server.postWithAuth("/logout",{}).then((res:any)=>{
            this.storage.removeStoredInfo(); //only success comes here
            this.app.getRootNavs()[0].setRoot(LoginPage);
    },err=>{
            let alert = this.alertCtrl.create({
                          subTitle: '로그아웃에 실패했습니다.',
                          buttons: ['OK']
                      });
            alert.present();
    });
  }

  unregister(){
    this.server.postWithAuth("/unregister",{}).then((res:any)=>{
        this.storage.removeStoredInfo(); //only success comes here
        this.app.getRootNavs()[0].setRoot(LoginPage);
    },err=>{
            let alert = this.alertCtrl.create({
                          subTitle: '회원탈퇴에 실패했습니다.',
                          buttons: ['OK']
                      });
            alert.present();
    });
  }  
}
