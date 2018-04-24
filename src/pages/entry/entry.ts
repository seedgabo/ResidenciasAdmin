import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Api } from "../../providers/api";
@IonicPage({
  segment: "entries/:id"
})
@Component({
  selector: "page-entry",
  templateUrl: "entry.html"
})
export class EntryPage {
  entry: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
    if (this.navParams.get("entry")) this.entry = Object.assign({}, this.navParams.get("entry"));
    else if (this.navParams.get("id")) {
      this.entry.id = Object.assign({}, this.navParams.get("entry"));
      this.getEntry();
    }
  }

  ionViewDidLoad() {}

  getEntry() {
    this.api
      .get(`entry_logs/${this.entry.id}?attr[]=person&include=user,visitor,worker,vehicle,pet,residence,signature,creator`)
      .then((resp) => {
        this.entry = resp;
      })
      .catch((err) => {
        this.api.Error(err);
      });
  }
}
