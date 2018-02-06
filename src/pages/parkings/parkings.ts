import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { Api } from "../../providers/api";

@IonicPage()
@Component({
  selector: 'page-parkings',
  templateUrl: 'parkings.html'
})
export class ParkingsPage {
  selectedItem: any;
  query = "";
  parkings = [];
  loading = false
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }

  ionViewDidLoad() {
    this.api.ready.then(() => {
      this.getParkings();
    })
  }

  getParkings() {
    this.loading = true;
    this.api.load('parkings')
      .then(() => {
        this.parkings = this.api.objects.parkings;
        this.filter()
      })
      .catch((err) => {
        this.api.Error(err)
      })
  }

  filter() {
    if (this.query == "") {
      this.loading = false;
      return this.parkings = this.api.parkings = this.api.objects.parkings;
    }

    this.parkings = this.api.objects.parkings.filter((park) => {
      if (park.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1)
        return true;
      if (park.user && park.user.full_name.toLowerCase().indexOf(this.query.toLowerCase()) > -1)
        return true;

      return false;
    });
    this.loading = false;
  }



  park(parking) {
    var status = parking.status == 'available' ? 'occuped' : 'available';
    this.api.put('parkings/' + parking.id, { status: status }).then((response) => {
      console.log(response);
      parking.status = status;
    });
  }
}
