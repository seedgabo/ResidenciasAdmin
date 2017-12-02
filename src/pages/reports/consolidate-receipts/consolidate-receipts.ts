import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../../providers/api';
import * as moment from 'moment';

@IonicPage({
  defaultHistory: ["DashPage",]
})
@Component({
  selector: 'page-consolidate-receipts',
  templateUrl: 'consolidate-receipts.html',
})
export class ConsolidateReceiptsPage {
  receipts = []
  products = {}
  sums = {}
  printing = true;
  from;
  to;
  total = 0;
  user;
  residence
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
    this.receipts = this.navParams.get('invoices');

    if (this.navParams.get('print')) {
      this.printing = this.navParams.get('print');
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
    this.sums = {}
    this.total = 0
    if (this.receipts.length > 0) {
      this.from = moment(this.receipts[0].created_at)
      this.to = moment(this.receipts[this.receipts.length - 1].created_at)
    }

    this.receipts.forEach((inv) => {
      inv.items.forEach(item => {
        if (!this.products[item.concept]) {
          this.products[item.concept] = { quantity: item.quantity, amount: item.amount };
        } else {
          this.products[item.concept].quantity += item.quantity;
        }
      });
      this.total += inv.amount;
      this.getPaymentsFromInvoices(inv);
    })
  }

  print() {
    window.print()
  }

  getPaymentsFromInvoices(invoice) {
    var payment = invoice.payment
    if (!payment) {
      this.addTosums("cash", invoice.total)
      return;
    }
    if (this.isJson(payment)) {
      JSON.parse(payment).forEach(pay => {
        this.addTosums(pay.method, pay.amount)
      });
    }
    else {

      this.addTosums(payment, invoice.total)
    }
  }

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (error) {
      return false
    }
    return true;
  }

  addTosums(method, amount) {
    if (!this.sums[method]) {
      this.sums[method] = Number(amount);
    } else {
      this.sums[method] += Number(amount);
    }
  }

}
