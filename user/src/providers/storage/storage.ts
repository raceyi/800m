import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from "../config/config";
import * as CryptoJS from 'crypto-js';
import { NativeStorage } from '@ionic-native/native-storage';

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
    
    public certUrl=this.configProvider.getCertUrl();
    public authReturnUrl=this.configProvider.getAuthReturnUrl();
    public authFailReturnUrl=this.configProvider.getAutFailReturnUrl();
    public version=this.configProvider.getVersion();

    consultantName;

  constructor(private configProvider:ConfigProvider) {
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

    
}
