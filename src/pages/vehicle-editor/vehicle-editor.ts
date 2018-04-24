import { ModalController } from "ionic-angular";
import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, ViewController } from "ionic-angular";
import { Api } from "./../../providers/api";

@IonicPage()
@Component({
  selector: "page-vehicle-editor",
  templateUrl: "vehicle-editor.html"
})
export class VehicleEditorPage {
  vehicle: any = {
    make: "",
    plate: "",
    model: "",
    type: "car",
    color: "",
    owner_id: null,
    residence_id: null,
    visitor_id: null
  };
  residence;
  person;
  type;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewctrl: ViewController,
    public api: Api,
    public modal: ModalController
  ) {
    if (navParams.get("vehicle")) {
      this.vehicle = navParams.get("vehicle");
    }
    if (this.vehicle.residence) this.residence = this.vehicle.residence;
    else if (this.vehicle.residence && this.api.objects.residences)
      this.residence = this.api.objects.residences.collection[this.vehicle.residence_id];

    if (this.vehicle.owner) this.person = this.vehicle.owner;
    if (this.vehicle.visitor) this.person = this.vehicle.visitor;
  }

  ionViewDidLoad() {}

  selectResidence() {
    var modal = this.modal.create("ResidenceFinderPage", {});
    modal.present();
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.residence = data;
        this.vehicle.residence_id = data.id;
      } else {
        this.vehicle.residence_id = null;
        this.residence = null;
      }
    });
  }

  selectPerson() {
    var modal = this.modal.create("PersonFinderPage", {
      users: true,
      visitors: true,
      workers: true
    });
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        this.person = null;
        this.type = null;
        this.vehicle.visitor_id = null;
        this.vehicle.worker_id = null;
        this.vehicle.owner_id = null;
        return;
      }

      this.person = data.person;
      if (data.type == "visitor") {
        this.vehicle.visitor_id = data.person.id;
      }
      if (data.type == "worker") {
        this.vehicle.worker_id = data.person.id;
      }
      if (data.type == "user") {
        this.vehicle.owner_id = data.owner.id;
      }
      this.person.type = data.type;
      this.type = data.type;
    });
  }

  confirm() {
    this.viewctrl.dismiss(this.vehicle, "accept");
  }

  cancel() {
    this.viewctrl.dismiss(null, "cancel");
  }

  canAdd() {
    return (
      this.vehicle.make.length > 0 &&
      this.vehicle.plate.length > 0 &&
      this.vehicle.model.length > 0 &&
      this.vehicle.type.length > 0 &&
      this.vehicle.color.length > 0
    );
  }
}
