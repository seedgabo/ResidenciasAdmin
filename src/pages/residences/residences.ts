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
    this.loading = true
    this.api.ready.then(() => {
      this.api.load('residences').then(() => {
        this.refresh()
      })
    })
  }

  refresh(refresher = null) {
    this._residences = this.api.objects.residences;
    this.filter()
    this.loading = false
    if (refresher) refresher.complete()
  }

  filter() {
    var max = 50;
    if (this.query == "") {
      return this.residences = this.api.objects.residences;
    }
    var response = [];
    var lower = this.query.toLowerCase()
    for (let i = 0; i < this.api.objects.residences.length; i++) {
      if (response.length == max) {
        break;
      }
      let res = this.api.objects.residences[i];
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

    return this.residences = response;
  }

  actions(residence) {
    this.navCtrl.push("ResidencePage", { residence: residence });
  }
  trackBy(index, item) {
    return item.id;
  }
}
