import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
// @IonicPage()
@Component({
  selector: 'page-vehicle-finder',
  templateUrl: 'vehicle-finder.html',
})
export class VehicleFinderPage {
  vehicles: any = {};
  query = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api, public alert: AlertController) {
    this.api.storage.get('recent_vehicles')
      .then((recent_vehicles) => {
        if (recent_vehicles) {
          this.vehicles = recent_vehicles;
        }
      });
  }

  ionViewDidLoad() {
  }
  search() {
    this.api.get(`vehicles?orWhereLike[model]=${this.query}&orWhereLike[color]=${this.query}&orWhereLike[make]=${this.query}&orWhereLike[plate]=${this.query}&paginate=50&with[]=image`)
      .then((data: any) => {
        this.vehicles = data;
        this.api.storage.set('recent_vehicles', data);
      })
      .catch(console.error)
  }
  cancel() {
    this.viewctrl.dismiss(null, "cancel");
  }
  select(vehicle) {
    this.viewctrl.dismiss(vehicle, "accept");
  }

  addQuickVehicle() {
    this.alert.create({
      title: this.api.trans('crud.add') + ' ' + this.api.trans('literals.vehicle'),
      inputs: [
        {
          label: this.api.trans('literals.plate'),
          placeholder: this.api.trans('literals.plate'),
          name: 'plate',
        },
        {
          label: this.api.trans('literals.make'),
          placeholder: this.api.trans('literals.make'),
          name: 'make',
        },
        {
          label: this.api.trans('literals.model'),
          placeholder: this.api.trans('literals.model'),
          name: 'model',
        },
        {
          label: this.api.trans('literals.color'),
          placeholder: this.api.trans('literals.color'),
          name: 'color',
        },
      ],
      buttons: [
        {
          role: 'destructive',
          text: this.api.trans('crud.cancel'),
          handler: (data) => {

          }
        },
        {
          role: 'creative',
          text: this.api.trans('crud.add'),
          handler: (data) => {
            console.log(data);
            if (this.canAddVehicle(data))
              this.addVehicle(data);
          }
        }
      ]
    }).present();
  }

  canAddVehicle(vehicle) {
    return vehicle.model.length > 0 && vehicle.plate.length > 0 && vehicle.make.length > 0
  }

  addVehicle(vehicle) {
    vehicle.residence_id = this.navParams.get('residence_id');
    this.api.post('vehicles', vehicle)
      .then((resp) => {
        this.vehicles.data = [resp];
      })
      .catch(console.error)
  }

}
