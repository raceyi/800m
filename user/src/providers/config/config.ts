import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigProvider {
  //serverAddress="http://www.go800m.com:3000";
  serverAddress="http://13.125.189.254:3000";

  //serverAddress="http://192.168.0.3:3000";
  //serverAddress="http://192.168.0.6:3000";
  
  public certUrl="http://www.go800m.com/kcpcert/kcpcert_start.jsp";
  public authReturnUrl="http://www.go800m.com:3000/oauthSuccess";
  public authFailReturnUrl="http://www.go800m.com:3000/oauthFailure";

  version="0.0.1";
  
    constructor(public http: HttpClient) {
        console.log('Hello ConfigProvider Provider');
    }

    getCertUrl(){
        return this.certUrl;
    }

    getAuthReturnUrl(){
        return this.authReturnUrl;
    }

    getAutFailReturnUrl(){
        return this.authFailReturnUrl;
    }

    getVersion(){
        return this.version;
    }

}
