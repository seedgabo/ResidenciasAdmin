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
  residence = null;
  parking = null;
  parkings = [];
  loading = false;
  dirty = false
  show_visits_button = true
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public viewCtrl: ViewController, public modal: ModalController) {
    var visitor = navParams.get('visitor')
    var residence = navParams.get('residence')

    if (visitor)
      this.visitor = visitor

    if (this.visitor.id)
      this.action = 'update'

    if (residence)
      this.residence = residence
    else if (this.api.objects.residences)
      this.residence = this.api.objects.residence[visitor.residence_id]
    else
      this.residence = this.visitor.residence
    if (navParams.get('show_visits_button') !== undefined)
      this.show_visits_button = navParams.get('show_visits_button')


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

  selectResidence() {
    var modal = this.modal.create("ResidenceFinderPage", {});
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.residence = data;
        this.visitor.residence_id = data.id;
      }
      else {
        this.visitor.residence_id = null;
        this.residence = null;
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
    this.loading = true;
    var data = {
      name: this.visitor.name,
      document: this.visitor.document,
      residence_id: this.visitor.residence_id,
      sex: this.visitor.sex,
      relationship: this.visitor.relationship,
      notes: this.visitor.notes
    };
    if (this.action == 'create') {
      this.api.post('visitors?with[]=residence', data).then((response) => {
        console.log(response);
        if (this.api.objects.visitors) {
          this.api.objects.visitors.push(response)
        }
        this.viewCtrl.dismiss(response);
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
        this.api.Error(err);
      });
    }
    if (this.action == 'update') {
      this.api.put('visitors/' + this.visitor.id + "?with[]=residence", data).then((response) => {
        console.log(response);
        if (this.api.objects.visitors) {
          this.api.objects.visitors.forEach((v) => {
            if (v.id == this.visitor.id) {
              v = response;
            }
          })
        }
        this.loading = false;
        this.viewCtrl.dismiss(response);
      }).catch((err) => {
        this.loading = false;
        this.api.Error(err);
      });
    }

  }

  loadParkings() {
    this.api.get('parkings?where[status]=available&limit=500')
      .then((parkings: any) => {
        this.parkings = parkings;
      }).catch((err) => {
        this.api.Error(err);
      })
  }

  saveWithVisit() {
    this.loading = true
    var data = {
      name: this.visitor.name,
      document: this.visitor.document,
      residence_id: this.visitor.residence_id,
      sex: this.visitor.sex,
      relationship: this.visitor.relationship,
      notes: this.visitor.notes
    };
    if (this.action == 'create') {
      this.api.post('visitors', data).then((response) => {
        console.log(response);
        this.addVisit(response)
      }).catch((err) => {
        this.loading = false;
        this.api.Error(err);
      });
    }
    if (this.action == 'update') {
      this.api.put('visitors/' + this.visitor.id, data).then((response) => {
        console.log(response);
        this.addVisit(response)
      }).catch((err) => {
        console.log(err);
        this.loading = false;
        this.api.Error(err);
      });
    }

  }

  addVisit(visitor) {
    this.loading = true
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
      this.viewCtrl.dismiss({ visitor: visitor, visit: response, residence: this.residence });
      this.loading = false;
    }).catch((err) => {
      this.api.Error(err)
      this.loading = false;
    });
  }

}
