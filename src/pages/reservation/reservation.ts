import { AlertController, LoadingController } from 'ionic-angular';
import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import * as moment from 'moment';
@IonicPage()
@Component({
  selector: 'page-reservation',
  templateUrl: 'reservation.html',
})
export class ReservationPage {
  reservation: any = {}
  loading = false;
  edition = false;
  start;
  end;
  monthNames = moment.localeData('es').months();
  constructor(public navCtrl: NavController, public navParams: NavParams, public actionsheet: ActionSheetController, public alert: AlertController, public modal: ModalController, public toast: ToastController, public loadingctrl: LoadingController, public api: Api) {
    this.reservation = navParams.get('reservation');
    if (navParams.get('edition')) {
      this.edition = true;
    }
    this.start = moment.utc(this.reservation.start).format('YYYY-MM-DDTHH:mm')
    this.end = moment.utc(this.reservation.end).format('YYYY-MM-DDTHH:mm')
    console.log(this.start, this.end)
  }

  ionViewDidLoad() {
    this.getReservation();
  }
  changeDate(key) {
    this.reservation[key] = moment(this[key]).toDate();
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
    var buttons = [{
      text: this.api.trans('crud.edit'),
      icon: 'create',
      cssClass: "icon-success",
      role: 'edit',
      handler: () => {
        this.edition = !this.edition;
      }
    }];

    if (reservation.status != "approved") {
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
        icon: "close-circle",
        role: "reject",
        text: this.api.trans("__.reject") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          this.reject(reservation);
        },
      })
    }

    if (reservation.invoice_id) {
      buttons.push({
        cssClass: "icon-success",
        icon: "document",
        role: "view",
        text: this.api.trans("literals.view_resource") + " " + this.api.trans("literals.invoice"),
        handler: () => {
          this.api.get("invoices/" + reservation.invoice_id + "?with[]=user&with[]=receipts&with[]=items")
            .then((data: any) => {
              if (data.receipts && data.receipts.length > 0) {
                data.receipt = data.receipts[0]
              }
              this.goPrint(data.invoice, data.receipt);
            })
            .catch((err) => {
              console.error(err);
              this.api.Error(err)
            })
        },
      })
    }



    buttons.push({
      cssClass: "icon-danger",
      icon: "trash",
      role: "destructive",
      text: this.api.trans("crud.delete"),
      handler: () => {
        this.delete();
      },
    })
    buttons.push({
      cssClass: "icon-normal",
      icon: "close",
      role: "cancel",
      text: this.api.trans("crud.cancel"),
      handler: () => {
      },
    })

    this.actionsheet.create({
      title: this.api.trans("literals.reservation") + " " + reservation.user.name,
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
    return new Promise((resolve, reject) => {
      this.api.alert.create({
        title: this.api.trans('__.Nota de cancelación'),
        inputs: [{
          label: this.api.trans('literals.notes'),
          name: 'note',
          placeholder: this.api.trans('literals.notes'),

        }],
        buttons: [{
          text: this.api.trans('literals.send'),
          handler: (data) => {
            var promise = this.api.put(`reservations/${reservation.id}`, { status: 'rejected', 'note': data.note })
            promise
              .then((resp) => {
                reservation.status = 'rejected';
                reservation.note = data.note;
                this.sendPush(this.api.trans('literals.reservation') + " " + this.api.trans('literals.rejected') + ": " + data.note, reservation)
                resolve(resp);
              })
              .catch((e) => {
                reject(e)
                this.api.Error(e);
              })
          }
        },
        {
          text: this.api.trans('crud.cancel'),
          handler: () => {
            reject()
          }
        }
        ]
      }).present();

    })
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
        var loading = this.loadingctrl.create({
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
        if (reservation.user) {
          data.residence_id = reservation.user.residence_id
        }
        this.api.post('invoices', data)
          .then((invoice: any) => {
            this.api.post(`invoices/${invoice.id}/Payment`, { transaction: payment })
              .then((data: any) => {
                this.api.put(`reservations/${reservation.id}`, { status: 'approved', invoice_id: invoice.id })
                  .then((data) => {
                    reservation.status = 'approved'
                    reservation.invoice_id = invoice.id
                  })
                this.sendPush("Compra Realizada! " + concept, reservation);
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


  selectPerson() {
    var modal = this.modal.create('PersonFinderPage', {
      users: true,
      visitors: false,
      workers: false,
    })
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        return;
      }
      console.log(data);
      this.reservation.user_id = data.person.id;
      this.reservation.residence_id = data.person.residence_id;
      this.reservation.user = data.person;
    })
  }

  save() {
    var promise: Promise<any>
    this.loading = true;
    var data = {
      user_id: this.reservation.user_id,
      quotas: this.reservation.quotas,
      notes: this.reservation.notes,
      start: this.reservation.start,
      end: this.reservation.end,
      zone_id: this.reservation.zone_id,
      event_id: this.reservation.event_id,
    }
    if (this.reservation.id) {
      promise = this.api.put('reservations/' + this.reservation.id, data)
    }
    else {
      promise = this.api.post('reservations', data)
    }
    promise.then((resp) => {
      this.edition = false;
      this.loading = false;
    })
      .catch((err) => {
        this.api.Error(err);
        this.loading = false;
      })

  }

  delete() {
    this.loading = true;
    this.api.delete('reservations/' + this.reservation.id)
      .then((data) => {
        this.loading = false;
        this.dismiss();
      })
      .catch((err) => {
        this.loading = false;
        this.api.Error(err);
      })
  }

  canSave() {
    return this.reservation.user && this.reservation.start && this.reservation.end
  }



  dismiss() {
    this.navCtrl.pop({ animation: "ios-transition" });
  }


}
