import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
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
  _invoices = [];
  invoices = [];
  printing = false;
  totals = null
  first_date;
  last_date;
  total = 0;
  loading = false;
  from;
  to;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public modal: ModalController, public actionsheet: ActionSheetController, public popover: PopoverController, public platform: Platform, public printer: Printer) {
    this.invoices = navParams.get('invoices');
    this._invoices = navParams.get('invoices');
  }

  ionViewDidLoad() {
    this.prepare();
    this.calculate();
    console.log(this.invoices);
  }

  prepare() {
  }

  calculate() {
    var total = 0;
    if (this.invoices.length > 0) {
      this.first_date = moment(this.invoices[0].created_at)
      this.last_date = moment(this.invoices[this.invoices.length - 1].created_at)
    }

    this.invoices.forEach((inv) => {
      if (inv.status !== 'cancelled')
        total += Number(inv.total);
    })

    this.total = total;
  }

  printInvoice(data) {
    this.navCtrl.push("PrintInvoicePage", { invoice: data });
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



  actions(invoice) {
    var sheet = this.actionsheet.create({
      title: this.api.trans("literals.actions") + " " + this.api.trans('literals.invoice'),
    })

    sheet.addButton({
      text: this.api.trans('literals.print'),
      icon: 'print',
      handler: () => {
        this.printInvoice(invoice)
      }
    })

    if (invoice.status !== 'cancelled') {
      sheet.addButton({
        text: this.api.trans('crud.cancel') + " " + this.api.trans('literals.invoice'),
        icon: 'remove-circle',
        handler: () => {
          this.cancelInvoice(invoice)
        }
      })
    }


    sheet.addButton({
      text: this.api.trans('crud.cancel'),
      icon: "close",
      role: "cancel",
      handler: () => {
      }
    }).present();
  }

  cancelInvoice(invoice) {
    this.api.alert.create({
      title: this.api.trans("__.nota de cancelacion"),
      inputs: [{
        label: this.api.trans('literals.note'),
        placeholder: this.api.trans('literals.note'),
        name: "note",
        type: "text",
      }],
      buttons: [{
        text: this.api.trans("literals.proccess"),
        handler: (data) => {
          if (data.note) {
            this.api.put(`invoices/${invoice.id}`, { status: "cancelled", note: data.note })
              .then((resp) => {
                invoice.status = "cancelled"
                invoice.note = data.note
              })
              .catch((err) => {
                this.api.Error(err);
              })
          }
        }
      }]
    }).present()
  }

  clearData() {
    this.api.alert.create({
      title: this.api.trans("__.are you sure"),
      buttons: [{
        text: this.api.trans("literals.yes"),
        handler: () => {
          this.api.storage.remove("invoices_history");
          this.invoices = [];
          this._invoices = [];
          this.calculate();
        }
      }, this.api.trans('cancel')]
    }).present()
  }

  more() {
    var sheet = this.actionsheet.create({
      title: this.api.trans("literals.generate") + " " + this.api.trans('literals.report'),
    })

    sheet.addButton({
      text: this.api.trans('__.Consolidado de ventas por producto'),
      icon: "paper",
      handler: () => {
        this.navCtrl.push("ConsolidateSellPage", { invoices: this.invoices });
      }
    })

    sheet.addButton({
      text: this.api.trans('crud.clear') + " " + this.api.trans('literals.invoices'),
      icon: "remove-circle",
      role: 'destructive',
      cssClass: "icon-danger",
      handler: () => {
        this.clearData();
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

  findByDate(date, to = null, only_user = true) {
    this.loading = true;
    var start = moment(date).format("YYYY-MM-DD")
    var end = (to ? moment(to).add(1, 'day').format('YYYY-MM-DD') : moment(date).add(1, 'day').format("YYYY-MM-DD"))
    this.api.get(`invoices?where[created_by]=${this.api.user.id}&&whereDategte[created_at]=${start}&whereDatelwe[created_at]=${end}&with[]=user&with[]=visitor&with[]=worker&with[]=items`)
      .then((data: any) => {
        console.log(data);
        this.loading = false;
        this.invoices = data;
        this.calculate();
      })
      .catch((err) => {
        this.api.Error(err);
        this.loading = false;
      })
  }

  clearByDate() {
    this.invoices = this._invoices.slice();
    this.ionViewDidLoad()
  }


  openFinder(ev) {
    let popover = this.popover.create("PopoverListPage", {
      from: this.from,
      to: this.to
    })
    popover.present({ ev: ev });
    popover.onWillDismiss((data) => {
      if (!data) return
      if (data.action == 'search')
        this.findByDate(data.from, data.to, data.only_user);
      if (data.action == 'clear')
        this.clearByDate();
      this.from = data.from
      this.to = data.to
    })
  }

}
