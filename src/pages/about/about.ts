import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CodePush } from '@ionic-native/code-push';
declare var window: any;
@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {
  store
  live
  description
  ready = false
  constructor(public navCtrl: NavController, public navParams: NavParams, public codepush: CodePush) {
  }

  ionViewDidLoad() {
    this.get()
  }

  get() {
    this.codepush.getCurrentPackage()
      .then((data) => {
        this.live = data.label;
        this.store = data.appVersion;
        this.description = data.description;
      })
      .catch((err) => {
        this.store = "Web Version";
        this.live = window.live_version || "--";
        console.warn(err);
      })
  }

}
