import { Component } from '@angular/core';

import {CalendarPage} from '../calendar/calendar';
import {CustomerContactPage} from '../customer-contact/customer-contact';
import {CustomerListPage} from '../customer-list/customer-list';
import {InformationPage} from '../information/information';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = CustomerContactPage;
  tab2Root = CustomerListPage;
  tab3Root = CalendarPage;
  tab4Root = InformationPage;

  countBadge=1;
  
  constructor() {

  }
}
