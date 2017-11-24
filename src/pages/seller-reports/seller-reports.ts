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
      total += inv.total;
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
      icon : 'print',
      handler: () => {
        this.printInvoice(invoice)
      }
    })
    
    if(invoice.status !== 'cancelled'){
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
        buttons : [{
          text : this.api.trans("literals.proccess"),
          handler: (data)=>{
              if(data.note){
                this.api.put(`invoices/${invoice.id}`,{status:"cancelled", note: data.note})
                .then((resp)=>{
                    invoice.status = "cancelled"
                    invoice.note = data.note
                })
                .catch((err)=>{
                  this.api.Error(err);
                })
              }
          }
        }]
      }).present()
  }

  more() {
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
