import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
@Component({
  selector: 'page-panic-logs',
  templateUrl: 'panic-logs.html',
})
export class PanicLogsPage {
  panics: any = {};
  loading = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }

  ionViewDidLoad() {
    this.getPanics();
  }

  getPanics() {
    this.loading = false;
    this.api.get('panics&paginate=300')
      .then((data: any) => {
        console.log(data);
        this.panics = data;
        this.loading = true;
      })
      .catch((err) => {
        console.error(err);
        this.loading = true;
      })
  }

}
