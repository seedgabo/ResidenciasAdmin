import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../providers/api';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ActionSheetController } from 'ionic-angular/components/action-sheet/action-sheet-controller';
import { Platform } from 'ionic-angular/platform/platform';
import * as moment from 'moment';
import { Printer } from '@ionic-native/printer';
@IonicPage()
@Component({
  selector: 'page-seller-reports',
  templateUrl: 'seller-reports.html',
})
export class SellerReportsPage {

  invoices = [];
  printing = false;
  totals = null
  first_date;
  last_date;
  total = 0;
  loading = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public modal: ModalController, public actionsheet: ActionSheetController, public platform: Platform, public printer: Printer) {
    this.invoices = navParams.get('invoices');
  }
  ionViewDidLoad() {
    this.calculate();
  }

  calculate() {
    var total = 0;
    if (this.invoices.length > 0) {
      this.first_date = moment(this.invoices[0].created_at)
      this.last_date = moment(this.invoices[this.invoices.length - 1].created_at)
    }

    this.invoices.forEach((inv) => {
      total += inv.total;
    })

    this.total = total;
  }

  printInvoice(data) {
    var id = data.invoice_id;
    if (!id) {
      id = data.id;
    }

    this.api.get('invoices/' + id + "?with[]=cliente&with[]=items&with[]=user")
      .then((resp: any) => {
        console.log("invoice:", resp);
        resp.items = JSON.parse(resp.items);
        this.navCtrl.push("PrintInvoicePage", { invoice: resp });
      })
      .catch((err) => {
        this.navCtrl.push("PrintInvoicePage", { invoice: data });
      })
  }

  print(clear = true) {
    setTimeout(() => {
      this.printing = true;
      if (!this.platform.is('mobile')) {
        return this.toPrintCallback(clear);
      };
      var promise;
      if (this.api.settings.print_type == "pos") {
        promise = this.printer.print(document.getElementById('toPrintMini'), { name: 'invoice' })

      } else {
        promise = this.printer.print(document.getElementById('toPrint'), { name: 'invoice' })
      }
      promise.then(() => {
        this.printing = false;
      })
        .catch((err) => {
          this.toPrintCallback(clear);
          console.error(err);
        });

    }, 1000);
  }

  toPrintCallback(clear = true) {
    setTimeout(() => {
      window.print();
      if (clear)
        setTimeout(() => {
          this.printing = false;
        }, 100);
    }, 300);
  }

  actions() {
    var sheet = this.actionsheet.create({
      title: this.api.trans("literals.generate") + " " + this.api.trans('literals.report'),
    })

    sheet.addButton({
      text: this.api.trans('literals.'),
      handler: () => {
      }
    })


    sheet.addButton({
      text: this.api.trans('crud.cancel'),
      icon: "close",
      role: "cancel",
      handler: () => {
      }
    }).present();
  }

}
