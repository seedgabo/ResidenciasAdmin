import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../providers/api';
import { SettingProvider } from '../../providers/setting/setting';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  timeout = null
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public setting: SettingProvider) {
  }

  ionViewDidLoad() {
  }

  save() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.setting.save()
    }, 1200);
  }
}
