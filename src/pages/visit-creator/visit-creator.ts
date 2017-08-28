import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Api } from "../../providers/api";

/**
 * Generated class for the VisitCreatorPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
// @IonicPage()
@Component({
  selector: 'page-visit-creator',
  templateUrl: 'visit-creator.html',
})
export class VisitCreatorPage {
  visitor: any = {};
  visit: any = {
    status: "waiting for confirmation",
  }
  statutes = ['waiting for confirmation', 'approved', 'rejected', 'departured'];
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public viewCtrl: ViewController) {
    console.log(navParams.get('visitor'))
    this.visitor = navParams.get('visitor');
  }

  ionViewDidLoad() {
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  create() {
    this.api.post(`visitors/${this.visitor.id}/visit`, this.visit).then((response) => {
      console.log(response);
      this.viewCtrl.dismiss();
    }).catch((err) => {
      console.log(err);
    });
  }

}
