import { PopoverMenu } from './../../providers/popover-menu/popover-menu';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }

  ionViewDidLoad() {
    this.api.ready.then((data) => {
      this.loading = true;
      this.api.SeedPermissions()
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
}
