import { BackgroundMode } from '@ionic-native/background-mode';
import { PanicLogsPage } from './../pages/panic-logs/panic-logs';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, Events } from 'ionic-angular';
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
  permissions = {
    visitors: false,
    accounter: false,
    tickets: false,
    zones: false,
    panics: false,
    parkings: false,
    correspondences: false,
    live_support: false,
  }
  constructor(public platform: Platform, public statusBar: StatusBar, public menuCtrl: MenuController, public splashScreen: SplashScreen, public storage: Storage, public api: Api, public codepush: CodePush, public backgroundmode: BackgroundMode, public minimize: AppMinimize, public events: Events) {
    this.initializeApp();

    this.events.subscribe('login', () => {
      this.SeedPermissions()
    })

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
    var sync = () => {
      this.codepush.sync({ updateDialog: false, ignoreFailedUpdates: false, }).subscribe(
        (status) => {
          console.log(status)
          if (status == 8)
            this.splashScreen.show();
        }
        , (err) => { console.warn(err) });

    }
    sync()
    setTimeout(sync, 1000 * 60 * 60 * 6)

    this.api.ready.then(() => {
      if (this.api.user) {
        // if (!this.nav.getActive())
        this.rootPage = "DashPage";
        this.SeedPermissions()
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

  SeedPermissions() {
    if (this.api.roles && this.api.modules){
      for (var i = 0; i < this.api.roles.length; i++) {
        if (this.api.roles[i].name == 'SuperAdmin') {
          this.permissions = {
            visitors: true,
            accounter: true,
            tickets: true,
            zones: true,
            panics: true,
            parkings: true,
            correspondences: true,
            live_support: false
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
        else if (this.api.roles[i].name == 'Manage correspondences') {
          this.permissions.correspondences = true

        }
      }
    }
    if (this.api.modules.live_support)
      this.permissions.live_support = true
  }
}
