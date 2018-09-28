import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController ,LoadingController} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import {GreetingPage} from '../greeting/greeting';
import {ServerProvider} from '../../providers/server/server';
import { NativeStorage } from '@ionic-native/native-storage';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
    email;
    password;
    passwordConfirm;

    phone;
    phoneDigits;
    name;
    birthYear;
    birthMonth;
    birthDay;
    sex;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public server:ServerProvider,
              private nativeStorage:NativeStorage,
              private alertCtrl: AlertController,
              public loadingCtrl: LoadingController,
              public storage: StorageProvider) {
    let user=navParams.get('user'); 
    //let user={name:'홍길동', phone:'01012341234',birthDate:'19800111'}
    this.name=user.name;
    this.phoneDigits=user.phone;
    this.phone=this.autoHypenPhone(user.phone);
    this.birthYear=user.birthDate.substr(0,4);
    this.birthMonth=user.birthDate.substr(4,2);
    this.birthDay=user.birthDate.substr(6,2);
    this.sex=user.sex;
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
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
    
    cancel(){
      this.navCtrl.pop();
    }

    validateEmail(email){   //http://www.w3resource.com/javascript/form/email-validation.php
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            return (true);
        }
        return (false);
    }

    passwordValidity(password){
        var number = /\d+/.test(password);
        var smEng = /[a-z]+/.test(password);
        var bigEng= /[A-Z]+/.test(password);
        var special = /[^\s\w]+/.test(password);

        if(number && smEng && bigEng){
        return true;
        }
        else if(number && smEng && special){
        return true;
        }
        else if(bigEng && special && special){
        return true;
        }
        else if(bigEng && special && special){
        return true;
        }
        else{
        //this.paswordGuide = "영문대문자,영문소문자,특수문자,숫자 중 3개 이상 선택, 8자리 이상으로 구성하세요";
        return false;
        }
    }

    signup(){
      if(!this.validateEmail(this.email)){
          let alert = this.alertCtrl.create({
                    title: '정상 이메일을 입력해주시기 바랍니다.',
                    buttons: ['OK']
                });
                alert.present();
          return;
      }
        if(!this.passwordValidity(this.password)){
              //this.paswordGuideHide=false;
              let alert = this.alertCtrl.create({
                        title: '영문대문자,영문소문자,특수문자,숫자 중 3개 이상 선택, 8자리 이상으로 구성하세요',
                        buttons: ['OK']
                    });
                    alert.present();
              return;
        }
        if(this.password!==this.passwordConfirm){
              let alert = this.alertCtrl.create({
                        title: '비밀번호가 일치하지 않습니다.',
                        buttons: ['OK']
                    });
                    alert.present();
              return;
        }

        //console.log("signup comes");
        this.storage.name=this.name;
        this.storage.phone=this.phone;
        this.storage.birthYear=this.birthYear;
        this.storage.birthMonth=this.birthMonth;
        this.storage.birthDay=this.birthDay;
        this.storage.email=this.email;
        let body={email:this.email, password:this.password,phone:this.phoneDigits,name:this.name,birth:this.birthDay,sex:this.sex};

        let loading = this.loadingCtrl.create({
                content: '회원가입 중입니다.'
            });

        this.server.postWithoutAuth('/consultant/signup',body).then((res:any)=>{
            loading.dismiss();            
            if(res.result=='success'){
                //save email,password
                var encrypted:string=this.storage.encryptValue('id',this.email);
                this.nativeStorage.setItem('email',encodeURI(encrypted));
                encrypted=this.storage.encryptValue('password',this.password);
                this.nativeStorage.setItem('password',encodeURI(encrypted));
                console.log("res:"+JSON.stringify(res));
                this.storage.IDNumber=res.consultantId;                
                this.navCtrl.push(GreetingPage);
            }else if(res.result=='failure'){
                if(res.error=="existingUser"){
                    let alert = this.alertCtrl.create({
                            title: '이미 존재하는 이메일입니다.',
                            buttons: ['OK']
                        });
                    alert.present();
                }
            }
        },err=>{
            loading.dismiss();            
            let alert = this.alertCtrl.create({
                        title: '가입에 실패했습니다.',
                        buttons: ['OK']
                    });
                    alert.present();
              return;            
        });
    }
}
