import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Api } from '../../providers/api';
import { Printer } from '@ionic-native/printer';
@IonicPage()
@Component({
  selector: 'page-vehicle-receipt',
  templateUrl: 'vehicle-receipt.html',
})
export class VehicleReceiptPage {
  receipt
  vehicle
  person
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public platform: Platform, public printer: Printer) {
    if (this.navParams.get('receipt')) {
      this.receipt = this.navParams.get('receipt')
    }
    if (this.navParams.get('vehicle')) {
      this.vehicle = this.navParams.get('vehicle')
    }
    if (this.navParams.get('person')) {
      this.person = this.navParams.get('person')
    }
  }

  ionViewDidLoad() {
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

}
