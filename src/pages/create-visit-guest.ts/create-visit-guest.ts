import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, IonicPage } from 'ionic-angular';
import { Api } from "../../providers/api";
@IonicPage()
@Component({
  selector: 'page-create-visit-guest',
  templateUrl: 'create-visit-guest.html',
})
export class CreateVisitGuestPage {
  visit: any = {
    status: 'waiting for confirmation',
    guest: {
      name: "",
      document: "",
      reason: this.api.trans("literals.delivery")
    }
  }
  statutes = ['waiting for confirmation', 'approved', 'rejected', 'departured'];
  loading = false
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public viewCtrl: ViewController) {
    var guest = navParams.get('guest');
    if (guest) {
      this.visit.guest = guest
    }

    if (navParams.get('residence')) {
      this.visit.residence_id = navParams.get('residence').id;
    } else {
      this.visit.residence_id = this.api.residence.id;
    }


    if (navParams.get('user')) {
      this.visit.creator_id = navParams.get('residence').id;
    } else {
      this.visit.creator_id = this.api.user.id;
    }

    if (navParams.get('status')) {
      this.visit.status = navParams.get('status');
    }
  }

  ionViewDidLoad() {
  }

  create() {
    this.loading = true;
    this.api.post('visits', this.visit)
      .then((data: any) => {
        console.log(data);
        this.api.post('visits/' + data.id + '/visit', {})
          .then((resp) => {
            console.log(resp);
            this.loading = false
            this.dismiss();
          })
          .catch((err) => {
            this.loading = false
            this.api.Error(err)
          })
      })
      .catch((err) => {
        this.loading = false
        this.api.Error(err)
      })
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  canSave() {
    return this.visit.guest.name.length > 0 && this.visit.guest.reason.length > 0
  }

}
