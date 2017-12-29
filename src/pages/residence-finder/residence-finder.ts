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
  residences = [];
  query = "";
  ready = false;
  loading = true;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api) {
    this.api.storage.get('recent_residences')
      .then((recent_residences) => {
        if (recent_residences) {
          this.residences = recent_residences;
        }
      });
    this.api.load('residences').then((resp) => {
      this.search();
      this.ready = true;
    })
  }

  ionViewDidLoad() {
  }

  search() {
    this.loading = true;
    var limit = 100;
    var filter = this.query.toLowerCase()
    var results = [];
    for (var i = 0; i < this.api.objects.residences.length; i++) {
      var item = this.api.objects.residences[i];
      if (
        (item.name && item.name.toLowerCase().indexOf(filter) > -1)
      ) {
        results.push(item);
      }
      if (results.length == limit) {
        break;
      }

    }
    this.residences = results
    this.api.storage.set('recent_residences', this.residences);
    this.loading = false;
  }

  cancel() {
    this.viewctrl.dismiss(null, "cancel");
  }

  select(residence) {
    this.viewctrl.dismiss(residence, "accept");
  }
}
