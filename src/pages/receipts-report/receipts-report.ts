import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { Api } from '../../providers/api';
import * as moment from 'moment';
import { Platform } from 'ionic-angular/platform/platform';
import { ActionSheetController } from 'ionic-angular/components/action-sheet/action-sheet-controller';
import { Printer } from '@ionic-native/printer';

@IonicPage()
@Component({
  selector: 'page-receipts-report',
  templateUrl: 'receipts-report.html',
})
export class ReceiptsReportPage {
  _receipts = [];
  receipts = [];
  printing = false;
  totals = null
  first_date;
  last_date;
  total = 0;
  loading = false;
  from;
  to;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public platform: Platform, public actionsheet: ActionSheetController, public popover: PopoverController, public printer: Printer) {
    this.receipts = navParams.get('receipts');
    this._receipts = navParams.get('receipts');
  }

  ionViewDidLoad() {
    this.prepare();
    this.calculate();
    console.log(this.receipts);
  }

  prepare() {

    this.receipts.forEach(rec => {
      if (!rec.person) {
        if (rec.person_assoc) {
          rec.person = rec.user;
        }
        if (rec.user) {
          rec.person = rec.user;
        }
        if (rec.worker) {
          rec.person = rec.worker;
        }
        if (rec.visitor) {
          rec.person = rec.visitor;
        }
      }
    });
  }

  calculate() {
    var total = 0;
    if (this.receipts.length > 0) {
      this.first_date = moment(this.receipts[0].created_at)
      this.last_date = moment(this.receipts[this.receipts.length - 1].created_at)
    }

    this.receipts.forEach((inv) => {
      total += Number(inv.amount);
    })

    this.total = total;
  }

  printReceipt(receipt) {
    this.navCtrl.push("PrintReceiptPage", { receipt: receipt });
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
        this.printReceipt(invoice)
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

  clearData() {
    this.api.alert.create({
      title: this.api.trans("__.are you sure"),
      buttons: [{
        text: this.api.trans("literals.yes"),
        handler: () => {
          this.api.storage.remove("receipts_history");
          this.receipts = [];
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
        this.navCtrl.push("ConsolidateReceiptsPage", { invoices: this.receipts });
      }
    })

    sheet.addButton({
      text: this.api.trans('crud.clear') + " " + this.api.trans('literals.receipts'),
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
    this.api.get(`receipts?where[created_by]=${this.api.user.id}&&whereDategte[created_at]=${start}&whereDatelwe[created_at]=${end}&attr[person_assoc]=person`)
      .then((data: any) => {
        console.log(data);
        this.loading = false;
        this.receipts = data;
        this.ionViewDidLoad();
      })
      .catch((err) => {
        this.api.Error(err);
        this.loading = false;
      })
  }

  clearByDate() {
    this.receipts = this._receipts.slice();
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
