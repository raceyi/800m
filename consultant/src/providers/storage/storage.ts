import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {ConfigProvider} from "../config/config";
import * as CryptoJS from 'crypto-js';
import { NativeStorage } from '@ionic-native/native-storage';
import {Events} from 'ionic-angular';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
    phone;
    name;
    email;
    birthYear;
    birthMonth;
    birthDay;

    userList=[];
    userOneMonthList=[];
    userTwoMonthList=[];
    chats=[];

    consultantName;
    consultantId;

    contactList=[]; // date, chats

    badgeCount=0;
    
    sortBy="character"; //one of charactoer or contact
    public certUrl=this.configProvider.getCertUrl();
    public authReturnUrl=this.configProvider.getAuthReturnUrl();
    public authFailReturnUrl=this.configProvider.getAutFailReturnUrl();
    public version=this.configProvider.getVersion();

  constructor(private configProvider:ConfigProvider,private events:Events) {
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

    saveLoginInfo(res){
                console.log("res:"+JSON.stringify(res));
                console.log("res.userInfo.consultant:"+JSON.stringify(res.userInfo.consultant));
                this.name=res.userInfo.consultant.name;
                this.phone=res.userInfo.consultant.phone;
                this.birthYear=res.userInfo.consultant.birth.substr(0,4);
                this.birthMonth=res.userInfo.consultant.birth.substr(4,2);
                this.birthDay=res.userInfo.consultant.birth.substr(6,2);       
                this.userList=res.userInfo.users;
                this.userList.forEach(user=>{
                    if(user.overdue==1){
                        this.userOneMonthList.push(user);
                    }else if(user.overdue==2){
                        this.userTwoMonthList.push(user);  
                    }
                    user.phoneHref="tel:"+user.phone;
                })
                this.sortByCharacter();
                this.chats=res.userInfo.chats;
                this.convertChatsToList();
    }

    convertDayInWeek(day){
        switch(day){
            case 0: return'일요일';
            case 1: return'월요일';
            case 2: return'화요일';
            case 3: return'수요일';
            case 4: return'목요일';
            case 5: return'금요일';
            case 6: return'토요일';
        }
    }
    convertDayString(dateString){
        let date=new Date(dateString);
        let month=date.getMonth()+1;
        let dateNum=date.getDate();
        let day=date.getDay();
        console.log(month+"월 "+dateNum+"일 "+day);
        return month+"월 "+dateNum+"일 "+this.convertDayInWeek(day);
    }

    convertChatsToList(){
        if(this.chats.length==0) return;

        this.chats.sort(function(a,b){
            if(a.date>b.date){
                return -1;
            }else if(a.date<b.date){
                return 1;
            }
            return 0;
        })

        this.chats.forEach(chat=>{
            let index=this.userList.findIndex(function(element){if(element._id==chat.userId) return true;});
            chat.name=this.userList[index].name;
            let date=new Date(chat.date);
            chat.time=date.getHours().toString()+":"+date.getMinutes().toString();
        })

        let i=this.chats.length-1;
        let latestday=new Date(this.chats[i].date);

        let dayList=[];
        dayList.push(this.chats[i]);
        i=i-1;
        for(;i>=0;i--){
            let date=new Date(this.chats[i].date);
            if(latestday.getFullYear()==date.getFullYear() &&
                latestday.getMonth()==date.getMonth() &&
                latestday.getDate()==date.getDate()){
                dayList.push(this.chats[i]);
            }else{
                this.contactList.push({date:this.convertDayString(latestday),list:dayList});
                latestday=new Date(this.chats[i].date);
                dayList=[this.chats[i]];
            }
        }
        if(dayList.length>0){
            this.contactList.push({date:this.convertDayString(latestday),list:dayList});
        }

        let today=new Date();
        let date=new Date(this.contactList[0].list[0].date);
        if(date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()){
            this.contactList[0].today=true;
        }

        let badgeCount=0;
        this.contactList.forEach(day=>{
            console.log("list:"+JSON.stringify(day.list));
            day.list.forEach(chat=>{
                if(!chat.confirm && chat.lastOrigin=='user'){
                    ++badgeCount;
                }
            })
        })
        //send badgeCount into tabs;
        this.events.publish("badgeCount",badgeCount);
        this.badgeCount=badgeCount;

        console.log("badgeCount:"+badgeCount);
        console.log("contactList:"+JSON.stringify(this.contactList));
    }

  sortByCharacter(){
      this.sortBy="character";
                this.userList.sort(function(a,b){
                    if(a.name<b.name)
                        return -1;
                    else if(a.name>b.name)
                        return 1;
                    else
                        return 0;    
                })
                this.userOneMonthList.sort(function(a,b){
                    if(a.name<b.name)
                        return -1;
                    else if(a.name>b.name)
                        return 1;
                    else
                        return 0;    
                })
                this.userTwoMonthList.sort(function(a,b){
                    if(a.name<b.name)
                        return -1;
                    else if(a.name>b.name)
                        return 1;
                    else
                        return 0;    
                })
  }

  sortByContact(){
      this.sortBy="contact";
                this.userList.sort(function(a,b){
                    if(!a.lastContact && b.lastContact)
                        return 1;
                    if(a.lastContact && !b.lastContact)
                        return -1;
                    if(!a.lastContact && !b.lastContact)
                        return 0;                        
                    if(a.lastContact<b.lastContact)
                        return -1;
                    else if(a.lastContact>b.lastContact)
                        return 1;
                    else
                        return 0;    
                })
                this.userOneMonthList.sort(function(a,b){
                    if(!a.lastContact && b.lastContact)
                        return 1;
                    if(a.lastContact && !b.lastContact)
                        return -1;
                    if(!a.lastContact && !b.lastContact)
                        return 0;                        
                    if(a.lastContact<b.lastContact)
                        return -1;
                    else if(a.lastContact>b.lastContact)
                        return 1;
                    else
                        return 0;    
                })
                this.userTwoMonthList.sort(function(a,b){
                    if(!a.lastContact && b.lastContact)
                        return 1;
                    if(a.lastContact && !b.lastContact)
                        return -1;
                    if(!a.lastContact && !b.lastContact)
                        return 0;                                            
                    if(a.lastContact<b.lastContact)
                        return -1;
                    else if(a.lastContact>b.lastContact)
                        return 1;
                    else
                        return 0;    
                })    
  }

}
