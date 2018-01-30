import { BackgroundMode } from '@ionic-native/background-mode';
import { PanicLogsPage } from './../pages/panic-logs/panic-logs';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppMinimize } from '@ionic-native/app-minimize';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { Storage } from '@ionic/storage';
import { Api } from "../providers/api";
import { Login } from "../pages/login/login";
import { ParkingsPage } from "../pages/parkings/parkings";
import { CodePush } from "@ionic-native/code-push";
import { SellerPage } from '../pages/seller/seller';
import { ZonesAdminPage } from '../pages/zones-admin/zones-admin';
declare var window: any;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;

  pages: Array<{ title: string, component: any, icon: string }>;
  SellerPage = SellerPage;
  ZonesAdminPage = ZonesAdminPage;
  PanicLogsPage = PanicLogsPage;
  constructor(public platform: Platform, public statusBar: StatusBar, public menuCtrl: MenuController, public splashScreen: SplashScreen, public storage: Storage, public api: Api, public codepush: CodePush, public backgroundmode: BackgroundMode, public minimize: AppMinimize) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'literals.lobby', component: "LobbyPage", icon: "people" },
      { title: 'literals.visitors', component: HomePage, icon: "contacts" },
      { title: 'literals.visits', component: ListPage, icon: "list" },
      { title: 'literals.parkings', component: ParkingsPage, icon: "car" },
      { title: 'literals.residences', component: "ResidencesPage", icon: "home" },
    ];

  }

  initializeApp() {
    this.api.ready.then(() => {
      if (this.api.user) {
        if (!this.nav.getActive())
          this.rootPage = "DashPage";
        this.api.getData();
        this.api.getLang();
        this.api.startEcho();
      }
      else {
        this.rootPage = Login;
      }
    });

    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.platform.registerBackButtonAction(() => {
        if (this.nav.canGoBack())
          return this.nav.pop();
        else {
          this.minimize.minimize();
        }
      });

      this.backgroundmode.enable();
      this.backgroundmode.setDefaults(
        { icon: 'icon', text: "", title: "Residentes Online Administrador", color: "#42f459", bigText: true }
      );
      this.backgroundmode.excludeFromTaskList();
      var sync = () => {
        this.codepush.sync({ updateDialog: false, ignoreFailedUpdates: false, }).subscribe(
          (status) => {
            console.log(status)
            if (status == 8)
              this.splashScreen.show();
          }
          , (err) => { console.warn(err) });

      }
      sync();
      setTimeout(sync, 1000 * 60 * 60 * 6)
    });
  }

  goHome() {
    this.nav.setRoot("DashPage");
    this.nav.popToRoot();
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component)
    // this.nav.setRoot(page.component);
  }

  logout() {
    this.api.storage.clear();
    this.api.stopEcho();
    this.api.user = null;
    // this.rootPage = Login;
    if (!window.url)
      this.api.url = null
    this.nav.setRoot(Login);
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
    if (this.api.roles && this.api.modules && this.api.modules.invoices)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Accounter' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }
  canTickets() {
    if (this.api.roles && this.api.modules && this.api.modules.tickets)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Manage tickets' || this.api.roles[i].name == 'SuperAdmin') {
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
  CanParking() {
    if (this.api.roles && this.api.modules && this.api.modules.parkings)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Manage parkings' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }
  CanCorrespondence() {
    if (this.api.roles && this.api.modules && this.api.modules.correspondences)
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'Celator' || this.api.roles[i].name == 'SuperAdmin') {
          return true;
        }
      }
    return false;
  }
}
