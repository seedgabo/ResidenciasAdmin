import { VehicleFinderPage } from "./../pages/vehicle-finder/vehicle-finder";
import { PanicPage } from "./../pages/panic/panic";
import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { HttpModule } from "@angular/http";
import { MyApp } from "./app.component";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { Api } from "../providers/api";
import { VisitorPage } from "../pages/visitor/visitor";
import { VisitCreatorPage } from "../pages/visit-creator/visit-creator";
import { PipesModule } from "../pipes/pipes.module";
import { IonicStorageModule } from "@ionic/storage";
import { CodePush } from "@ionic-native/code-push";
import { Printer } from "@ionic-native/printer";
import { Vibration } from "@ionic-native/vibration";
import { BackgroundMode } from "@ionic-native/background-mode";
import { AppMinimize } from "@ionic-native/app-minimize";
import { Facebook } from "@ionic-native/facebook";
import { GooglePlus } from "@ionic-native/google-plus";

import { VisitPage } from "../pages/visit/visit";
import { ProductSearchPage } from "../pages/product-search/product-search";
import { SettingProvider } from "../providers/setting/setting";
import { NewtonProvider } from "../providers/newton/newton";
import { PopoverMenu } from "./../pages/popover/popover-menu";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider
} from "angular5-social-login";
import { ComponentsModule } from "../components/components.module";
// Configs
export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig([
    {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider("796212907168839")
    },
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(
        "425679220353-u39prig4hkrjg592lnppmnbfj6lvi4qk.apps.googleusercontent.com"
      )
    }
  ]);
  return config;
}

import Raven from "raven-js";
import { ENV } from "@app/env";
Raven.config(
  "http://62637449e79f4f8482a177a69e46764c@residenciasonline.com:6010/4"
).install();

export class SentryErrorHandler extends IonicErrorHandler {
  handleError(error) {
    super.handleError(error);

    try {
      if (ENV.mode == "Production") {
        Raven.captureException(error.originalError || error);
      }
    } catch (e) {
      console.error(e);
    }
  }
}

@NgModule({
  declarations: [
    MyApp,
    VisitorPage,
    VisitPage,
    VisitCreatorPage,
    PanicPage,
    ProductSearchPage,
    VehicleFinderPage
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    PipesModule,
    ComponentsModule,
    SocialLoginModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    VisitorPage,
    VisitPage,
    VisitCreatorPage,
    PanicPage,
    ProductSearchPage,
    VehicleFinderPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    CodePush,
    Printer,
    Vibration,
    BackgroundMode,
    AppMinimize,
    Facebook,
    GooglePlus,
    // { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    { provide: AuthServiceConfig, useFactory: getAuthServiceConfigs },
    Api,
    SettingProvider,
    NewtonProvider,
    PopoverMenu
  ]
})
export class AppModule {}
