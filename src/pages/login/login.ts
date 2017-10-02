import { DashPage } from './../dash/dash';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, MenuController } from 'ionic-angular';
import { HomePage } from "../home/home";
import { Api } from "../../providers/api";
// import { Facebook } from '@ionic-native/facebook';
// import { GooglePlus } from '@ionic-native/google-plus';
declare var window: any;
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {
  servers = {};
  code = "";
  ready = false;
  preconfigured = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public menuCtrl: MenuController) {
    if (window.url) {
      this.preconfigured = true;
      this.api.storage.set('url', window.url);
    }
  }

  ionViewDidLoad() {
    this.getServers();
  }

  login() {
    let loading = this.loadingCtrl.create({
      content: `
      <div>
        <img class="loading-img" src="${this.api.url + "img/logo.png"}" alt="">
        <h3>Cargando...</h3>
      </div>`,
      // spinner: 'hide',
    });

    loading.present();
    this.api.doLogin()
      .then((data: any) => {
        console.log(data);
        loading.dismiss();
        this.goTo()
        this.api.getData();
        this.api.getLang();
        this.api.startEcho();
      })
      .catch((err) => {
        console.error(err.error);
        if (err.error === 401) {
          let alert = this.alertCtrl.create({
            title: "Error",
            subTitle: 'Usuario y Contraseña Invalidos',
            buttons: ['OK']
          });
          loading.dismiss();
          alert.present();
        } else {
          let alert = this.alertCtrl.create({
            title: "Error",
            subTitle: 'no se pudo hacer login: ' + err.error,
            buttons: ['OK']
          });
          loading.dismiss();
          alert.present();
        }

      });
  }

  verifyCode() {
    if (this.servers[this.code] !== undefined) {
      var server = this.servers[this.code]
      this.api.url = server.url;
      this.api.storage.set('url', server.url);
    }
  }
  goBack() {
    this.api.url = null;
    this.api.storage.remove('url');
  }
  getServers() {
    this.api.http.get('http://residenciasonline.com/residencias/public/servers.json')
      .map(res => res.json())
      .subscribe(data => {
        this.servers = data
        this.ready = true
        console.log(this.servers);
      }, (err) => { console.error(err) });
  }
  /*
  loginWithFacebook() {
    let loading = this.loadingCtrl.create({
      content: `
      <div>
        <img class="loading-img" src="${this.api.url + "img/logo-completo.png"}" alt="">
        <h3>Cargando ...</h3>
      </div>`,
      spinner: 'hide',
    });
    loading.present();
    this.facebook.login(['public_profile', 'email'])
      .then((data) => {
        console.log(data);
        this.facebook.api(`${data.authResponse.userID}/?fields=id,email,name,picture,first_name,last_name,gender`, ['public_profile', 'email']).then((data) => {
          console.log(data);
          this.api.loginOAuth(data).then((data) => {
            console.log(data);
            this.api.saveData(data);
            this.goTo();
            loading.dismiss();
          }).catch((err) => {
            console.error(err);
            loading.dismiss();
            this.alertCtrl.create({
              message: err,
              title: "Error",
            }).present();

          });
        }).catch((err) => {
          console.error(err);
          loading.dismiss();
          this.alertCtrl.create({
            message: err,
            title: "Error",
          }).present();

        })
      }).catch((err) => {
        console.error(err);
        loading.dismiss();
        this.alertCtrl.create({
          message: err,
          title: "Error",
        }).present();

      });
  }

  loginWithGoogle() {
    let loading = this.loadingCtrl.create({
      content: `
      <div>
        <img class="loading-img" src="${this.api.url + "img/logo-completo.png"}" alt="">
        <h3>Cargando ...</h3>
      </div>`,
      spinner: 'hide',
    });
    loading.present();
    this.google.login({ scopes: 'obj.email obj.userId obj.familyName obj.givenName obj.imageUrl' })
      .then((data) => {
        console.log(data);
        loading.dismiss();
      })
      .catch((err) => {
        console.error(err);
        loading.dismiss();
        this.alertCtrl.create({
          message: err,
          title: "Error",
        }).present();
      });
  }
  */

  goTo() {
    this.navCtrl.setRoot(DashPage);
  }

}
