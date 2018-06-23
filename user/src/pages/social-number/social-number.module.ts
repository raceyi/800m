import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SocialNumberPage } from './social-number';

@NgModule({
  declarations: [
    SocialNumberPage,
  ],
  imports: [
    IonicPageModule.forChild(SocialNumberPage),
  ],
})
export class SocialNumberPageModule {}
