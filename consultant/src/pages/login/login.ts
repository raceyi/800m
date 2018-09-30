import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController,LoadingController} from 'ionic-angular';
import {SignupPage} from '../signup/signup';
import {ServerProvider} from '../../providers/server/server';
import { NativeStorage } from '@ionic-native/native-storage';
import {StorageProvider} from '../../providers/storage/storage';
import {TabsPage} from '../tabs/tabs';
import {PasswordResetPage} from '../password-reset/password-reset';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  email;
  password;
  inputProgress=false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              private nativeStorage:NativeStorage,
              public storage: StorageProvider,                
              private server:ServerProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  focusInput(){
    console.log("focusInput comes");
    this.inputProgress=true;
  }

  blurInput(){
    console.log("blurInput comes");
    this.inputProgress=false;      
  }

login(){
      let body={email:this.email,password:this.password};

      if(this.email.trim().length==0){
              let alert = this.alertCtrl.create({
                        title: '이메일을 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
          return;
      }
      if(this.password.trim().length==0){
                let alert = this.alertCtrl.create({
                        title: '비밀번호를 입력해주시기 바랍니다.',
                        buttons: ['OK']
                    });
                    alert.present();
            return;
      }

       let loading = this.loadingCtrl.create({
            content: '로그인 중입니다.'
        });

      this.server.postWithoutAuth('/consultant/login',body).then((res:any)=>{
          loading.dismiss();
          if(res.result=='success'){
                var encrypted:string=this.storage.encryptValue('id',this.email);
                this.nativeStorage.setItem('email',encodeURI(encrypted));
                encrypted=this.storage.encryptValue('password',this.password);
                this.nativeStorage.setItem('password',encodeURI(encrypted));
                this.storage.saveLoginInfo(res);
                this.navCtrl.setRoot(TabsPage);
          }else if(res.result=='failure'){
              if(res.error='invalidUserInfo'){
                    let alert = this.alertCtrl.create({
                                  title: '회원 정보가 일치하지 않습니다.',
                                  buttons: ['OK']
                              });
                    alert.present();
              }
          }
      },err=>{
          loading.dismiss();  
      })
  }

  signup(){
    this.server.mobileAuth().then((res:any)=>{
      console.log("res:"+JSON.stringify(res));
      let user={name:res.userName, phone:res.userPhone,birthDate:res.userAge,sex:res.useSex}
      this.navCtrl.push(SignupPage,{user: user} );    
    },err=>{
            let alert = this.alertCtrl.create({
                        title: '휴대폰 본인 인증에 실패했습니다.',
                        buttons: ['OK']
                    });
            alert.present();
    })
  }

  temporaryPassword(){
        this.navCtrl.push(PasswordResetPage);
  }
}
