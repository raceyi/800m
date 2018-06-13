import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchConsultantPage } from './search-consultant';

@NgModule({
  declarations: [
    SearchConsultantPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchConsultantPage),
  ],
})
export class SearchConsultantPageModule {}
