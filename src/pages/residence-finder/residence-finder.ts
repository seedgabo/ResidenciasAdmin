import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';

@IonicPage()
@Component({
  selector: 'page-residence-finder',
  templateUrl: 'residence-finder.html',
})
export class ResidenceFinderPage {
  residences: any = { data: [] };
  query = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api) {
    this.api.storage.get('recent_residences')
      .then((recent_residences) => {
        if (recent_residences) {
          this.residences = recent_residences;
        }
      });
  }

  ionViewDidLoad() {
  }
  search() {
    this.api.get(`residences?whereLike[name]=${this.query}&paginate=50`)
      .then((data: any) => {
        this.residences = data;
        this.api.storage.set('recent_residences', data);
      })
      .catch(console.error)
  }
  cancel() {
    this.viewctrl.dismiss(null, "cancel");
  }
  select(residence) {
    this.viewctrl.dismiss(residence, "accept");
  }
}
