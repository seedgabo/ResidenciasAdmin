import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../../providers/api';
import * as moment from 'moment';
import { SettingProvider } from '../../../providers/setting/setting';

@IonicPage({ defaultHistory: ["DashPage"] })
@Component({ selector: 'page-consolidate-sell', templateUrl: 'consolidate-sell.html' })
export class ConsolidateSellPage {
  invoices = []
  receipts = []
  products = {}
  categories = {
    "0": {
      total: 0,
      quantity: 0,
      _category: {
        name: '---'
      }
    }
  }

  sums = {}
  counts = {}
  printing = true;
  from;
  to;
  total = 0;
  total_receipts = 0;
  close = false;
  user;
  residence
  cash_desk = null;
  show_products = true;
  show_categories = false;
  loading = false
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public setting: SettingProvider) {
    this.invoices = this.navParams.get('invoices');
    if (this.navParams.get('receipts')) {
      this.receipts = this.navParams.get('receipts');
      this.calculateReceipts();
    }

    if (this.navParams.get('print') !== undefined) {
      this.printing = this.navParams.get('print');
    }

    if (this.navParams.get('show_categories') !== undefined) {
      this.show_categories = this.navParams.get('show_categories');
    }

    if (this.navParams.get('show_products') !== undefined) {
      this.show_products = this.navParams.get('show_products');
    }

    if (this.navParams.get('close')) {
      this.close = this.navParams.get('close');
    }

    else if (this.navParams.get('cashdesk')) {
      this.cash_desk = this.navParams.get('cashdesk');
    }

    if (this.navParams.get('user')) {
      this.user = this.navParams.get('user');
      this.residence = this.navParams.get('residence');
    } else {
      this.user = this.api.user;
      this.residence = this.api.residence;
    }
  }

  ionViewDidLoad() {
    this.calculate()
    if(this.show_categories){
      this.calculateCategories()
    }
    if (this.close) {
      var data = {
        user_id: this.api.user.id,
        from: this.from.format('Y-M-D H:mm:ss'),
        to: this.to.format('Y-M-D H:mm:ss'),
        invoices: [],
        receipts: []
      }
      this.invoices.forEach((inv) => {
        data.invoices.push(inv.id)
      })
      this.receipts.forEach((rec) => {
        data.receipts.push(rec.id)
      })
      this.api.post('cash_desks', data).then((resp) => {
        this.cash_desk = resp;
        setTimeout(() => {
          this.print();
        }, 300)
      })
        .catch((err) => {
          this
            .api
            .Error(err)
        })
    }
  }

  calculate() {
    this.products = {}
    this.sums = {}
    this.total = 0
    if (this.invoices.length > 0) {
      this.from = moment(this.invoices[0].created_at)
      this.to = moment(this.invoices[this.invoices.length - 1].created_at)
    }

    this.invoices.forEach((inv) => {
      if (inv.status != 'cancelled') {
        inv.items.forEach(item => {
          if (!this.products[item.concept]) {
            this.products[item.concept] = {
              quantity: Number(item.quantity),
              amount: Number(item.amount),
              _product: item
            };
          } else {
            this.products[item.concept].quantity += Number(item.quantity);
          }
        });
        this.total += Number(inv.total);
        this.getPaymentsFromInvoices(inv);
      }
    })
  }

  calculateReceipts() {
    this.total_receipts = 0;
    this.receipts.forEach((rec) => {
      this.total_receipts += rec.amount
    })
  }

  calculateCategories() {
    this.loading =true
    Object.keys(this.products).forEach((key)=>{
      var prod = this.products[key]._product
      var category_id  = prod.category_id
      if(category_id == null){
        this.categories["0"].total += Number(prod.quantity * prod.amount);
        this.categories["0"].quantity += Number(prod.quantity);
      }
      else if (!this.categories[category_id]) {
        this.categories[category_id] = {
          total: Number(prod.quantity * prod.amount),
          quantity: Number(prod.quantity),
        };
      } else {
        this.categories[category_id].total += Number(prod.quantity * prod.amount);
        this.categories[category_id].quantity += Number(prod.quantity);
      }
      
    })
    this.api.load('categories')
    .then((categories:any)=>{
      Object.keys(this.categories).forEach((i) =>{
        if (categories.collection[i]){
          this.categories[i]._category = categories.collection[i]
        }
      })
      console.log(this.categories)
      this.loading = false
    })
    .catch((err)=>{
      this.loading =false
      this.api.Error(err)
    })
  }

  print() {
    window.print()
  }

  getPaymentsFromInvoices(invoice) {
    var payment = invoice.payment
    if (!payment) {
      this.addTosums("cash", invoice.total)
      return;
    }
    if (this.isJson(payment)) {
      JSON
        .parse(payment)
        .forEach(pay => {
          this.addTosums(pay.method, pay.amount)
        });
    } else {

      this.addTosums(payment, invoice.total)
    }
  }

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (error) {
      return false
    }
    return true;
  }

  addTosums(method, amount) {
    if (!this.sums[method]) {
      this.sums[method] = Number(amount);
      this.counts[method] = 1
    } else {
      this.sums[method] += Number(amount);
      this.counts[method]++
    }
  }

}
