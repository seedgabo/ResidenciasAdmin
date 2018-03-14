import { ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Api } from "../../providers/api";
@Component({
  selector: 'page-visit-creator',
  templateUrl: 'visit-creator.html',
})
export class VisitCreatorPage {
  visitor: any;
  multiple = false;
  visit: any = {
    status: "waiting for confirmation",
  }
  vehicle;
  statutes = ['waiting for confirmation', 'approved', 'rejected', 'departured'];
  loading = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public viewCtrl: ViewController, public modal: ModalController) {
    console.log(navParams.get('visitor'))
    if (navParams.get('visitor'))
      this.visitor = navParams.get('visitor');
  }

  ionViewDidLoad() {
    this.api.load('parkings')
    this.loadParkings();
  }

  loadParkings() {
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }


  changeMode() {
    this.multiple = !this.multiple;
    if (this.multiple) {
      this.visit.status = 'approved'
    }
  }

  create() {
    if (this.multiple) {
      return this.createMultiple();
    }
    this.loading = true;
    this.api.post(`visitors/${this.visitor.id}/visit`, this.visit).then((response) => {
      console.log(response);
      this.viewCtrl.dismiss();
      this.loading = false;
    }).catch((err) => {
      this.loading = false;
      this.api.Error(err);
    });
  }

  createMultiple() {
    this.loading = true;
    var data = {
      status: this.visit.status,
      visitor_id: this.visitor[0].person.id,
      parking_id: this.visit.parking_id,
      vehicle_id: this.visit.parking_id,
      visitors: this.visitor.map((v) => { return v.person.id })
    }
    this.api.post(`visits`, data).then((response) => {
      console.log(response);
      this.loading = false
      this.viewCtrl.dismiss();
    })
      .catch((err) => {
        this.loading = false
        this.api.Error(err)
      })
  }

  canSave() {
    if (this.multiple) {
      return this.visitor && this.visitor.length && this.visit.status
    }
    return this.visitor && this.visit.status
  }

  selectVehicle(data) {
    if (data && data.id) {
      this.visit.vehicle_id = data.id;
      this.vehicle = data;
    }
  }

}
