import { ParkingsPage } from './../parkings/parkings';
import { ListPage } from './../list/list';
import { SellerPage } from './../seller/seller';
import { ZonesAdminPage } from './../zones-admin/zones-admin';
import { PanicLogsPage } from './../panic-logs/panic-logs';
import { HomePage } from './../home/home';
import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IonicPage } from 'ionic-angular/navigation/ionic-page';
@IonicPage({
  priority: "high"
})
@Component({
  selector: 'page-dash',
  templateUrl: 'dash.html',
})
export class DashPage {
  loading = false;
  sliders = [];
  VistorsPage = HomePage;
  VisitsPage = ListPage;
  ParkingsPage = ParkingsPage;
  PanicLogsPage = PanicLogsPage;
  SellerPage = SellerPage;
  ZonesAdminPage = ZonesAdminPage;
  permissions = {
    visitors: false,
    accounter: false,
    tickets: false,
    zones: false,
    panics: false,
    parkings: false,
    vehicles: false,
    correspondences: false,
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }

  ionViewDidLoad() {
    this.api.ready.then((data) => {
      this.loading = true;
      this.SeedPermissions()
      this.api.get('sliders?with[]=image').then(
        (data: any) => {
          this.sliders = data;
        })
        .catch(console.error)
    });
  }
  openPage(page) {
    this.navCtrl.push(page);
  }

  SeedPermissions() {
    if (this.api.roles && this.api.modules && this.api.modules.visits)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'SuperAdmin') {
          this.permissions = {
            visitors: true,
            accounter: true,
            tickets: true,
            zones: true,
            panics: true,
            parkings: true,
            vehicles: true,
            correspondences: true,
          }
          return
        }
        else if (this.api.roles[i].name == 'Celator') {
          this.permissions.visitors = true

        }
        else if (this.api.roles[i].name == 'Accounter') {
          this.permissions.accounter = true

        }
        else if (this.api.roles[i].name == 'Manage tickets') {
          this.permissions.tickets = true

        }
        else if (this.api.roles[i].name == 'Manage zones') {
          this.permissions.zones = true

        }
        else if (this.api.roles[i].name == 'Manage panic logs') {
          this.permissions.panics = true

        }
        else if (this.api.roles[i].name == 'Manage parkings') {
          this.permissions.parkings = true
        }
        else if (this.api.roles[i].name == 'Manage vehicles') {
          this.permissions.vehicles = true

        }
        else if (this.api.roles[i].name == 'Manage correspondences') {
          this.permissions.correspondences = true

        }
      }
  }

}
