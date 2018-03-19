import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController, ActionSheetController, PopoverController, IonicPage } from 'ionic-angular';
import { Api } from '../../providers/api';
import moment from 'moment';
import { ProductSearchPage } from '../product-search/product-search';
import { Printer } from '@ionic-native/printer';
import { Content } from 'ionic-angular';
@IonicPage({
  priority: "high"
})
@Component({ selector: "page-seller", templateUrl: "seller.html" })
export class SellerPage {
  @ViewChild(Content) content: Content;
  charge = {
    residence_id: null,
    user_id: null,
    amount: 0,
    quantity: 1
  };
  person = null;
  type = null;
  items = [];
  mode = "restricted";
  toPrint;
  invoices_history = [];
  receipts_history = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loading: LoadingController,
    public alert: AlertController,
    public modal: ModalController,
    public actionsheet: ActionSheetController,
    public popover: PopoverController,
    public printer: Printer,
    public api: Api
  ) {
    this.api.ready.then(() => {
      this.api.load("users");
      this.api.load("visitors");
      this.api.load("workers");
      this.api.load("products");
    });
  }

  ionViewDidEnter() {
    this.content.resize();
    this.api.storage.get("invoices_history").then(history => {
      if (history) {
        this.invoices_history = history;
      }
    });
    this.api.storage.get("receipts_history").then(history => {
      if (history) {
        this.receipts_history = history;
      }
    });
    if (this.mode !== "restricted") {
      this.items.push({ concept: "", amount: 0, quantity: 0 });
    }
  }

  selectPerson() {
    var modal = this.modal.create("PersonFinderPage", {
      users: true,
      visitors: true,
      workers: true
    });
    modal.present();
    modal.onDidDismiss(data => {
      if (!data) {
        this.person = null;
        this.type = null;
        return;
      }
      console.log(data);
      if (data.type == "user") {
        this.charge.user_id = data.person.id;
        this.charge.residence_id = data.person.residence_id;
      }
      this.person = data.person;
      this.person.type = data.type;
      this.type = data.type;
    });
  }

  clear() {
    this.charge = {
      residence_id: null,
      user_id: null,
      amount: 0,
      quantity: 1
    };
    if (this.mode !== "restricted") {
      this.items = [
        {
          concept: "",
          amount: 0,
          quantity: 0
        }
      ];
    } else {
      this.items = [];
    }
    this.person = null;
    this.type = null;
  }

  addItem() {
    if (this.mode == "restricted") {
      this.findProduct();
    } else {
      this._addItem();
    }
  }

  _addItem(item = { concept: "", amount: 0, quantity: 0, category_id: null }) {
    this.items.push(item);
  }

  findProduct() {
    var modal = this.modal.create(ProductSearchPage, {});
    modal.present();
    modal.onDidDismiss((data, role) => {
      if (role !== "cancel") {
        console.log(data, role);
        this._addItem({
          concept: data.name,
          amount: data.price,
          quantity: 1,
          category_id: data.category_id
        });
      }
    });
  }

  removeItem(index) {
    this.items.splice(index, 1);
  }

  proccess() {
    this.askNote(
      this.api.trans("__.recibo de anexo a su siguiente :invoice", {
        invoice: this.api.trans("literals.invoice")
      })
    )
      .then(note => {
        var procesing = 0;
        var loading = this.loading.create({
          content: this.api.trans("__.procesando") + procesing + "  de " + this.items.length
        });
        loading.present();
        this.items.forEach(element => {
          this.api
            .post("charges", {
              residence_id: this.charge.residence_id,
              concept: element.concept + "(x" + element.quantity + ")",
              amount: element.amount * element.quantity,
              month: moment().month() + 1,
              year: moment().year(),
              type: "unique"
            })
            .then(data => {
              loading.setContent(this.api.trans("__.procesando") + ++procesing + "  de " + this.items.length);
              if (procesing == this.items.length) {
                if (this.charge.user_id) {
                  this.sendPush("Se ha generado un nuevo cargo a su factura", this.charge.user_id);
                }
                loading.dismiss();
                this.complete(this.items, note);
              }
            })
            .catch(err => {
              console.error(err);
              loading.dismiss();
              this.alert
                .create({
                  title: "ERROR",
                  message: JSON.stringify(err)
                })
                .present();
            });
        });
      })
      .catch(console.warn);
  }

  proccessWithInvoice() {
    this.askForPayment()
      .then(transaction => {
        this.askNote()
          .then(note => {
            var loading = this.loading.create({
              content: this.api.trans("__.procesando")
            });
            loading.present();
            var data: any = {
              items: this.items,
              type: "normal",
              payment: transaction,
              note: note,
              date: new Date().toISOString().substring(0, 10)
            };
            data[this.type + "_id"] = this.person.id;
            if (this.type == "user") {
              data.residence_id = this.charge.residence_id;
            }
            this.api
              .post("invoices", data)
              .then((invoice: any) => {
                this.api
                  .post(`invoices/${invoice.id}/Payment`, { transaction: transaction })
                  .then((data: any) => {
                    if (this.charge.user_id) {
                      var added;
                      if (this.items.length === 1) added = `${this.items[0].concept}: ${this.items[0].quantity * this.items[0].amount} $`;
                      else added = this.total(invoice) + "$";
                      this.sendPush("Compra Realizada! " + added, this.charge.user_id);
                    }
                    invoice.status = "paid";
                    loading.dismiss().then(() => {
                      this.goPrint(invoice, data.receipt);
                    });
                  })
                  .catch(err => {
                    console.error(err);
                    loading.dismiss();
                    this.alert
                      .create({
                        title: "ERROR",
                        message: JSON.stringify(err)
                      })
                      .present();
                  });
              })
              .catch(err => {
                console.error(err);
                loading.dismiss();
                this.alert
                  .create({
                    title: "ERROR",
                    message: JSON.stringify(err)
                  })
                  .present();
              });
          })
          .catch(console.warn);
      })
      .catch(console.warn);
  }

  goPrint(invoice, receipt) {
    this.toPrint = {
      invoice: invoice,
      user: this.person,
      receipt: receipt
    };
    invoice.person = this.person;
    this.saveInvoice(this.toPrint);
    this.navCtrl.push("PrintInvoicePage", { invoice: invoice, receipt: receipt });
    this.clear();
  }

  saveInvoice(invoice) {
    this.invoices_history.push(invoice);
    this.api.storage.set("invoices_history", this.invoices_history);
  }

  saveReceipt(receipt) {
    this.receipts_history.push(receipt);
    this.api.storage.set("receipts_history", this.receipts_history);
  }

  complete(items, note) {
    var concept = "";
    this.items.forEach(element => {
      concept += element.concept + "(x" + element.quantity + "), ";
    });
    this.person.type = this.type;
    var receipt: any = {
      items: items,
      person: this.person,
      concept: concept.substring(0, concept.length - 2),
      date: moment().toDate(),
      amount: this.total(),
      note: note
        ? note
        : this.api.trans("__.recibo de anexo a su siguiente :invoice", {
            invoice: this.api.trans("literals.invoice")
          }),
      transaction: this.api.trans("__.compra")
    };

    this.api
      .post("receipts", receipt)
      .then((data: any) => {
        receipt.id = data.id;
        this.saveReceipt(receipt);
        this.navCtrl.push("PrintReceiptPage", { receipt: receipt });
        this.clear();
      })
      .catch(err => {
        this.api.Error(err);
      });
  }

  canProccess() {
    for (let index = 0; index < this.items.length; index++) {
      const item = this.items[index];
      if (!(item.amount > 0 && item.quantity > 0 && item.concept.length > 0)) {
        return false;
      }
    }

    if (!this.person) {
      return false;
    }

    return this.items.length > 0;
  }

  askForPayment() {
    return new Promise((resolve, reject) => {
      this.alert
        .create({
          title: this.api.trans("crud.select") + " " + this.api.trans("literals.method"),
          inputs: [
            {
              type: "radio",
              label: this.api.trans("literals.cash"),
              value: "cash",
              checked: true
            },
            {
              type: "radio",
              label: this.api.trans("literals.debit_card"),
              value: "debit card"
            },
            {
              type: "radio",
              label: this.api.trans("literals.credit_card"),
              value: "credit card"
            },
            {
              type: "radio",
              label: this.api.trans("literals.transfer"),
              value: "transfer"
            },
            {
              type: "radio",
              label: this.api.trans("literals.deposit"),
              value: "deposit"
            },
            {
              type: "radio",
              label: this.api.trans("literals.detailed"),
              value: "detailed"
            }
          ],
          buttons: [
            {
              role: "destructive",
              text: this.api.trans("crud.cancel"),
              handler: data => {
                reject();
              }
            },
            {
              role: "accept",
              text: this.api.trans("crud.add"),
              handler: data => {
                console.log("transaction", data);
                if (data == "detailed") {
                  var modal = this.modal.create("PaymentsPage", {
                    total: this.total()
                  });
                  modal.present();
                  modal.onDidDismiss((data, role) => {
                    if (role == "accept") {
                      resolve(JSON.stringify(data));
                    } else {
                      reject(data);
                    }
                  });
                } else {
                  resolve(data);
                }
              }
            }
          ]
        })
        .present();
    });
  }

  askNote(note = null) {
    return new Promise((resolve, reject) => {
      this.alert
        .create({
          title: this.api.trans("crud.add") + " " + this.api.trans("literals.note"),
          inputs: [
            {
              type: "text",
              label: this.api.trans("literals.note"),
              value: note ? note : "",
              name: "note"
            }
          ],
          buttons: [
            {
              role: "destructive",
              text: this.api.trans("crud.cancel"),
              handler: data => {
                reject();
              }
            },
            {
              role: "accept",
              text: this.api.trans("crud.add"),
              handler: data => {
                console.log("note", data.note);
                resolve(data.note);
              }
            }
          ]
        })
        .present();
    });
  }

  total(invoice = null) {
    var items;
    if (invoice == null) items = this.items;
    else items = invoice.items;
    var total = 0;
    items.forEach(item => {
      total += item.amount * item.quantity;
    });
    return total;
  }

  sendPush(message, user_id = this.charge.user_id) {
    if (!user_id) return;
    this.api
      .post("push/" + user_id + "/notification", { message: message })
      .then(() => {})
      .catch(error => {
        console.error(error);
      });
  }

  actions() {
    var buttons = [];
    if (this.api.modules.receipts && this.type == "user") {
      buttons.push({
        text: this.api.trans("__.Agregar a la siguiente :invoice", {
          invoice: this.api.trans("literals.invoice")
        }),
        icon: "paper",
        cssClass: "icon-primary",
        handler: () => {
          this.proccess();
        }
      });
    }

    buttons.push({
      text: this.api.trans("__.Facturar Ahora"),
      icon: "print",
      cssClass: "icon-secondary",
      handler: () => {
        this.proccessWithInvoice();
      }
    });

    buttons.push({
      text: this.api.trans("crud.cancel"),
      role: "cancel",
      icon: "close",
      cssClass: "icon-light",
      handler: () => {
        console.log("Cancel clicked");
      }
    });

    this.actionsheet
      .create({
        title: this.api.trans("__.¿Que desea hacer?"),
        buttons: buttons
      })
      .present();
  }

  more(ev) {
    let popover = this.popover.create("PopoverSellerPage", {});
    popover.present({ ev: ev });
    popover.onWillDismiss((data, role) => {
      console.log(data, role);
      if (role == "accept") {
        if (data.action == "invoices") this.gotoReports(ev);
        if (data.action == "receipts") this.gotoReceipts(ev);
        if (data.action == "cash desks") this.gotoCashDesks();
      }
    });
  }

  gotoCashDesks() {
    this.navCtrl.push("CashDesksPage");
  }

  gotoReports(ev) {
    this.navCtrl.push("SellerReportsPage", {
      invoices: this.invoices_history.map(data => {
        var invoice = Object.assign({}, data.invoice);
        invoice.receipt = data.receipt;
        invoice.person = data.user;
        return invoice;
      })
    });
  }

  gotoReceipts(ev) {
    this.navCtrl.push("ReceiptsReportPage", { receipts: this.receipts_history });
  }
}
