import { VehicleFinderPage } from './../pages/vehicle-finder/vehicle-finder';
import { DashPage } from './../pages/dash/dash';
import { PanicLogsPage } from './../pages/panic-logs/panic-logs';
import { PanicPage } from './../pages/panic/panic';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from "@angular/http";
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { Login } from "../pages/login/login";
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Api } from "../providers/api";
import { ParkingsPage } from "../pages/parkings/parkings";
import { VisitorPage } from "../pages/visitor/visitor";
import { VisitCreatorPage } from "../pages/visit-creator/visit-creator";
import { ZonesAdminPage } from "../pages/zones-admin/zones-admin";

import { IonicStorageModule } from '@ionic/storage';
import { TransPipe } from "../pipes/trans/trans";
import { MomentModule } from 'angular2-moment';
import { CodePush } from "@ionic-native/code-push";
import { Printer } from '@ionic-native/printer';

import { VisitPage } from "../pages/visit/visit";
import { SellerPage } from "../pages/seller/seller";
import { ProductSearchPage } from '../pages/product-search/product-search';
@NgModule({
  declarations: [
    MyApp,
    DashPage,
    HomePage,
    ListPage,
    Login,
    ParkingsPage,
    VisitorPage,
    VisitPage,
    VisitCreatorPage,
    PanicPage,
    SellerPage,
    ZonesAdminPage,
    PanicLogsPage,
    ProductSearchPage,
    VehicleFinderPage,
    TransPipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    MomentModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    DashPage,
    HomePage,
    ListPage,
    Login,
    ParkingsPage,
    VisitorPage,
    VisitPage,
    VisitCreatorPage,
    PanicPage,
    SellerPage,
    ZonesAdminPage,
    PanicLogsPage,
    ProductSearchPage,
    VehicleFinderPage,


  ],
  providers: [
    StatusBar,
    SplashScreen,
    CodePush,
    Printer,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Api
  ]
})
export class AppModule { }
