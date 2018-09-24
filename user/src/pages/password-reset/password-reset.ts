import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,AlertController } from 'ionic-angular';
import {ServerProvider} from '../../providers/server/server';

/**
 * Generated class for the PasswordResetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-password-reset',
  templateUrl: 'password-reset.html',
})
export class PasswordResetPage {
  email;
  phone;
  inputProgress=false;

  constructor(public navCtrl: NavController, 
              public alertCtrl:AlertController,
              public navParams: NavParams,
              private server:ServerProvider,
              public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PasswordResetPage');
  }

  resetPassword(){
      if(!this.email || !this.phone){
            let alert = this.alertCtrl.create({
                          title: '이메일과 휴대폰 번호를 입력해 주시기 바랍니다.',
                          buttons: ['OK']
                      });
            alert.present();
            return;
      }

      let loading = this.loadingCtrl.create({
          content: '서버에 요청 중입니다.'
      });
      let body={email:this.email, phone:this.phone};

      this.server.postWithoutAuth('/passwordReset',body).then((res:any)=>{
          loading.dismiss();
          if(res.result=='success'){
                    let alert = this.alertCtrl.create({
                        title: '이메일로 새로운 비밀번호가 전달되었습니다.',
                        buttons: ['OK']
                    });
                    alert.present().then(()=>{
                         this.navCtrl.pop();
                    });
          }else if(res.result=='failure'){
                    let alert = this.alertCtrl.create({
                                  title: '회원 정보가 일치하지 않습니다.',
                                  buttons: ['OK']
                              });
                    alert.present();
          }
      },err=>{
          loading.dismiss();  
      })
  }

  close(){
    this.navCtrl.pop();
  }

    focusInput(){
    console.log("focusInput comes");
    this.inputProgress=true;
  }

  blurInput(){
    console.log("blurInput comes");
    this.inputProgress=false;      
  }

}
