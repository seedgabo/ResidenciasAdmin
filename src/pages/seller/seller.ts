import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from 'ionic-angular';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public loading: LoadingController, public alert: AlertController, public modal: ModalController, public api: Api) {
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
    this.items = [{
      concept: '',
      amount: 0,
      quantity: 0,
    }];
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

  complete() {
    this.alert.create({
      message: this.api.trans('literals.ready'),
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

}
