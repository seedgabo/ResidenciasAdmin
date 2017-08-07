import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Api } from "../../providers/api";

/**
 * Generated class for the VisitorPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
// @IonicPage()
@Component({
  selector: 'page-visitor',
  templateUrl: 'visitor.html',
})
export class VisitorPage {
  action: string = 'create';
  visitor: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public viewCtrl: ViewController) {
    var visitor = navParams.get('visitor');
    if (visitor) {
      this.visitor = visitor;
      this.action = 'update';
    }


  }

  ionViewDidLoad() {
  }
  dismiss() {
    if (this.action == 'update')
      this.visitor = this.navParams.get('visitor');
    this.viewCtrl.dismiss();
  }
  canSave() {
    return this.visitor.name && this.visitor.name.length > 3 && this.visitor.document && this.visitor.residence_id;
  }
  save() {
    var data = {
      name: this.visitor.name,
      document: this.visitor.document,
      residence_id: this.visitor.residence_id,
      sex: this.visitor.sex
    };
    if (this.action == 'create') {
      this.api.post('visitors', data).then((response) => {
        console.log(response);
        this.viewCtrl.dismiss();
      }).catch((err) => {
        console.log(err);
      });
    }
    if (this.action == 'update') {
      this.api.put('visitors/' + this.visitor.id, data).then((response) => {
        console.log(response);
        this.viewCtrl.dismiss();
      }).catch((err) => {
        console.log(err);
      });
    }

  }

}
