import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';
import { Api } from '../api';
@Injectable()
export class NewtonProvider {
  url = ""
  token = ""
  app = "Newton"
  integration = false;
  resolve;
  reject;
  ready = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  })
  constructor(public http: Http, public api: Api) {
    console.log('Hello NewtonProvider Provider');
  }


  init() {
    this.api.get('newton')
      .then((resp: any) => {
        this.integration = resp.integration;
        if (resp.integration) {
          this.url = resp.url
          this.token = resp.token
          this.app = resp.app
          this.resolve(this.app);
        }
      })
      .catch((err) => {
        this.Error(err)
        this.reject(err)
      })
  }

  get(uri) {
    return new Promise((resolve, reject) => {
      this.http.get(this.url + "api/" + uri, { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  post(uri, data) {
    return new Promise((resolve, reject) => {
      this.http.post(this.url + "api/" + uri, data, { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  put(uri, data) {
    return new Promise((resolve, reject) => {
      this.http.put(this.url + "api/" + uri, data, { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  delete(uri) {
    return new Promise((resolve, reject) => {
      this.http.delete(this.url + "api/" + uri, { headers: this.setHeaders() })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          return reject(error);
        });
    });
  }

  private setHeaders() {
    let headers = new Headers();
    headers.append("Auth-Token", this.token);
    return headers;
  }

  private Error(error) {
    var message = "";
    console.log(error);
    if (error.status == 500) {
      message = this.api.trans("__.Internal Server Error")
    }
    if (error.status == 404) {
      message = this.api.trans("__.Not Found")
    }
    if (error.status == 401) {
      message = this.api.trans("__.Unauthorized")
    }
    this.api.alert.create({
      title: this.api.trans("__.Network Error"),
      subTitle: error.error,
      message: message + ":" + error.statusText,
      buttons: ["OK"],

    }).present();
  }

}
