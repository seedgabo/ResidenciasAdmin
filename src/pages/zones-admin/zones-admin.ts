import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ActionSheetController } from 'ionic-angular';
import { Api } from '../../providers/api';
@Component({
  selector: 'page-zones-admin',
  templateUrl: 'zones-admin.html',
})
export class ZonesAdminPage {
  zones = [];
  zone = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, public toast: ToastController, public actionsheet: ActionSheetController, public api: Api) {
  }

  ionViewDidLoad() {
    this.getZones();
  }

  getZones() {
    // this.api.get('zones?with[]=schedule&with[]=image')
    //   .then((data: any) => {
    //     console.log(data);
    //     this.zones = data;
    //   })
    //   .catch(console.error)
    this.api.get('users/' + this.api.user.id + '?with[]=zones&with[]=zones.schedule&with[]=zones.image')
      .then((data: any) => {
        console.log(data, data.zones);
        this.zones = data.zones;
      })
      .catch(console.error)
  }

  getReservations(zone, date = null) {
    if (!date)
      date = new Date();
    this.api.get('reservations?with[]=user&with[]=user.residence&where[zone_id]=' + zone.id + '&whereDateGte[date]=' + date.toString() + "&paginate=150&order[start]=desc")
      .then((data) => {
        console.log(data);
        zone.reservations = data;
      })
      .catch(console.error)
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
      limit_user: this.zone.limit_user,
    }

    this.api.put('zones/' + this.zone.id, zone)
      .then((data) => {
        this.deselect();
        this.toast.create({
          message: this.api.trans('literals.zone') + " " + this.api.trans('crud.updated'),
          duration: 2000
        }).present();
      })
      .catch((err) => {
        console.error(err);
      })
  }

  // TODO: Rollback payment
  actions(reservation) {
    var buttons = [{
      cssClass: "icon-primary",
      icon: "eye",
      role: "view",
      text: this.api.trans("literals.view_resource"),
      handler: () => {
        this.navCtrl.push("ReservationPage", { reservation: reservation }, { animation: "ios-transition" });
      },
    }];

    if (reservation.status == "waiting for confirmation") {
      buttons.push({
        cssClass: "icon-secondary",
        icon: "checkmark",
        role: "approve",
        text: this.api.trans("literals.approve") + " " + this.api.trans("literals.reservation"),
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

    if (reservation.status != 'approved' && reservation.invoice_id == null && reservation.charge_id == null) {
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
        text: this.api.trans("literals.reject") + " " + this.api.trans("literals.reservation"),
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
      subTitle: this.zone.name,
      buttons: buttons,
    }).present();

  }


  askForMethod(reservation) {
    var alert = this.api.alert.create({
      title: this.api.trans("literals.method"),
      inputs: [
        {
          checked: true,
          label: this.api.trans('__.Agregar a la siguiente :invoice', { invoice: this.api.trans('literals.invoice') }),
          value: "charge"
        },
        {
          checked: true,
          label: this.api.trans('__.Facturar Ahora'),
          value: "invoice"
        },
      ],
      buttons: [
        {
          text: this.api.trans("literals.confirm"),
          handler: (data) => {
            if (data == 'charge' || data == 'invoice') {
              this.proccessPayment(reservation, data)
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
      promise = this.api.post(`reservations${reservation.id}/charge`, {})
    }
    else {
      promise = this.api.post(`reservations${reservation.id}/checkIn`, {})
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



}
