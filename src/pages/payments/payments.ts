import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';
@IonicPage()
@Component({
  selector: 'page-payments',
  templateUrl: 'payments.html',
})

export class PaymentsPage {
  payments: any = [];
  total = 0;
  methods = [
    "cash",
    "debit card",
    "credit card",
    "other",
    "deposit",
    "transfer",
  ]

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController) {
    this.total = this.navParams.get('total');
    this.payments.push({
      method: "cash",
      amount: this.total / 2,
    });
  }

  ionViewDidLoad() {
  }

  add() {
    this.payments.push({
      method: "cash",
      amount: 0,
    });
  }

  remove(index) {
    this.payments.splice(index, 1);
  }

  cancel() {
    this.viewctrl.dismiss(null, "cancel");
  }

  save() {
    this.viewctrl.dismiss(this.payments, "accept");
  }

  totalized() {
    var total = 0;
    this.payments.forEach(element => {
      total += parseInt(element.amount)
    });
    return total;
  }

  canSave() {
    return this.totalized() == this.total;
  }
}
