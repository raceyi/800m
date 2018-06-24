import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InsurancePage } from './insurance';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';

@NgModule({
  declarations: [
    InsurancePage,
  ],
  imports: [
    DragulaModule,
    IonicPageModule.forChild(InsurancePage),
  ],
})
export class InsurancePageModule {}
