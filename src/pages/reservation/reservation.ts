import { AlertController } from 'ionic-angular';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionsheet: ActionSheetController, public alert: AlertController, public toast: ToastController, public api: Api) {
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

  actions(reservation) {
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
          this.askForMethod(reservation)
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
      subTitle: reservation.zone.name,
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
    var promise: Promise<any>;
    var message;
    if (type === 'charge') {
      promise = this.api.post(`reservations/${reservation.id}/charge`, {})
      message = this.api.trans('__.Se ha generado un nuevo cargo a su factura')
    }
    else {
      message = this.api.trans('__.Se ha generado una nueva factura por una reservacion');
      promise = this.proccessWithInvoice(reservation, type)
    }

    promise
      .then((data) => {
        this.toast.create({
          message: this.api.trans('__.processed'),
          duration: 3000
        }).present();
        reservation.status = "approved";
        this.sendPush(message, reservation)
      })
      .catch((e) => {
        console.error(e);
        this.api.Error(e);
      })

    return promise;
  }

  proccessWithInvoice(reservation, type) {
    return new Promise((resolve, reject) => {
      this.askForPayment().then((payment) => {
        var loading = this.loading.create({
          content: this.api.trans('__.procesando'),
        });
        loading.present();
        var concept = this.api.trans('literals.reservation') + " " + reservation.zone.name
        var data: any = {
          items: [{
            concept: concept,
            amount: reservation.total,
            quantity: 1,
          }],
          type: 'normal',
          date: (new Date()).toISOString().substring(0, 10),
          user_id: reservation.user_id
        };

        this.api.post('invoices', data)
          .then((invoice: any) => {
            this.api.post(`invoices/${invoice.id}/Payment`, { transaction: payment })
              .then((data: any) => {
                this.api.put(`reservations/${reservation.id}`, { status: 'approved' })
                  .then((data) => {
                    reservation.status = 'approved'
                  })
                this.sendPush("Compra Realizada! " + concept, reservation.user_id);
                invoice.user = reservation.user
                this.goPrint(invoice, data.receipt);
                loading.dismiss();
                resolve(invoice)
              })
              .catch((err) => {
                loading.dismiss();
                this.api.Error(err)
                reject(err);
              });

          })
          .catch((err) => {
            loading.dismiss();
            this.api.Error(err)
            reject(err);
          });
      })
        .catch((err) => {
          this.api.Error(err)
          reject(err);
        })
    })

  }

  goPrint(invoice, receipt = null) {
    this.navCtrl.push("PrintInvoicePage", { invoice: invoice, receipt: receipt, print: true });
  }

  askForPayment() {
    return new Promise((resolve, reject) => {
      this.alert.create({
        title: this.api.trans('literals.payment'),
        inputs: [
          {
            type: 'radio',
            label: this.api.trans('literals.cash'),
            value: 'cash',
            checked: true
          },
          {
            type: 'radio',
            label: this.api.trans('literals.debit_card'),
            value: 'debit card',
          },
          {
            type: 'radio',
            label: this.api.trans('literals.credit_card'),
            value: 'credit card',
          },
          {
            type: 'radio',
            label: this.api.trans('literals.transfer'),
            value: 'transfer',
          },
          {
            type: 'radio',
            label: this.api.trans('literals.deposit'),
            value: 'deposit',
          },
        ],
        buttons: [
          {
            role: 'accept',
            text: this.api.trans('crud.add'),
            handler: (data) => {
              console.log("transaction", data);
              resolve(data);
            }
          },
          {
            role: 'destructive',
            text: this.api.trans('crud.cancel'),
            handler: (data) => {
              reject();
            }
          },
        ]
      }).present();
    })
  }


  sendPush(message, reservation) {
    var user_id = reservation.user_id
    this.api.post('push/' + user_id + '/notification', { message: message })
      .then(() => {

      })
      .catch((error) => {
        console.error(error);
      })
  }



  dismiss() {
    this.navCtrl.pop({ animation: "ios-transition" });
  }


}
