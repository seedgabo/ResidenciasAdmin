import { VehicleFinderPage } from './../vehicle-finder/vehicle-finder';
import { ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Api } from "../../providers/api";
@Component({
  selector: 'page-visit-creator',
  templateUrl: 'visit-creator.html',
})
export class VisitCreatorPage {
  visitor: any = {};
  visit: any = {
    status: "waiting for confirmation",
  }
  vehicle;
  statutes = ['waiting for confirmation', 'approved', 'rejected', 'departured'];
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public viewCtrl: ViewController, public modal: ModalController) {
    console.log(navParams.get('visitor'))
    this.visitor = navParams.get('visitor');
  }

  ionViewDidLoad() {
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  create() {
    this.api.post(`visitors/${this.visitor.id}/visit`, this.visit).then((response) => {
      console.log(response);
      this.viewCtrl.dismiss();
    }).catch((err) => {
      console.log(err);
    });
  }
  selectVehicle() {
    var modal = this.modal.create(VehicleFinderPage);
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.visit.vehicle_id = data.id;
        this.vehicle = data;
      }
    });
  }

}
