import { Api } from './../../providers/api';
import { Printer } from '@ionic-native/printer';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-print-invoice',
  templateUrl: 'print-invoice.html',
})
export class PrintInvoicePage {
  invoice: any = {};
  receipt: any = {};
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public printer: Printer) {
    this.invoice = navParams.get('invoice');
    this.receipt = navParams.get('receipt');
    if (navParams.get('user')) {
      this.invoice.user = navParams.get('user');
    }
    console.log(this.invoice);
  }

  ionViewDidLoad() {
    if (this.navParams.get('print')) {
      this.print(this.invoice);
    }
  }
  print(invoice, receipt = null) {
    setTimeout(() => {
      this.printer.print(document.getElementById('toPrint'), { name: 'invoice' })
        .then(() => {
          this.complete();
          this.invoice = null;
        })
        .catch((err) => {
          this.toPrintCallback(invoice);
          console.error(err);
        });

    }, 1000);
  }

  toPrintCallback(invoice) {
    window.print();
    this.complete();
    this.invoice = null;
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
