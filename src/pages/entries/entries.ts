import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Api } from "../../providers/api";
@IonicPage()
@Component({
  selector: "page-entries",
  templateUrl: "entries.html"
})
export class EntriesPage {
  entries: any = { data: [] };
  entry = {};
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {}

  ionViewDidLoad() {}

  getEntries() {
    this.api
      .get("entry_logs?paginate=150")
      .then((data) => {
        this.entries = data;
      })
      .catch((err) => {
        this.api.Error(err);
        console.error(err);
      });
  }

  // TODO
  filter() {}

  // TODO
  viewEntry() {}

  // TODO
  postEntry() {}
}
