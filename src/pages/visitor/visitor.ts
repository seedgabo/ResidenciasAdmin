import { VehicleFinderPage } from './../vehicle-finder/vehicle-finder';
import { ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Api } from "../../providers/api";
@Component({
  selector: 'page-visitor',
  templateUrl: 'visitor.html',
})
export class VisitorPage {
  action: string = 'create';
  visitor: any = { sex: 'male' };
  vehicle = null;
  parking = null;
  parkings = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public viewCtrl: ViewController, public modal: ModalController) {
    var visitor = navParams.get('visitor');
    if (visitor) {
      this.visitor = visitor;
      this.action = 'update';
    }


  }

  ionViewDidLoad() {
  }

  selectVehicle() {
    var modal = this.modal.create(VehicleFinderPage, { residence_id: this.visitor.residence_id });
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.vehicle = data;
        this.loadParkings();
      }
      else {
        this.vehicle = null;
      }
    });
  }


  dismiss() {
    if (this.action == 'update')
      this.visitor = this.navParams.get('visitor');
    this.viewCtrl.dismiss();
  }

  canSave() {
    return this.visitor.name && this.visitor.name.length > 3 && this.visitor.document && this.visitor.residence_id;
  }

  save() {
    var data = {
      name: this.visitor.name,
      document: this.visitor.document,
      residence_id: this.visitor.residence_id,
      sex: this.visitor.sex
    };
    if (this.action == 'create') {
      this.api.post('visitors', data).then((response) => {
        console.log(response);
        this.viewCtrl.dismiss();
      }).catch((err) => {
        console.log(err);
      });
    }
    if (this.action == 'update') {
      this.api.put('visitors/' + this.visitor.id, data).then((response) => {
        console.log(response);
        this.viewCtrl.dismiss();
      }).catch((err) => {
        console.log(err);
      });
    }

  }

  loadParkings() {
    this.api.get('parkings?where[status]=available&limit=500')
      .then((parkings: any) => {
        this.parkings = parkings;
      }).catch((err) => {
        console.error(err);
      })
  }

  saveWithVisit() {
    var data = {
      name: this.visitor.name,
      document: this.visitor.document,
      residence_id: this.visitor.residence_id,
      sex: this.visitor.sex
    };
    if (this.action == 'create') {
      this.api.post('visitors', data).then((response) => {
        console.log(response);
        this.addVisit(response)
      }).catch((err) => {
        console.log(err);
      });
    }
    if (this.action == 'update') {
      this.api.put('visitors/' + this.visitor.id, data).then((response) => {
        console.log(response);
        this.addVisit(response)
      }).catch((err) => {
        console.log(err);
      });
    }

  }

  addVisit(visitor) {
    var visit: any = {
      status: "waiting for confirmation",
      visitor_id: visitor.id,
      residence_id: visitor.residence_id
    }
    if (this.vehicle) {
      visit.vehicle_id = this.vehicle.id;
    }
    if (this.parking) {
      visit.parking_id = this.parking.id;
    }

    this.api.post(`visitors/${visitor.id}/visit`, visit).then((response) => {
      console.log(response);
      this.viewCtrl.dismiss();
    }).catch((err) => {
      console.log(err);
    });
  }

}
