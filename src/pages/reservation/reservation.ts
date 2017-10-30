import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-reservation',
  templateUrl: 'reservation.html',
})
export class ReservationPage {
  reservation: any = {}
  loading = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionsheet: ActionSheetController, public api: Api) {
    this.reservation = navParams.get('reservation');
  }

  ionViewDidLoad() {
    this.getReservation();
  }

  getReservation() {
    this.loading = true
    this.api.get(`reservations/${this.reservation.id}?with[]=user&with[]=zone&with[]=charge&with[]=invoice&with[]=event&with[]=user.residence`)
      .then((data: any) => {
        this.loading = false;
        this.reservation = data;
      })
      .catch((err) => {
        this.loading = false;
        this.api.Error(err);
      })
  }

  // TODO actions approve and reject 
  actions(reservation) {
    // Actions: Aprove, aprove and get pay, get pay,
    var buttons = [];

    if (reservation.status == "waiting for confirmation") {
      buttons.push({
        cssClass: "icon-secondary",
        icon: "checkmark",
        role: "approve",
        text: this.api.trans("literals.approve") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          // TODO: Pay Transsaction
        },
      })

      buttons.push({
        cssClass: "icon-secondary",
        icon: "checkmark",
        role: "cash",
        text: this.api.trans("literals.payment") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          // TODO: Approve Transsaction
        },
      })
    }

    if (reservation.status != "rejected") {
      buttons.push({
        cssClass: "icon-danger",
        icon: "trash",
        role: "cancel",
        text: this.api.trans("literals.reject") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          // TODO: Reject Transsaction
        },
      })
    }

    buttons.push({
      cssClass: "icon-danger",
      icon: "close",
      role: "cancel",
      text: this.api.trans("crud.cancel"),
      handler: () => {
      },
    })


    buttons.push({
      cssClass: "icon-danger",
      icon: "close",
      role: "cancel",
      text: this.api.trans("crud.cancel"),
      handler: () => {
      },
    })

    this.actionsheet.create({
      title: this.api.trans("literals.reservation") + " " + reservation.user.name,
      subTitle: this.reservation.zone.name,
      buttons: buttons,
    }).present();

  }

  dismiss() {
    this.navCtrl.pop({ animation: "ios-transition" });
  }
}
