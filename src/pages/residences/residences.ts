import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../providers/api';

@IonicPage()
@Component({
  selector: 'page-residences',
  templateUrl: 'residences.html',
})
export class ResidencesPage {
  residences: any = [];
  _residences: any = [];
  loading = false;
  query = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }


  ionViewDidLoad() {
    this.api.ready.then(() => {
      this.refresh();
    })
  }

  refresh(refresher = null) {
    this.loading = true
    this.api.get('residences?with[]=users')
      .then((data: any) => {
        this._residences = data;
        this.loading = false
        if (refresher) {
          refresher.complete();
        }
        this.filter();
      })
      .catch((err) => {
        this.loading = false
        if (refresher) {
          refresher.complete();
        }
      });
  }

  filter() {
    console.time("filtering")
    var max = 20;
    if (this.query == "") {
      console.timeEnd("filtering")
      return this.residences = this._residences;
    }
    var response = [];
    var lower = this.query.toLowerCase()
    for (let i = 0; i < this._residences.length; i++) {
      if (response.length == max) {
        break;
      }
      let res = this._residences[i];
      if (res.name.toLowerCase().indexOf(lower) > -1) {
        response[response.length] = res;
        continue;
      }
      for (let x = 0; x < res.users.length; x++) {
        let user = res.users[x];
        if (user.name.toLowerCase().indexOf(lower) > -1) {
          response[response.length] = res;
          continue;
        }
      }
    }

    console.timeEnd("filtering")
    return this.residences = response;
  }

  actions(residence) {
    this.navCtrl.push("ResidencePage", { residence: residence });
  }
  trackBy(index, item) {
    return item.id;
  }
}
