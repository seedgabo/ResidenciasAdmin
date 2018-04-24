import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams, ModalController, Refresher, ActionSheetController } from "ionic-angular";
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
  from = moment().subtract(1, "day");
  to = moment()
    .add(1, "day")
    .startOf("day");
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modal: ModalController,
    public actionsheet: ActionSheetController,
    public api: Api
  ) {}

  ionViewDidLoad() {
    this.api.ready.then(() => {
      this.refresher._top = "50px";
      this.refresher.state = "refreshing";
      this.refresher._beginRefresh();
    });
  }

  getEntries(refresher = null) {
    this.api
      .get(
        `entry_logs?include=worker,visitor,residence,vehicle&order[time]=desc&whereDategte[time]=${this.from.format(
          "Y-MM-DD H:mm:ss"
        )}&limit=500`
      )
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
      return (this.entries = this._entries);
    }
    var f = this.query.toLowerCase();
    var filtered = [];
    this._entries.forEach((e) => {
      if (
        (e.vehicle && e.vehicle.name && e.vehicle.name.toLowerCase().indexOf(f) > -1) ||
        (e.person && e.person.name && e.person.name.toLowerCase().indexOf(f) > -1) ||
        (e.residence && e.residence.name && e.residence.name.toLowerCase().indexOf(f) > -1)
      ) {
        filtered[filtered.length] = e;
      }
    });
    this.entries = filtered;
  }

  viewEntry(entry) {
    this.navCtrl.push("EntryPage", { entry: entry, id: entry.id });
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
      var finder = this._entries.findIndex((e) => {
        return e.id == entry.id;
      });
      if (finder > -1) {
        this._entries.splice(finder, 1);
      }
      this.filter();
    });
  }

  departure(entry) {
    var data = {
      type: "exit",
      user_id: entry.user_id,
      visitor_id: entry.visitor_id,
      vehicle_id: entry.vehicle_id,
      worker_id: entry.worker_id,
      residence_id: entry.residence_id,
      pet_id: entry.pet_id,
      note: entry.note,
      extra: entry.extra,
      entry_log_id: entry.id
    };
    this.api.post("entry_logs", data).then((resp) => {
      this.getEntries();
    });
  }

  actions(entry, i) {
    var buttons = [
      {
        text: this.api.trans("literals.view_resource") + " " + this.api.trans("literals.entry"),
        icon: "eye",
        // cssClass: 'icon-danger',
        handler: () => {
          this.viewEntry(entry);
        }
      },
      {
        text: this.api.trans("crud.edit") + " " + this.api.trans("literals.entry"),
        icon: "create",
        handler: () => {
          this.editEntry(entry);
        }
      },
      {
        text: this.api.trans("crud.delete") + " " + this.api.trans("literals.entry"),
        icon: "trash",
        role: "destructive",
        handler: () => {
          this.removeEntry(entry, i);
        }
      }
    ];

    if (entry.signature_id) {
      buttons.splice(1, 0, {
        text: this.api.trans("literals.view_resource") + " " + this.api.trans("literals.signature"),
        icon: "eye",
        // cssClass: 'icon-danger',
        handler: () => {
          this.viewSignature(entry);
        }
      });
    }

    this.actionsheet
      .create({
        title: this.api.trans("literals.entry log"),
        buttons: buttons
      })
      .present();
  }

  gotoVehicles() {
    this.navCtrl.push("VehiclesPage");
  }
}
