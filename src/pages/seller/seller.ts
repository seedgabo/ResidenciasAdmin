import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { Api } from '../../providers/api';
import moment from 'moment';
import { ProductSearchPage } from '../product-search/product-search';
import { Printer } from '@ionic-native/printer';
@Component({
  selector: 'page-seller',
  templateUrl: 'seller.html',
})
export class SellerPage {
  charge = {
    residence_id: null,
    user_id: null,
    amount: 0,
    quantity: 1,
  }
  person = null;
  type = null;
  items = [];
  mode = "restricted";
  toPrint;
  invoices_history = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public loading: LoadingController, public alert: AlertController, public modal: ModalController, public actionsheet: ActionSheetController, public printer: Printer, public api: Api) {
  }

  ionViewDidEnter() {
    this.api.storage.get('invoices_history')
      .then((history) => {
        if (history) {
          this.invoices_history = history;
        }
      })
      .catch(console.error)
    if (this.mode !== 'restricted') {
      this.items.push({ concept: '', amount: 0, quantity: 0, });
    }
  }

  selectPerson() {
    var modal = this.modal.create('PersonFinderPage', {
      users: true,
      visitors: true,
      workers: true,
    })
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        this.person = null;
        this.type = null;
        return;
      }
      console.log(data);
      if (data.type == 'user') {
        this.charge.user_id = data.person.id;
        this.charge.residence_id = data.person.residence_id;
      }
      this.person = data.person;
      this.type = data.type;
    })

  }

  clear() {
    this.charge = {
      residence_id: null,
      user_id: null,
      amount: 0,
      quantity: 1,
    }
    if (this.mode !== 'restricted') {
      this.items = [{
        concept: '',
        amount: 0,
        quantity: 0,
      }];

    }
    else {
      this.items = [];
    }
    this.person = null;
    this.type = null;
  }

  addItem() {
    if (this.mode == 'restricted') {
      this.findProduct();
    }
    else {
      this._addItem();
    }
  }

  _addItem(item = { concept: '', amount: 0, quantity: 0, }) {
    this.items.push(item);
  }

  findProduct() {
    var modal = this.modal.create(ProductSearchPage, {})
    modal.present();
    modal.onDidDismiss((data, role) => {
      if (role !== 'cancel') {
        console.log(data, role);
        this._addItem({ concept: data.name, amount: data.price, quantity: 1 })
      }
    });
  }

  removeItem(index) {
    this.items.splice(index, 1);
  }

  proccess() {
    var procesing = 0;
    var loading = this.loading.create({
      content: this.api.trans('__.procesando') + procesing + '  de ' + this.items.length,
    });
    loading.present();
    this.items.forEach(element => {
      this.api.post('charges', {
        'residence_id': this.charge.residence_id,
        'concept': element.concept + "(x" + element.quantity + ")",
        amount: element.amount * element.quantity,
        month: moment().month() + 1,
        year: moment().year(),
        type: "unique",
      })
        .then(() => {
          loading.setContent(this.api.trans('__.procesando') + ++procesing + '  de ' + this.items.length);
          if (procesing == this.items.length) {
            if (this.charge.user_id) {
              this.sendPush("Se ha generado un nuevo cargo a su factura", this.charge.user_id);
            }

            loading.dismiss();
            this.complete();
          }
        })
        .catch((err) => {
          console.error(err);
          loading.dismiss();
          this.alert.create({
            title: "ERROR",
            message: JSON.stringify(err)
          }).present();
        })
    });

  }

  proccessWithInvoice() {
    this.askForPayment().then((transaction) => {

      var loading = this.loading.create({
        content: this.api.trans('__.procesando'),
      });
      loading.present();
      var data: any = {
        items: this.items,
        type: 'normal',
        date: (new Date()).toISOString().substring(0, 10),
      };
      data[this.type + '_id'] = this.person.id;
      if (this.type == 'user') {
        data.residence_id = this.charge.residence_id;
      } else {
      }
      this.api.post('invoices', data)
        .then((invoice: any) => {
          this.api.post(`invoices/${invoice.id}/Payment`, { transaction: transaction })
            .then((data: any) => {
              if (this.charge.user_id) {
                var added;
                if (this.items.length === 1)
                  added = `${this.items[0].concept}: ${this.items[0].quantity * this.items[0].amount} $`
                else
                  added = this.total(invoice) + "$";
                this.sendPush("Compra Realizada! " + added, this.charge.user_id);
              }
              this.goPrint(invoice, data.receipt);
              loading.dismiss();
            })
            .catch((err) => {
              console.error(err);
              loading.dismiss();
              this.alert.create({
                title: "ERROR",
                message: JSON.stringify(err)
              }).present();
            });
        })
        .catch((err) => {
          console.error(err);
          loading.dismiss();
          this.alert.create({
            title: "ERROR",
            message: JSON.stringify(err)
          }).present();
        });
    }).catch(console.error);
  }

  goPrint(invoice, receipt) {
    this.toPrint = { invoice: invoice, user: this.person, receipt: receipt };
    this.saveInvoice(this.toPrint);
    setTimeout(() => {
      this.printer.print(document.getElementById('toPrint'), { name: 'invoice' })
        .then(() => {
          this.complete();
          this.toPrint = null;
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
    this.toPrint = null;
  }

  saveInvoice(invoice) {
    this.invoices_history.push(invoice);
    // this.invoices_history.slice(this.invoices_history.length - 500)
    this.api.storage.set('invoices_history', this.invoices_history);
  }

  complete() {
    this.alert.create({
      message: this.api.trans('literals.done'),
      buttons: ["OK"]
    }).present();
    this.clear();
  }

  canProccess() {
    var valid = true;
    this.items.forEach((item) => {
      if (!(item.amount > 0 && item.quantity > 0 && item.concept.length > 0))
        valid = false;
    });
    return this.items.length > 0
      && valid;
  }

  askForPayment() {
    return new Promise((resolve, reject) => {
      this.alert.create({
        inputs: [
          {
            type: 'radio',
            label: this.api.trans('literals.cash'),
            value: 'cash',
            checked: true
          },
          {
            type: 'radio',
            label: this.api.trans('literals.debit_card'),
            value: 'debit card',
          },
          {
            type: 'radio',
            label: this.api.trans('literals.credit_card'),
            value: 'credit card',
          },
          {
            type: 'radio',
            label: this.api.trans('literals.transfer'),
            value: 'transfer',
          },
          {
            type: 'radio',
            label: this.api.trans('literals.deposit'),
            value: 'deposit',
          },
        ],
        buttons: [
          {
            role: 'destructive',
            text: this.api.trans('crud.cancel'),
            handler: (data) => {
              reject();
            }
          },
          {
            role: 'accept',
            text: this.api.trans('crud.add'),
            handler: (data) => {
              console.log("transaction", data);
              resolve(data);
            }
          }
        ]
      }).present();
    })
  }

  total(invoice = null) {
    var items;
    if (invoice == null)
      items = this.items
    else
      items = invoice.items
    var total = 0;
    items.forEach((item) => {
      total += item.amount * item.quantity;
    });
    return total;
  }

  sendPush(message, user_id = this.charge.user_id) {
    if (!user_id) return;
    this.api.post('push/' + user_id + '/notification', { message: message })
      .then(() => {

      })
      .catch((error) => {
        console.error(error);
      })
  }

  actions() {
    var buttons = [];
    if (this.type == 'user') {
      buttons.push({
        text: this.api.trans('__.Agregar a la siguiente :invoice', { invoice: this.api.trans('literals.invoice') }),
        icon: 'paper',
        cssClass: 'icon-primary',
        handler: () => {
          this.proccess();
        }
      })
    }

    buttons.push({
      text: this.api.trans('__.Facturar Ahora'),
      icon: 'print',
      cssClass: 'icon-secondary',
      handler: () => {
        this.proccessWithInvoice();
      }
    })

    buttons.push({
      text: this.api.trans('crud.cancel'),
      role: 'cancel',
      icon: 'close',
      cssClass: 'icon-light',
      handler: () => {
        console.log('Cancel clicked');
      }
    })

    this.actionsheet.create({
      title: this.api.trans('__.¿Que desea hacer?'),
      buttons: buttons
    }).present();
  }

  gotoReports(ev) {
    this.navCtrl.push("SellerReportsPage", {
      invoices: this.invoices_history.map((data) => {
        var invoice = Object.assign({}, data.invoice)
        invoice.receipt = data.receipt
        invoice.person = data.user
        return invoice
      })
    })
  }
}
