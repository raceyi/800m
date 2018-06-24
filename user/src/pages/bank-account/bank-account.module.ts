import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BankAccountPage } from './bank-account';

@NgModule({
  declarations: [
    BankAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(BankAccountPage),
  ],
})
export class BankAccountPageModule {}
