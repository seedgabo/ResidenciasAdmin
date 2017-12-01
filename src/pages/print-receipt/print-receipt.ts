import { Api } from './../../providers/api';
import { Printer } from '@ionic-native/printer';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-print-receipt',
  templateUrl: 'print-receipt.html',
})
export class PrintReceiptPage {
  receipt: any = {}
  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public printer: Printer, public api: Api) {
    this.receipt = navParams.get('receipt');
    this.prepare();
  }
  prepare() {
    if (this.receipt.user) {
      this.receipt.person = this.receipt.user
    }
    if (this.receipt.visitor) {
      this.receipt.person = this.receipt.visitor
    }
    if (this.receipt.worker) {
      this.receipt.person = this.receipt.worker
    }
  }

  ionViewDidLoad() {

    if (this.navParams.get('print') === undefined || this.navParams.get('print')) {
      this.print();
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

  print() {
    setTimeout(() => {
      if (!this.platform.is('mobile')) {
        return this.toPrintCallback();
      };
      this.printer.print(document.getElementById('toPrint'), { name: 'invoice' })
        .then(() => {
          this.complete();
        })
        .catch((err) => {
          this.toPrintCallback();
          console.error(err);
        });

    }, 1200);
  }

  toPrintCallback() {
    window.print();
    this.complete();
  }

  complete() {
    this.navCtrl.pop();
  }

}
