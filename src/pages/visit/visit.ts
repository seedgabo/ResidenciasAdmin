import { Component } from "@angular/core";
import { NavController, NavParams, ModalController, ToastController, IonicPage } from "ionic-angular";
import { Api } from "../../providers/api";
import { VisitCreatorPage } from "../visit-creator/visit-creator";

@IonicPage({
  segment: "visits/:id",
  priority: "high"
})
@Component({
  selector: "page-visit",
  templateUrl: "visit.html"
})
export class VisitPage {
  visit: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modal: ModalController,
    public toast: ToastController,
    public api: Api
  ) {
    if (navParams.get("visit")) {
      this.visit = navParams.get("visit");
    } else if (navParams.get("id")) {
      this.visit = { id: navParams.get("id") };
    }
  }

  ionViewDidLoad() {
    this.api
      .get(`visits/${this.visit.id}?include=visitor,visitors,vehicle,parking,creator,residence&append[]=guest`)
      .then((data) => {
        this.visit = data;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  dismiss() {
    this.navCtrl.pop();
  }

  update() {
    var modal = this.modal.create(VisitCreatorPage, { visit: this.visit });
    modal.present();
    modal.onWillDismiss((data) => {
      if (data) {
        this.visit = data;
      }
    });
  }

  viewSignature() {
    this.api
      .get(`images/${this.visit.signature_id}`)
      .then((sign: any) => {
        this.modal
          .create("ImageViewerPage", {
            url: sign.url,
            title: this.visit.person ? this.visit.person.name : ""
          })
          .present();
      })
      .catch((err) => {
        this.api.Error(err);
        console.error(err);
      });
  }

  prepareVisitors(visitors) {
    var obj = {};
    visitors.forEach((person) => {
      obj[person.id] = { status: person.pivot.status };
    });
    return obj;
  }

  done() {
    if (this.navParams.data.done) this.navParams.data.done();
    this.dismiss();
  }
}
