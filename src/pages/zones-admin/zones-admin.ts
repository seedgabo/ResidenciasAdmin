import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { Api } from '../../providers/api';
@Component({
  selector: 'page-zones-admin',
  templateUrl: 'zones-admin.html',
})
export class ZonesAdminPage {
  zones = [];
  zone = null;
  constructor(public navCtrl: NavController, public navParams: NavParams, public toast: ToastController, public api: Api) {
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
    this.api.get('reservations?with[]=user&with[]=user.residence&where[zone_id]=' + zone.id + '&whereDateGte[date]=' + date.toString() + "&paginate=100&order[start]=desc")
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

}
