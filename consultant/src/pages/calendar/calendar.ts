import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import * as moment from 'moment';
import 'moment/locale/ko';
import {ServerProvider} from '../../providers/server/server';
import {StorageProvider} from '../../providers/storage/storage';

/**
 * Generated class for the CalendarPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class CalendarPage {
  date:string;
  type:'string';

  eventSource;

  viewTitle;

    calendar = {
        mode: 'month',
        currentDate: new Date(),
        dateFormatter: {
            formatMonthViewDay: function(date:Date) {
                return date.getDate().toString();
            },
            formatMonthViewDayHeader: function(date:Date) {
                return 'MonMH';
            },
            formatMonthViewTitle: function(date:Date) {
                return 'testMT';
            },
            formatWeekViewDayHeader: function(date:Date) {
                return 'MonWH';
            },
            formatWeekViewTitle: function(date:Date) {
                return 'testWT';
            },
            formatWeekViewHourColumn: function(date:Date) {
                return 'testWH';
            },
            formatDayViewHourColumn: function(date:Date) {
                return 'testDH';
            },
            formatDayViewTitle: function(date:Date) {
                return 'testDT';
            }
        }
    };

  onViewTitleChanged(title) {
      console.log("title:"+title);
      let substrs=title.split(" ");
      this.viewTitle = substrs[1]+"년 "+substrs[0];

    let months=substrs[0].split('월');
    let month:number=parseInt(months[0]);
    console.log("month:"+month);
    let body={month:month,year:parseInt(substrs[1])};
    console.log("body:"+JSON.stringify(body));
    this.eventSource=[];
    this.server.postWithAuth("/consultant/getMonthChats",body).then((res:any)=>{
                  if(res.result=="failure"){
                  let alert = this.alertCtrl.create({
                                  title: '서버로부터 상담정보를 가져오지 못했습니다.',
                                  subTitle:JSON.stringify(res.error),
                                  buttons: ['OK']
                              });
                  alert.present();
                }else{
                      console.log("res.events:"+JSON.stringify(res.events));  
                       let eventSource=[];
                      res.events.forEach(event=>{
                        eventSource.push({
                          title:  event.userName+ "님 "+event.type +"상담",
                          startTime: new Date(event.starttime),
                          endTime: new Date(event.endtime),
                          allDay: false
                        });
                      })
                      console.log("this.eventSource:"+JSON.stringify(eventSource));
                      this.eventSource=eventSource;                      
                }
    },err=>{
                  let alert = this.alertCtrl.create({
                                  title: '네트웍상태를 확인해주세요.',
                                  buttons: ['OK']
                              });
                  alert.present();
 
    });
      
  }

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private storage:StorageProvider,
              private alertCtrl:AlertController,               
              public server:ServerProvider) {
      this.eventSource=[];
      //this.eventSource.push({title:"Event - 0",startTime: new Date("2018-09-25T19:36:00.000Z"),endTime: new Date("2018-09-26T19:57:00.000Z"),allDay:false});
      
      moment.locale('ko');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CalendarPage');
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter CalendarPage');
    // read eventSource from server side
    this.calendar.currentDate=new Date();
    let currentDate=new Date();
    console.log("currentDate:"+currentDate);
    console.log("month:"+currentDate.getMonth());
    let month:number=currentDate.getMonth();
    month=month+1;
    console.log("month:"+month);
    let body={month:month,year:currentDate.getFullYear()};
    console.log("body:"+JSON.stringify(body));
    this.server.postWithAuth("/consultant/getMonthChats",body).then((res:any)=>{
                  if(res.result=="failure"){
                  let alert = this.alertCtrl.create({
                                  title: '서버로부터 상담정보를 가져오지 못했습니다.',
                                  subTitle:JSON.stringify(res.error),
                                  buttons: ['OK']
                              });
                  alert.present();
                  }else{
                      //this.eventSource=res.events;
                      let eventSource=[];
                      res.events.forEach(event=>{
                        eventSource.push({
                          title:  event.userName+ "님 "+event.type+ "상담",
                          startTime: new Date(event.starttime),
                          endTime: new Date(event.endtime),
                          allDay: false
                        });

                        console.log("title:"+ event.userName+ "님 "+event.type+ "상담");
                      })
                      console.log("this.eventSource:"+JSON.stringify(eventSource));
                      this.eventSource=eventSource;
                  }
    },err=>{
                  let alert = this.alertCtrl.create({
                                  title: '네트웍상태를 확인해주세요.',
                                  buttons: ['OK']
                              });
                  alert.present();
 
    });
  }

  onChange($event) {
    console.log("onChange:"+$event);
  }

  onCurrentDateChanged(day){
     console.log("onCurrentDateChanged:"+JSON.stringify(day));
  }

  prevMonth(){
    let currentDate=this.calendar.currentDate;
    var m = moment(currentDate); 
     m.subtract(1, 'months');
     let date=new Date(m.format("YYYY-MM-DDTHH:mm:ssZ"));
     this.calendar.currentDate=date;
  }

  nextMonth(){
    let currentDate=this.calendar.currentDate;
    var m = moment(new Date(currentDate)); 
     m.add(1, 'months');
     let date=new Date(m.format("YYYY-MM-DDTHH:mm:ssZ"));
     this.calendar.currentDate=date;
  }
}
