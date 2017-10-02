import { ParkingsPage } from './../parkings/parkings';
import { ListPage } from './../list/list';
import { SellerPage } from './../seller/seller';
import { ZonesAdminPage } from './../zones-admin/zones-admin';
import { PanicLogsPage } from './../panic-logs/panic-logs';
import { HomePage } from './../home/home';
import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }

  ionViewDidLoad() {
    this.api.ready.then((data) => {
      this.loading = true;
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
  canVisitors() {
    if (this.api.roles && this.api.modules && this.api.modules.visits)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Celator' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }
  canAccounter() {
    if (this.api.roles && this.api.modules && this.api.modules.finanze)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Accounter' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }
  canZones() {
    if (this.api.roles && this.api.modules && this.api.modules.reservations)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Manage zones' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }
  canPanic() {
    if (this.api.roles && this.api.modules && this.api.modules.panic)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Manage panic logs' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }
  canParking() {
    if (this.api.roles && this.api.modules && this.api.modules.parkings)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Manage panic logs' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }

}
