import { Component } from "@angular/core";
import { IonicPage, ViewController, NavParams } from "ionic-angular";
import moment from "moment";
import { Api } from "../../providers/api";
@IonicPage()
@Component({
  selector: "page-entry-editor",
  templateUrl: "entry-editor.html"
})
export class EntryEditorPage {
  type = "user";
  entry: any = {
    type: "entry",
    vehicle: null,
    residence: null,
    person: null,
    time: moment().format("YYYY-MM-DDTHH:mm"),
    note: "",
    extra: [
      {
        name: "Kilometraje",
        value: ""
      }
    ]
  };
  loading: any = false;
  constructor(public viewCtrl: ViewController, public navParams: NavParams, public api: Api) {
    if (this.navParams.get("entry")) {
      this.entry = Object.assign({}, this.navParams.get("entry"));
      this.entry.time = moment(this.entry.time).format("YYYY-MM-DDTHH:mm");
    }
    if (!this.entry.extra) {
      this.entry.extra = [
        {
          name: "Kilometraje",
          value: ""
        }
      ];
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  changePerson(data) {
    this.entry.user_id = null;
    this.entry.visitor_id = null;
    this.entry.worker_id = null;
    if (data) {
      this.entry[data.type + "_id"] = data.person.id;
    }
  }
  changeVehicle(data) {
    this.entry.vehicle_id = null;
    if (data) {
      this.entry.vehicle_id = data.id;
    }
  }
  changeResidence(data) {
    this.entry.residence_id = null;
    if (data) {
      this.entry.residence_id = data.id;
    }
  }

  canSave() {
    return this.entry.person && this.entry.vehicle && this.entry.time;
  }

  save() {
    var promise: Promise<any>;
    this.loading = true;
    var data = {
      type: this.entry.type,
      user_id: this.entry.user_id,
      visitor_id: this.entry.visitor_id,
      vehicle_id: this.entry.vehicle_id,
      worker_id: this.entry.worker_id,
      residence_id: this.entry.residence_id,
      pet_id: this.entry.pet_id,
      note: this.entry.note,
      extra: this.entry.extra
    };

    if (this.entry.id) {
      promise = this.api.put("entry_logs/" + this.entry.id + "?with[]=user&with[]=visitor&with[]=worker&with[]=vehicle", data);
    } else {
      promise = this.api.post("entry_logs?with[]=user&with[]=visitor&with[]=worker&with[]=vehicle", data);
    }
    promise
      .then((data) => {
        if (this.entry.signature) {
          this.loading = "uploading signature";
          this.api
            .uploadSignature("EntryLog", data.id, this.entry.signature)
            .then((response: any) => {
              console.log("signature response:", response);
              this.loading = false;
              data.signature_id = response.signature.id;
              this.viewCtrl.dismiss(data);
            })
            .catch((err) => {
              this.loading = false;
              this.api.Error(err);
            });
        } else {
          this.loading = false;
          this.viewCtrl.dismiss(data);
        }
      })
      .catch((err) => {
        this.loading = false;
        this.api.Error(err);
      });
  }
}
