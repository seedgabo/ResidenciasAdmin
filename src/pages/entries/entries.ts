import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams, ModalController, Refresher } from "ionic-angular";
import { Api } from "../../providers/api";

import moment from "moment";
moment.locale("es-US");
@IonicPage()
@Component({
  selector: "page-entries",
  templateUrl: "entries.html"
})
export class EntriesPage {
  @ViewChild(Refresher) refresher: Refresher;

  _entries: any = { data: [] };
  entries = [];
  entry = {};
  searching = false;
  query = "";
  constructor(public navCtrl: NavController, public navParams: NavParams, public modal: ModalController, public api: Api) {}

  ionViewDidLoad() {
    this.api.ready.then(() => {
      this.refresher._top = "50px";
      this.refresher.state = "refreshing";
      this.refresher._beginRefresh();
    });
  }

  getEntries(refresher = null) {
    this.api
      .get("entry_logs?include=worker,visitor,residence,vehicle&order[time]=desc&paginate=150")
      .then((data) => {
        this._entries = data;
        this.filter();
        if (refresher) refresher.complete();
      })
      .catch((err) => {
        this.api.Error(err);
        console.error(err);
        if (refresher) refresher.complete();
      });
  }

  filter() {
    if (this.query == "") {
      return (this.entries = this._entries.data);
    }
    var f = this.query.toLowerCase();
    var filtered = [];
    this._entries.data.forEach((e) => {
      if (
        (e.vehicle && e.vehicle.name && e.vehicle.name.indexOf(f) > -1) ||
        (e.person && e.person.name && e.person.name.indexOf(f) > -1) ||
        (e.residence && e.residence.name && e.residence.name.indexOf(f) > -1)
      ) {
        filtered[filtered.length] = e;
      }
    });
    this.entries = filtered;
  }

  viewEntry() {
    var modal = this.modal.create("EntryPage");
    modal.present();
  }

  viewSignature(entry) {
    this.api
      .get(`images/${entry.signature_id}`)
      .then((sign: any) => {
        this.modal
          .create("ImageViewerPage", {
            url: sign.url,
            title: entry.person ? entry.person.name : ""
          })
          .present();
      })
      .catch((err) => {
        this.api.Error(err);
        console.error(err);
      });
  }

  addEntry() {
    var modal = this.modal.create("EntryEditorPage");
    modal.present();
    modal.onWillDismiss(() => {
      this.getEntries();
    });
  }

  editEntry(entry) {
    var modal = this.modal.create("EntryEditorPage", { entry: entry, id: entry.id });
    modal.present();
    modal.onWillDismiss(() => {
      this.getEntries();
    });
  }

  removeEntry(entry, index) {
    this.api.delete(`entry_logs/${entry.id}`).then((response) => {
      var finder = this._entries.data.findIndex((e) => {
        return e.id == entry.id;
      });
      if (finder > -1) {
        this._entries.data.splice(finder, 1);
      }
      this.filter();
    });
  }
}
