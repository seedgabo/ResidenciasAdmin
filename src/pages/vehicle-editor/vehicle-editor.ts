import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Api } from './../../providers/api';

@IonicPage()
@Component({
  selector: 'page-vehicle-editor',
  templateUrl: 'vehicle-editor.html',
})
export class VehicleEditorPage {
  vehicle = {
    make: '',
    plate: '',
    model: '',
    type: 'car',
    color: '',
    owner_id: null,
    residence_id: null,
    visitor_id: null,
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api) {
    if (navParams.get('vehicle')) {
      this.vehicle = navParams.get('vehicle');
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VehicleEditorPage');
  }
  confirm() {
    this.viewctrl.dismiss(this.vehicle, 'accept');
  }

  cancel() {
    this.viewctrl.dismiss(null, 'cancel');
  }

  canAdd() {
    return this.vehicle.make.length > 0
      && this.vehicle.plate.length > 0
      && this.vehicle.model.length > 0
      && this.vehicle.type.length > 0
      && this.vehicle.color.length > 0
  }

}
