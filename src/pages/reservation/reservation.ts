import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-reservation',
  templateUrl: 'reservation.html',
})
export class ReservationPage {
  reservation: any = {}
  loading = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionsheet: ActionSheetController, public toast: ToastController, public api: Api) {
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

  actions() {
    var reservation = this.reservation;
    // Actions: Aprove, aprove and get pay, get pay,
    var buttons = [];

    if (reservation.status == "waiting for confirmation") {
      buttons.push({
        cssClass: "icon-secondary",
        icon: "checkmark",
        role: "approve",
        text: this.api.trans("__.approve") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          this.api.alert.create({
            title: this.api.trans("__.desea procesar el pago?"),
            buttons: [{
              text: this.api.trans('literals.yes'),
              handler: () => {
                this.askForMethod(reservation)
              }
            },
            {
              text: this.api.trans('literals.no'),
              handler: () => {
                this.approve(reservation);
              }
            },
            {
              text: this.api.trans('crud.cancel'),
              handler: () => { }
            }
            ]
          }).present();
        },
      })

    }

    if (reservation.status == 'approved' && reservation.invoice_id == null && reservation.charge_id == null) {
      buttons.push({
        cssClass: "icon-secondary",
        icon: "checkmark",
        role: "cash",
        text: this.api.trans("literals.payment") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          this.approve(reservation);
        },
      })

    }

    if (reservation.status != "rejected") {
      buttons.push({
        cssClass: "icon-danger",
        icon: "trash",
        role: "cancel",
        text: this.api.trans("__.reject") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          this.reject(reservation);
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

    this.actionsheet.create({
      title: this.api.trans("literals.reservation") + " " + reservation.user.name,
      subTitle: this.reservation.zone.name,
      buttons: buttons,
    }).present();

  }


  askForMethod(reservation) {
    var alert = this.api.alert.create({
      title: this.api.trans("literals.method"),
      inputs: [
        {
          label: this.api.trans('__.Agregar a la siguiente :invoice', { invoice: this.api.trans('literals.invoice') }),
          type: 'radio',
          value: "charge",
          checked: true,
        },
        {
          label: this.api.trans('__.Facturar Ahora'),
          value: "invoice",
          type: 'radio',
        },
      ],
      buttons: [
        {
          text: this.api.trans("literals.confirm"),
          handler: (data) => {
            if (data == 'charge' || data == 'invoice') {
              this.askForPrice(reservation, data)
            }
          }
        },
        {
          text: this.api.trans('crud.cancel'),
          handler: () => { }
        }
      ]
    })
    alert.present()
  }

  askForPrice(reservation, mode = 'charge') {
    var alert = this.api.alert.create({
      title: this.api.trans("literals.payment"),
      inputs: [
        {
          label: this.api.trans('literals.total'),
          type: 'number',
          value: reservation.total,
          checked: true,
          name: 'total'
        }
      ],
      buttons: [
        {
          text: this.api.trans("literals.confirm"),
          handler: (data) => {
            if (data.total) {
              reservation.total = data.total;
              this.api.put(`reservations/${reservation.id}`, { total: data.total });
              this.proccessPayment(reservation, mode)
            }
          }
        },
        {
          text: this.api.trans('crud.cancel'),
          handler: () => { }
        }
      ]
    })
    alert.present()
  }

  approve(reservation) {
    var promise = this.api.put(`reservations/${reservation.id}`, { status: 'approved' })
    promise
      .then((data) => {
        reservation.status = 'approved';
      })
      .catch((e) => {
        this.api.Error(e);
      })
    return promise

  }

  reject(reservation) {
    var promise = this.api.put(`reservations/${reservation.id}`, { status: 'rejected' })
    promise
      .then((data) => {
        reservation.status = 'rejected';
      })
      .catch((e) => {
        this.api.Error(e);
      })
    return promise;
  }

  proccessPayment(reservation, type = "charge") {
    var promise;
    if (type === 'charge') {
      promise = this.api.post(`reservations/${reservation.id}/charge`, {})
    }
    else {
      promise = this.api.post(`reservations/${reservation.id}/checkIn`, {})
    }

    promise
      .then((data) => {
        this.toast.create({
          message: this.api.trans('__.processed'),
          duration: 3000
        }).present();
      })
      .catch((e) => {
        console.error(e);
        this.api.Error(e);
      })

    return promise;
  }

  dismiss() {
    this.navCtrl.pop({ animation: "ios-transition" });
  }
}
