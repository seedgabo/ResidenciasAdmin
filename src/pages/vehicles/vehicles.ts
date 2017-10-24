import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-vehicles',
  templateUrl: 'vehicles.html',
})
export class VehiclesPage {
  vehicles = [];
  _vehicles = [];
  loading = false;
  query = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public action: ActionSheetController, public api: Api) {
  }

  ionViewDidLoad() {
    this.getVehicles();
  }

  getVehicles(refresher = null) {
    this.loading = true;
    this.query = "";
    this.vehicles = this.api.vehicles;
    this.api.get("vehicles?with[]=residences&with[]=user&with[]=visitor")
      .then((data: any) => {
        this.vehicles = data;
        this._vehicles = data;
        this.api.vehicles = data;
        this.loading = false;
        if (refresher)
          refresher.complete();
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
        if (refresher)
          refresher.complete();
      });
  }

  filter() {
    if (this.query === "")
      return this.vehicles = this._vehicles;
    var finder = this.query.toLowerCase();
    this.vehicles = this._vehicles.filter((v) => {
      return v.name.toLowerCase().indexOf(finder) > - 1
        || v.plate.toLowerCase().indexOf(finder) > - 1
        || (v.user && v.user.name.toLowerCase().indexOf(finder) > - 1)
        || (v.residence && v.residence.name.toLowerCase().indexOf(finder) > - 1)
        || (v.residence && v.residence.name.toLowerCase().indexOf(finder) > - 1)
        || (v.visitor && v.visitor.name.toLowerCase().indexOf(finder) > - 1)
    });

  }

  actions(vehicle) {
    return;
    /*
    var buttons = [
      {
        icon: "create",
        text: this.api.trans("crud.edit"),
        role: "create",
        cssClass: "icon-primary",
        handler: () => {

        }
      },
      {
        icon: "camera",
        text: this.api.trans("crud.edit") + " " + this.api.trans('literals.image'),
        cssClass: "icon-secondary",
        handler: () => { }
      },
      {
        icon: "trash",
        text: this.api.trans("crud.delete") + " " + this.api.trans('literals.vehicle'),
        role: "destructive",
        cssClass: "icon-danger",
        handler: () => { }
      },
      {
        icon: "close",
        text: this.api.trans("crud.cancel"),
        role: "cancel",
        handler: () => { }
      }
    ];


    this.action.create({
      title: this.api.trans('literals.actions') + " " + vehicle.plate,
      buttons: buttons
    }).present();
    */
  }

}
