import { Api } from './../../providers/api';
import { Printer } from '@ionic-native/printer';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-print-invoice',
  templateUrl: 'print-invoice.html',
})
export class PrintInvoicePage {
  invoice: any = {};
  receipt: any = {};
  payments = null;
  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public api: Api, public printer: Printer) {
    this.invoice = navParams.get('invoice');
    this.receipt = navParams.get('receipt');
    if (navParams.get('user')) {
      this.invoice.user = navParams.get('user');
    }
    if (navParams.get('receipt')) {
      this.invoice.receipt = navParams.get('receipt');
    }
    this.prepare();
  }
  prepare() {
    if (this.invoice.user) {
      this.invoice.person = this.invoice.user
    }
    if (this.invoice.visitor) {
      this.invoice.person = this.invoice.visitor
    }
    if (this.invoice.worker) {
      this.invoice.person = this.invoice.worker
    }
    if (this.isJson(this.invoice.payment)) {
      this.payments = JSON.parse(this.invoice.payment);
    }
  }

  ionViewDidLoad() {

    if (this.navParams.get('print') === undefined || this.navParams.get('print')) {
      this.print(this.invoice);
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

  print(invoice, receipt = null) {
    setTimeout(() => {
      if (!this.platform.is('mobile')) {
        return this.toPrintCallback(invoice);
      };
      this.printer.print(document.getElementById('toPrint'), { name: 'invoice' })
        .then(() => {
          this.complete();
        })
        .catch((err) => {
          this.toPrintCallback(invoice);
          console.error(err);
        });

    }, 1200);
  }

  toPrintCallback(invoice) {
    window.print();
    this.complete();
  }

  complete() {
    this.navCtrl.pop();
  }

  total() {
    var items = this.invoice.items
    var total = 0;
    items.forEach((item) => {

      total += item.amount * item.quantity;
    });
    return total;
  }
}
