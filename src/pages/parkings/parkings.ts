import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Api } from "../../providers/api";

@Component({
  selector: 'page-parkings',
  templateUrl: 'parkings.html'
})
export class ParkingsPage {
  selectedItem: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }

  ionViewDidLoad() {
    this.api.get('parkings?with[]=user')
      .then((parkings: any) => {
        this.api.parkings = parkings;
      }).catch((err) => {
        console.error(err);
      })
  }

  park(parking) {
    var status = parking.status == 'available' ? 'occuped' : 'available';
    this.api.put('parkings/' + parking.id, { status: status }).then((response) => {
      console.log(response);
      parking.status = status;
    });
  }
}
