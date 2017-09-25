import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Api } from '../../providers/api';

import moment from 'moment';
@Component({
  selector: 'page-seller',
  templateUrl: 'seller.html',
})
export class SellerPage {
  charge = {
    residence_id: null,
    user_id: null,
    amount: 0,
    quantity: 1,
  }
  items = [{
    concept: '',
    amount: 0,
    quantity: 0,
  }];
  residences = [];
  residents = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public loading: LoadingController, public alert: AlertController, public api: Api) {
  }

  ionViewDidLoad() {
    this.getResidences();

  }

  getResidences() {
    this.api.get('residences')
      .then((data: any) => {
        this.residences = data;
      })
      .catch(console.error)
  }

  getResidents() {
    if (!this.charge.residence_id) {
      return;
    }
    this.api.get('residences/' + this.charge.residence_id + '?with[]=residents')
      .then((data: any) => {
        this.residents = data.residents;
      })
      .catch(console.error)
  }

  clear() {
    this.charge = {
      residence_id: null,
      user_id: null,
      amount: 0,
      quantity: 1,
    }
    this.items = [{
      concept: '',
      amount: 0,
      quantity: 0,
    }];
    this.residents = [];
  }
  addItem() {
    this.items.push({
      concept: '',
      amount: 0,
      quantity: 0,
    })
  }

  removeItem(index) {
    this.items.splice(index, 1);
  }

  proccess() {
    var procesing = 0;
    var loading = this.loading.create({
      content: this.api.trans('__.procesando') + procesing + '  de ' + this.items.length,
    });
    loading.present();
    this.items.forEach(element => {
      this.api.post('charges', {
        'residence_id': this.charge.residence_id,
        'concept': element.concept + "(x" + element.quantity + ")",
        amount: element.amount * element.quantity,
        month: moment().month() + 1,
        year: moment().year(),
        type: "unique",
      })
        .then(() => {
          loading.setContent(this.api.trans('__.procesando') + ++procesing + '  de ' + this.items.length);
          if (procesing == this.items.length) {
            loading.dismiss();
            this.complete();
          }
        })
        .catch((err) => {
          console.error(err);
          loading.dismiss();
          this.alert.create({
            title: "ERROR",
            message: JSON.stringify(err)
          }).present();
        })
    });

  }

  complete() {
    this.alert.create({
      message: this.api.trans('literals.ready'),
      buttons: ["OK"]
    }).present();
    this.clear();
  }

  canProccess() {
    var valid = true;
    this.items.forEach((item) => {
      if (!(item.amount > 0 && item.quantity > 0 && item.concept.length > 0))
        valid = false;
    });
    return this.charge.residence_id != null
      && this.items.length > 0
      && valid;
  }

}
