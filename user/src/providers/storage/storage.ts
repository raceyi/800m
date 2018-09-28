import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from "../config/config";
import * as CryptoJS from 'crypto-js';
import { NativeStorage } from '@ionic-native/native-storage';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { AlertController ,App,Platform,NavController} from 'ionic-angular';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
    email;
    phone;
    name;
    birthYear;
    birthMonth;
    birthDay;
    sex;

    public certUrl=this.configProvider.getCertUrl();
    public authReturnUrl=this.configProvider.getAuthReturnUrl();
    public authFailReturnUrl=this.configProvider.getAutFailReturnUrl();
    public version=this.configProvider.getVersion();
    device=this.configProvider.device;

    consultantName;
    consultantId;
    consultantPhone;
    consultantPhoneHref;
    insurances;

    chatId;
    chatList=[];
    
    token;
    
  constructor(private configProvider:ConfigProvider,
              private platform: Platform,private push: Push) {
        console.log('Hello StorageProvider Provider');
  }

    decryptValue(identifier,value){
        var key=value.substring(0, 16);
        var encrypt=value.substring(16, value.length);
        console.log("value:"+value+" key:"+key+" encrypt:"+encrypt);
        var decrypted=CryptoJS.AES.decrypt(encrypt,key);
        if(identifier=="email"){ // not good idea to save id here. Please make a function like getId
            this.email=decrypted.toString(CryptoJS.enc.Utf8);
        }
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    encryptValue(identifier,value){
        var buffer="";
        for (var i = 0; i < 16; i++) {
            buffer+= Math.floor((Math.random() * 10));
        }
        console.log("buffer"+buffer);
        var encrypted = CryptoJS.AES.encrypt(value, buffer);
        console.log("value:"+buffer+encrypted);
        
        if(identifier=="email") // not good idea to save id here. Please make a function like saveId
            this.email=value;
        return (buffer+encrypted);    
    }

    storeUserInfo(res){ // 로그인시 고객정보를 가져옴
                this.name=res.userInfo.name;
                this.phone=res.userInfo.phone;
                this.birthYear=res.userInfo.birth.substr(0,4);
                this.birthMonth=res.userInfo.birth.substr(4,2);
                this.birthDay=res.userInfo.birth.substr(6,2);
                this.sex=res.userInfo.sex;

                this.consultantId=res.userInfo.consultantId;
                if(res.userInfo.consultantId){
                    this.consultantName=res.consultant.name;
                    this.consultantPhone=res.consultant.phone;
                    this.consultantPhoneHref="tel:"+res.consultant.phone;
                }
                this.insurances=[];
                if(res.payment){
                    for(let i=0;i<res.payment.length;i++){
                        let name=res.payment[i].name;
                        let monthPremium=res.payment[i].month;
                        let payments=res.payment[i].payments;
                        for(let j=0;j<payments.length;j++){
                            let monthInfo={month:payments[j].month,premium:payments[j].payment,name:name,monthPremium:monthPremium};
                            this.insurances.push(monthInfo);
                        }
                    }
                }
                this.insurances.sort(function(a, b){
                    if(a.month>b.month) return -1;
                    else if(a.month<b.month) return 1;
                    else return 0;
                });
                console.log("insurances:"+JSON.stringify(this.insurances));
    }
}
