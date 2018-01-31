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
        if (this.api.roles[i].name == 'Celator' || this.api.roles[i].name == 'SuperAdmin') {
          this.permissions.visitors = true
        }
        if (this.api.roles[i].name == 'Accounter' || this.api.roles[i].name == 'SuperAdmin') {
          this.permissions.accounter = true
        }
        if (this.api.roles[i].name == 'Manage tickets' || this.api.roles[i].name == 'SuperAdmin') {
          this.permissions.tickets = true
        }
        if (this.api.roles[i].name == 'Manage zones' || this.api.roles[i].name == 'SuperAdmin') {
          this.permissions.zones = true
        }
        if (this.api.roles[i].name == 'Manage panic logs' || this.api.roles[i].name == 'SuperAdmin') {
          this.permissions.panics = true
        }
        if (this.api.roles[i].name == 'Manage parkings' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
        if (this.api.roles[i].name == 'Manage correspondences' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
  }

}
