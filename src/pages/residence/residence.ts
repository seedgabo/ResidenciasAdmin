import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../providers/api';
@IonicPage()
@Component({
  selector: 'page-residence',
  templateUrl: 'residence.html',
})
export class ResidencePage {
  residence: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
    this.residence = this.navParams.get("residence");
  }

  ionViewDidLoad() {
    this.getAllData();
  }

  getAllData() {
    this.api.get(`residences/${this.residence.id}?with[]=users&with[]=visitors&with[]=vehicles&with[]=pets&with[]=workers&with[]=owner&append[]=debt`)
      .then((data) => {
        this.residence = data;
      })
      .catch((err) => {
        this.api.Error(err);

      })
  }

  close() {
    this.navCtrl.pop();
  }

}
