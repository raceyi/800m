import { Component,NgZone } from '@angular/core';

import {CalendarPage} from '../calendar/calendar';
import {CustomerContactPage} from '../customer-contact/customer-contact';
import {CustomerListPage} from '../customer-list/customer-list';
import {InformationPage} from '../information/information';
import {Events,Platform} from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import{ServerProvider} from '../../providers/server/server';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = CustomerContactPage;
  tab2Root = CustomerListPage;
  tab3Root = CalendarPage;
  tab4Root = InformationPage;

  countBadge=0;
  
  constructor(private events:Events,
              private ngZone:NgZone,
              private platform:Platform,
              private serverProvider:ServerProvider,
              public storage: StorageProvider) {

    platform.ready().then(() => {
        this.serverProvider.registerPushService(); 
    });    




    this.events.subscribe("badgeCount",param=>{
      console.log("Tabs-badgeCount "+param);
        this.ngZone.run(()=>{
        this.countBadge=param;
    })
  });
}

}
