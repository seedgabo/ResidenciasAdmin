import { Component } from "@angular/core";
import { IonicPage, ViewController, NavParams } from "ionic-angular";
@IonicPage()
@Component({
  selector: "page-new-visit",
  templateUrl: "new-visit.html"
})
export class NewVisitPage {
  visit: any = {};
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    this.visit = this.navParams.get("visit");
  }

  ionViewDidLoad() {}

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
