import { AlertController, LoadingController, IonicPage, PopoverController } from 'ionic-angular';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ActionSheetController } from 'ionic-angular';
import { Api } from '../../providers/api';
import moment from 'moment';
@IonicPage()
@Component({ selector: 'page-zones-admin', templateUrl: 'zones-admin.html' })
export class ZonesAdminPage {
  zones = [];
  zone = null;
  filters = {
    user_id: null,
    start: new Date(),
    end: new Date(),
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, public toast: ToastController, public actionsheet: ActionSheetController, public alert: AlertController, public loadingctrl: LoadingController, public api: Api, public popover: PopoverController) { }

  ionViewDidLoad() {
    this.getZones();
  }

  ionViewDidEnter() {
    this.refresh();
  }

  refresh(refresher = null) {
    this.getZones();
    if (this.zone) {
      this.getReservations(this.zone);
    }
    if (refresher) {
      refresher.complete()
    }
  }

  getZones() {
    // this.api.get('zones?with[]=schedule&with[]=image')   .then((data: any) => {
    // console.log(data);     this.zones = data;   })   .catch(console.error)
    this.api.get('users/' + this.api.user.id + '?with[]=zones&with[]=zones.schedule&with[]=zones.image')
      .then((data: any) => {
        console.log(data, data.zones);
        this.zones = data.zones;
      })
      .catch(console.error)
  }

  getReservations(zone) {
    this.filter
    var filter = `&where[zone_id]=${zone.id}&whereDateGte[start]=${moment(this.filters.start).startOf('day').format('YYYY-MM-DD HH:mm:ss')}&whereDatelwe[end]=${moment(this.filters.end).startOf('day').add(1, 'day').format('YYYY-MM-DD HH:mm:ss')}&paginate=150&order[start]=asc`
    if (this.filters.user_id)
      filter += `&where[user_id]=${this.filters.user_id}`
    this.api.get('reservations?with[]=zone&with[]=user&with[]=user.residence' + filter)
      .then((data) => {
        console.log(data);
        zone.reservations = data;
      })
      .catch((err) => {
        this.api.Error(err)
      })
  }
  filter(ev) {
    var popover = this.popover.create("ReservationFilterPage", this.filter)
    popover.present({ ev: ev })
    popover.onWillDismiss((data) => {
      if (data) {
        this.filters = data
        if (!data.start) {
          data.start = new Date()
        }
        if (!data.end) {
          data.end = new Date()
        }
        this.getReservations(this.zone);
      }
    })
  }

  selectZone(zone) {
    this.zone = zone;
    this.getReservations(this.zone);
  }

  deselect() {
    this.zone = null;
  }

  save() {
    var zone = {
      name: this.zone.name,
      description: this.zone.description,
      price: this.zone.price,
      limit_user: this.zone.limit_user
    }

    this.api.put('zones/' + this.zone.id, zone)
      .then((data) => {
        this.deselect();
        this.toast.create({
          message: this.api.trans('literals.zone') + " " + this.api.trans('crud.updated'),
          duration: 2000
        })
          .present();
      })
      .catch((err) => {
        console.error(err);
      })
  }

  actions(reservation) {
    var buttons = [
      {
        cssClass: "icon-primary",
        icon: "document",
        role: "view",
        text: this.api.trans("literals.view_resource") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          this.navCtrl.push("ReservationPage", { reservation: reservation })
        }
      }
    ];

    if (reservation.status != "approved") {
      buttons.push({
        cssClass: "icon-secondary",
        icon: "checkmark",
        role: "approve",
        text: this.api.trans("__.approve") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          this.api.alert
            .create({
              title: this.api.trans("__.desea procesar el pago?"),
              buttons: [
                {
                  text: this.api.trans('literals.yes'),
                  handler: () => {
                    this.askForMethod(reservation)
                  }
                }, {
                  text: this.api.trans('literals.no'),
                  handler: () => {
                    this.approve(reservation);
                  }
                }, {
                  text: this.api.trans('crud.cancel'),
                  handler: () => { }
                }
              ]
            })
            .present();
        }
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
        }
      })

    }

    if (reservation.status != "rejected") {
      buttons.push({
        cssClass: "icon-danger",
        icon: "trash",
        role: "reject",
        text: this.api.trans("__.reject") + " " + this.api.trans("literals.reservation"),
        handler: () => {
          this.reject(reservation);
        }
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
              this.goPrint(data, data.receipt);
            })
            .catch((err) => {
              console.error(err);
              this.api.Error(err)
            })
        }
      })
    }

    buttons.push({
      cssClass: "icon-normal",
      icon: "close",
      role: "cancel",
      text: this.api.trans("crud.cancel"),
      handler: () => { }
    })

    this
      .actionsheet
      .create({
        title: this.api.trans("literals.reservation") + " " + reservation.user.name,
        subTitle: reservation.zone.name,
        buttons: buttons
      })
      .present();

  }

  askForMethod(reservation) {
    var alert = this.api.alert
      .create({
        title: this.api.trans("literals.method"),
        inputs: [
          {
            label: this.api.trans('__.Agregar a la siguiente :invoice', {
              invoice: this.api.trans('literals.invoice')
            }),
            type: 'radio',
            value: "charge",
            checked: true
          }, {
            label: this.api.trans('__.Facturar Ahora'),
            value: "invoice",
            type: 'radio'
          }
        ],
        buttons: [
          {
            text: this.api.trans("literals.confirm"),
            handler: (data) => {
              if (data == 'charge' || data == 'invoice') {
                this.askForPrice(reservation, data)
              }
            }
          }, {
            text: this.api.trans('crud.cancel'),
            handler: () => { }
          }
        ]
      })
    alert.present()
  }

  askForPrice(reservation, mode = 'charge') {
    var alert = this.api.alert
      .create({
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
            text: this
              .api
              .trans("literals.confirm"),
            handler: (data) => {
              if (data.total) {
                reservation.total = data.total;
                this
                  .api
                  .put(`reservations/${reservation.id}`, { total: data.total });
                this.proccessPayment(reservation, mode)
              }
            }
          }, {
            text: this
              .api
              .trans('crud.cancel'),
            handler: () => { }
          }
        ]
      })
    alert.present()
  }

  approve(reservation) {
    var promise = this
      .api
      .put(`reservations/${reservation.id}`, { status: 'approved' })
    promise.then((data) => {
      reservation.status = 'approved';
    }).catch((e) => {
      this.api.Error(e);
    })
    return promise

  }

  reject(reservation) {
    return new Promise((resolve, reject) => {
      this
        .api
        .alert
        .create({
          title: this.api.trans('__.Nota de cancelación'),
          inputs: [
            {
              label: this.api.trans('literals.notes'),
              name: 'note',
              placeholder: this.api.trans('literals.notes')
            }
          ],
          buttons: [
            {
              text: this.api.trans('literals.send'),
              handler: (data) => {
                var promise = this.api.put(`reservations/${reservation.id}`, {
                  status: 'rejected',
                  'note': data.note
                })
                promise.then((resp) => {
                  reservation.status = 'rejected';
                  reservation.note = data.note;
                  this.sendPush(this.api.trans('literals.reservation') + " " + this.api.trans('literals.rejected') + ": " + data.note, reservation)
                  resolve(resp);
                }).catch((e) => {
                  reject(e)
                  this.api.Error(e);
                })
              }
            }, {
              text: this.api.trans('crud.cancel'),
              handler: () => {
                reject()
              }
            }
          ]
        })
        .present();

    })
  }

  proccessPayment(reservation, type = "charge") {
    var promise: Promise<any>;
    var message;
    if (type === 'charge') {
      promise = this.api.post(`reservations/${reservation.id}/charge`, {})
      message = this.api.trans('__.Se ha generado un nuevo cargo a su factura')
    } else {
      message = this.api.trans('__.Se ha generado una nueva factura por una reservacion');
      promise = this.proccessWithInvoice(reservation, type)
    }

    promise.then((data) => {
      this.toast.create({
        message: this
          .api
          .trans('__.processed'),
        duration: 3000
      })
        .present();
      reservation.status = "approved";
      this.sendPush(message, reservation)
    }).catch((e) => {
      console.error(e);
      this.api.Error(e);
    })
    return promise;
  }

  proccessWithInvoice(reservation, type) {
    return new Promise((resolve, reject) => {
      this.askForPayment().then((payment) => {
        var loading = this.loadingctrl.create({
          content: this.api.trans('__.procesando')
        });
        loading.present();
        var concept = this.api.trans('literals.reservation') + " " + reservation.zone.name
        var data: any = {
          items: [
            {
              concept: concept,
              amount: reservation.total,
              quantity: 1
            }
          ],
          type: 'normal',
          date: (new Date()).toISOString().substring(0, 10),
          user_id: reservation.user_id
        };
        if (reservation.user) {
          data.residence_id = reservation.user.residence_id
        }

        this
          .api
          .post('invoices', data)
          .then((invoice: any) => {
            this.api.post(`invoices/${invoice.id}/Payment`, { transaction: payment })
              .then((data: any) => {
                this.api.put(`reservations/${reservation.id}`, {
                  status: 'approved',
                  invoice_id: invoice.id
                })
                  .then((data) => {
                    reservation.status = 'approved'
                    reservation.invoice_id = invoice.id
                  })
                this.sendPush("Compra Realizada! " + concept, reservation);
                invoice.person = reservation.user
                invoice.user = reservation.user
                this.saveInvoice(invoice, data.receipt)
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

  saveInvoice(invoice, receipt = null) {
    invoice.receipt = receipt
    this.api.storage.get('invoices_history').then((invoices_history) => {
      if (!invoices_history) {
        invoices_history = [];
      }
      invoices_history.push(invoice);
      this.api.storage.set('invoices_history', invoices_history);
    })
  }

  goPrint(invoice, receipt = null) {
    this
      .navCtrl
      .push("PrintInvoicePage", {
        invoice: invoice,
        receipt: receipt,
        print: true
      });
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
          }, {
            type: 'radio',
            label: this.api.trans('literals.debit_card'),
            value: 'debit card'
          }, {
            type: 'radio',
            label: this.api.trans('literals.credit_card'),
            value: 'credit card'
          }, {
            type: 'radio',
            label: this.api.trans('literals.transfer'),
            value: 'transfer'
          }, {
            type: 'radio',
            label: this.api.trans('literals.deposit'),
            value: 'deposit'
          }
        ],
        buttons: [
          {
            role: 'accept',
            text: this.api.trans('crud.add'),
            handler: (data) => {
              console.log("transaction", data);
              resolve(data);
            }
          }, {
            role: 'destructive',
            text: this.api.trans('crud.cancel'),
            handler: (data) => {
              reject();
            }
          }
        ]
      })
        .present();
    })
  }

  sendPush(message, reservation) {
    var user_id = reservation.user_id
    this.api.post('push/' + user_id + '/notification', { message: message })
      .then(() => { })
      .catch((error) => {
        console.error(error);
      })
  }

}
