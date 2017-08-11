import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, MenuController } from 'ionic-angular';
import { HomePage } from "../home/home";
import { Api } from "../../providers/api";
// import { Facebook } from '@ionic-native/facebook';
// import { GooglePlus } from '@ionic-native/google-plus';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public menuCtrl: MenuController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
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
        this.api.getLang();
        this.api.startEcho();
        this.menuCtrl.enable(true);
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
    this.navCtrl.setRoot(HomePage);
  }

}
