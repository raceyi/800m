import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {StorageProvider} from '../../providers/storage/storage';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import {BankAccountPage} from '../bank-account/bank-account';

/**
 * Generated class for the InsurancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-insurance',
  templateUrl: 'insurance.html',
})
export class InsurancePage {
  insurances:any=[{name:'동부화재자동차', month:100000},
               {name:'동양생명실비보험', month:30000},
               {name:'메리츠화재보험', month:50000}];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private drag: DragulaService,
               public storage: StorageProvider) {

    this.drag.drag.subscribe((val) =>
      {
         // Log the retrieved HTML element ID value
         console.log('Is dragging: ' + val[1].id);
      });

      this.drag.drop.subscribe((val) =>
      {
         // Log the retrieved HTML ID value and the re-ordered list value
         console.log('Is dropped: ' + val[1].id);
      });


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InsurancePage');
  }

  prev(){
    this.navCtrl.pop();
  }

  next(){
    this.navCtrl.push(BankAccountPage);
  }
}
