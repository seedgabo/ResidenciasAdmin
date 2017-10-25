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
  parkings = [];
  statutes = ['waiting for confirmation', 'approved', 'rejected', 'departured'];
  loading = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public viewCtrl: ViewController, public modal: ModalController) {
    console.log(navParams.get('visitor'))
    this.visitor = navParams.get('visitor');
  }

  ionViewDidLoad() {
    this.loadParkings();
  }

  loadParkings() {
    this.api.get('parkings?where[status]=available&limit=500')
      .then((parkings: any) => {
        this.parkings = parkings;
      }).catch((err) => {
        console.error(err);
      })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  create() {
    this.loading = true;
    this.api.post(`visitors/${this.visitor.id}/visit`, this.visit).then((response) => {
      console.log(response);
      this.viewCtrl.dismiss();
      this.loading = false;
    }).catch((err) => {
      this.loading = false;
      this.api.Error(err);
      console.log(err);
    });
  }

  selectVehicle() {
    var modal = this.modal.create(VehicleFinderPage, { residence_id: this.visitor.residence_id });
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.visit.vehicle_id = data.id;
        this.vehicle = data;
      }
    });
  }

}
