import { Component } from "@angular/core";
import { IonicPage, NavParams, ViewController, ModalController } from "ionic-angular";
import moment from "moment";
@IonicPage()
@Component({
  selector: "page-reservation-filter",
  templateUrl: "reservation-filter.html"
})
export class ReservationFilterPage {
  filters = {
    user_id: null,
    start: moment().format("YYYY-MM-DD"),
    end: moment()
      .add(1, "day")
      .format("YYYY-MM-DD")
  };
  person;
  constructor(public viewctrl: ViewController, public navParams: NavParams, public modal: ModalController) {
    if (this.navParams.get("filters")) {
      this.filters = this.navParams.get("filters");
      this.filters.start = moment(this.filters.start).format("YYYY-MM-DD");
      this.filters.end = moment(this.filters.end).format("YYYY-MM-DD");
    }
  }

  ionViewDidLoad() {}

  close() {
    this.viewctrl.dismiss(this.filters);
  }
  selectPerson() {
    var modal = this.modal.create("PersonFinderPage", {
      visitors: false,
      users: true,
      workers: false
    });
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        this.person = data.person;
        return;
      }
      console.log(data);
      this.person = data.person;
      this.filters.user_id = data.person.id;
    });
  }
}
