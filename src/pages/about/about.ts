import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CodePush } from '@ionic-native/code-push';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ToastController } from 'ionic-angular';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public codepush: CodePush, public splashScreen: SplashScreen, public toast: ToastController) {
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

  sync(refresher = null) {
    if (refresher) refresher.complete()
    var sync = () => {
      this.codepush.sync({ updateDialog: false, ignoreFailedUpdates: false, }).subscribe(
        (status) => {
          console.log(status)
          if (status == 6) {
            var msg = "Downloading Update";
            this.toast.create({
              message: msg,
              duration: 3000,
            }).present()
          }
          if (status == 8)
            this.splashScreen.show();
        }
        , (err) => {
          console.warn(err)
          this.splashScreen.hide();
        });

    }
    sync();
  }

}
