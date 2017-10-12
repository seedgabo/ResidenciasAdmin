import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { Api } from '../../providers/api';
import moment from 'moment';
import { ProductSearchPage } from '../product-search/product-search';
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
  items = [];
  residences = [];
  residents = [];
  mode = "restricted";
  toPrint;
  constructor(public navCtrl: NavController, public navParams: NavParams, public loading: LoadingController, public alert: AlertController, public modal: ModalController, public actionsheet: ActionSheetController, public api: Api) {
  }

  ionViewDidLoad() {
    if (this.mode !== 'restricted') {
      this.items.push({ concept: '', amount: 0, quantity: 0, });
    }
    this.getResidences();
  }

  getResidences() {
    this.api.get('residences')
      .then((data: any) => {
        this.residences = data;
      })
      .catch(console.error)
  }

  getResidents() {
    if (!this.charge.residence_id) {
      return;
    }
    this.api.get('residences/' + this.charge.residence_id + '?with[]=residents')
      .then((data: any) => {
        this.residents = data.residents;
      })
      .catch(console.error)
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
    this.residents = [];
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
    var loading = this.loading.create({
      content: this.api.trans('__.procesando'),
    });
    loading.present();
    this.api.post('invoices', {
      user_id: this.charge.user_id,
      residence_id: this.charge.residence_id,
      items: this.items,
      type: 'normal',
      date: (new Date()).toISOString().substring(0, 10),

    })
      .then((data: any) => {
        this.api.post(`invoices/${data.id}/Payment`, {})
          .then((data2) => {
            if (this.charge.user_id) {
              this.sendPush("Compra Realizada!", this.charge.user_id);
            }
            loading.dismiss();
            this.complete();
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
    return this.charge.residence_id != null
      && this.items.length > 0
      && valid;
  }

  total() {
    var total = 0;
    this.items.forEach((item) => {
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
    this.actionsheet.create({
      title: this.api.trans('__.que desea hacer?'),
      buttons: [
        {
          text: this.api.trans('__.agregar a la siguiente factura'),
          icon: 'paper',
          cssClass: 'icon-primary',
          handler: () => {
            this.proccess();
          }
        },
        {
          text: this.api.trans('__.facturar ahora'),
          icon: 'print',
          cssClass: 'icon-secondary',
          handler: () => {
            this.proccessWithInvoice();
          }
        },
        {
          text: this.api.trans('crud.cancel'),
          role: 'cancel',
          icon: 'close',
          cssClass: 'icon-light',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    }).present();
  }
}
