import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Api } from "../../providers/api";

@Component({
  selector: 'page-visit',
  templateUrl: 'visit.html',
})

export class VisitPage {
  visit: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
    this.visit = navParams.data.visit;
  }

  ionViewDidLoad() {
    this.api.get(`visits/${this.visit.id}?with[]=visitor&with[]=visitors&with[]=vehicle&with[]=parking&with[]=user&with[]=residence&limit=800'`)
      .then((data) => {
        this.visit = data;
      })
      .catch((err) => {
        console.error(err)
      });
  }

  dismiss() {
    this.navCtrl.pop();
  }
  list() {

  }

  done() {
    this.navParams.data.done();
    this.dismiss();
  }

}
