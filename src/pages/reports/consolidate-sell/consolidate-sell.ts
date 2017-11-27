import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../../providers/api';
import * as moment from 'moment';

@IonicPage({
  defaultHistory: ["DashPage",]
})
@Component({
  selector: 'page-consolidate-sell',
  templateUrl: 'consolidate-sell.html',
})
export class ConsolidateSellPage {
  invoices = []
  products = {}
  print = true;
  from;
  to;
  user;
  residence
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
    this.invoices = this.navParams.get('invoices');

    if (this.navParams.get('print')) {
      this.print = this.navParams.get('print');
    }


    if (this.navParams.get('user')) {
      this.user = this.navParams.get('user');
      this.residence = this.navParams.get('residence');
    } else {
      this.user = this.api.user;
      this.residence = this.api.residence;
    }
  }

  ionViewDidLoad() {
    this.calculate()
  }

  calculate() {
    this.products = {}
    if (this.invoices.length > 0) {
      this.from = moment(this.invoices[0].created_at)
      this.to = moment(this.invoices[this.invoices.length - 1].created_at)
    }

    this.invoices.forEach((inv) => {
      inv.items.forEach(item => {
        if (!this.products[item.concept]) {
          this.products[item.concept] = { quantity: item.quantity, amount: item.amount };
        } else {
          this.products[item.concept].quantity += item.quantity;
        }
      });
    })
  }

}
