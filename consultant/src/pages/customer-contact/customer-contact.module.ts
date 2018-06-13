import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CustomerContactPage } from './customer-contact';

@NgModule({
  declarations: [
    CustomerContactPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomerContactPage),
  ],
})
export class CustomerContactPageModule {}
