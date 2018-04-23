import { ModalController } from "ionic-angular";
import { Component } from "@angular/core";
import { NavController, NavParams, ViewController } from "ionic-angular";
import { Api } from "../../providers/api";
@Component({
  selector: "page-visit-creator",
  templateUrl: "visit-creator.html"
})
export class VisitCreatorPage {
  visitor: any;
  multiple = false;
  signature;
  visit: any = {
    status: "waiting for confirmation",
    note: ""
  };
  vehicle;
  statutes = ["waiting for confirmation", "approved", "rejected", "departured"];
  loading: any = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: Api,
    public viewCtrl: ViewController,
    public modal: ModalController
  ) {
    console.log(navParams.get("visitor"));
    if (navParams.get("visitor")) this.visitor = navParams.get("visitor");
  }

  ionViewDidLoad() {
    this.api.load("parkings");
    this.loadParkings();
  }

  loadParkings() {}

  dismiss() {
    this.viewCtrl.dismiss();
  }

  changeMode() {
    this.multiple = !this.multiple;
    if (this.multiple) {
      this.visit.status = "approved";
    }
  }

  create() {
    if (this.multiple) {
      return this.createMultiple();
    }
    this.loading = true;
    this.api
      .post(`visitors/${this.visitor.id}/visit`, this.visit)
      .then((data: any) => {
        if (this.signature) {
          this.loading = "uploading signature";
          this.api
            .uploadSignature("visit", data.id, this.signature)
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
          this.viewCtrl.dismiss(data);
          this.loading = false;
        }
      })
      .catch((err) => {
        this.loading = false;
        this.api.Error(err);
      });
  }

  createMultiple() {
    this.loading = true;
    var data = {
      status: this.visit.status,
      note: this.visit.note,
      visitor_id: this.visitor[0].person.id,
      parking_id: this.visit.parking_id,
      vehicle_id: this.visit.parking_id,
      visitors: this.visitor.map((v) => {
        return v.person.id;
      })
    };
    this.api
      .post(`visits`, data)
      .then((data: any) => {
        if (this.signature) {
          this.loading = "uploading signature";
          this.api
            .uploadSignature("visit", data.id, this.signature)
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

  canSave() {
    if (this.multiple) {
      return this.visitor && this.visitor.length && this.visit.status;
    }
    return this.visitor && this.visit.status;
  }

  selectVehicle(data) {
    if (data && data.id) {
      this.visit.vehicle_id = data.id;
      this.vehicle = data;
    }
  }
}
