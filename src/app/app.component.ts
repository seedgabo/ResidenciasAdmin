import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { Storage } from '@ionic/storage';
import { Api } from "../providers/api";
import { Login } from "../pages/login/login";
import { ParkingsPage } from "../pages/parkings/parkings";
import { CodePush } from "@ionic-native/code-push";
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{ title: string, component: any, icon: string }>;

  constructor(public platform: Platform, public statusBar: StatusBar, public menuCtrl: MenuController, public splashScreen: SplashScreen, public storage: Storage, public api: Api, public codepush: CodePush) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'literals.visitors', component: HomePage, icon: "contacts" },
      { title: 'literals.visits', component: ListPage, icon: "list" },
      { title: 'literals.parkings', component: ParkingsPage, icon: "car" },
    ];

  }

  initializeApp() {
    this.api.ready.then(() => {
      if (this.api.user) {
        this.rootPage = HomePage;
        this.api.getData();
        this.api.startEcho();
        this.menuCtrl.enable(true);
      }
      else {
        this.menuCtrl.enable(false);
        this.rootPage = Login;
      }
    });

    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.codepush.sync({ updateDialog: false }).subscribe((data) => { console.log(data) }, console.warn)
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.rootPage = page.component
    // this.nav.setRoot(page.component);
  }

  logout() {
    this.api.user = null;
    this.api.url = "";

    this.api.storage.clear();
    this.rootPage = Login;
    this.api.stopEcho();
    this.menuCtrl.enable(false);
  }
}
