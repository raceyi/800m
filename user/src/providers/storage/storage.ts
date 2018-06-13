import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
    phone;
    name;
    birthYear;
    birthMonth;
    birthDay;

    consultantName;

  constructor() {
    console.log('Hello StorageProvider Provider');

    this.phone='01012341234'
    this.name='홍길동';
    this.birthYear='1980';
    this.birthMonth='01';
    this.birthDay='11';
  }

}
