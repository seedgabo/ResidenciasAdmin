import { VehicleFinderPage } from './../pages/vehicle-finder/vehicle-finder';
import { PanicLogsPage } from './../pages/panic-logs/panic-logs';
import { PanicPage } from './../pages/panic/panic';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from "@angular/http";
import { MyApp } from './app.component';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Api } from "../providers/api";
import { VisitorPage } from "../pages/visitor/visitor";
import { VisitCreatorPage } from "../pages/visit-creator/visit-creator";
import { PipesModule } from '../pipes/pipes.module'
import { IonicStorageModule } from '@ionic/storage';
import { CodePush } from "@ionic-native/code-push";
import { Printer } from '@ionic-native/printer';
import { Vibration } from '@ionic-native/vibration';
import { BackgroundMode } from '@ionic-native/background-mode';
import { AppMinimize } from '@ionic-native/app-minimize';


import { VisitPage } from "../pages/visit/visit";
import { ProductSearchPage } from '../pages/product-search/product-search';
import { SettingProvider } from '../providers/setting/setting';
import { NewtonProvider } from '../providers/newton/newton';
@NgModule({
  declarations: [
    MyApp,
    VisitorPage,
    VisitPage,
    VisitCreatorPage,
    PanicPage,
    PanicLogsPage,
    ProductSearchPage,
    VehicleFinderPage,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    PipesModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    VisitorPage,
    VisitPage,
    VisitCreatorPage,
    PanicPage,
    PanicLogsPage,
    ProductSearchPage,
    VehicleFinderPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    CodePush,
    Printer,
    Vibration,
    BackgroundMode,
    AppMinimize,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Api,
    SettingProvider,
    NewtonProvider
  ]
})
export class AppModule { }
