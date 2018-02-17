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
  multiple = false
  selecteds = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api) {
    if (this.navParams.get('multiple') !== undefined) {
      this.multiple = this.navParams.get('multiple')
    }
    if (this.navParams.get('selecteds')) {
      this.navParams.get('selecteds').forEach(element => {
        this.select(element)
      });
    }

    this.api.storage.get('recent_residences')
      .then((recent_residences) => {
        if (!this.multiple && recent_residences) {
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
    if (this.multiple && this.query == '') {
      this.residences = this.api.objects.residences
    }
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
    if (this.multiple) {
      this.viewctrl.dismiss({ selecteds: this.selecteds })
      this.clear()
      return
    }
    this.viewctrl.dismiss(null, "cancel");
  }

  selectAll() {
    this.selecteds = []
    this.api.objects.residences.forEach(residence => {
      residence._selected = true
      this.selecteds[this.selecteds.length] = residence
    });
  }

  deselectAll() {
    this.selecteds = []
    this.api.objects.residences.forEach(residence => {
      residence._selected = false
    });
  }

  save() {
    this.viewctrl.dismiss({ selecteds: this.selecteds })
    this.clear()
  }

  clear() {
    this.selecteds.forEach((element) => {
      this.api.objects.residences._selected = undefined;
    })
  }

  select(residence) {
    if (this.multiple) {
      residence._selected ? residence._selected = false : residence._selected = true
      this.selecteds[this.selecteds.length] = residence

    } else {
      this.viewctrl.dismiss(residence, "accept");
    }
  }
}
