import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, ModalController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-reservation-filter',
  templateUrl: 'reservation-filter.html',
})
export class ReservationFilterPage {
  filters = {
    user_id: null,
    start: null,
    end: null,
  };
  person;
  constructor(public viewctrl: ViewController, public navParams: NavParams, public modal: ModalController) {
    if (this.navParams.get('filters')) {
      this.filters = this.navParams.get('filters');
    }
  }

  ionViewDidLoad() {
  }

  close() {
    this.viewctrl.dismiss(this.filters)
  }
  selectPerson() {
    var modal = this.modal.create('PersonFinderPage', {
      visitors: false,
      users: true,
      workers: false
    })
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        this.person = data.person;
        return;
      }
      console.log(data);
      this.person = data.person;
      this.filters.user_id = data.person.id;
    })

  }

}
