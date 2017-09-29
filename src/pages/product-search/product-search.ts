import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Api } from '../../providers/api';
@Component({
  selector: 'page-product-search',
  templateUrl: 'product-search.html',
})
export class ProductSearchPage {
  query = ""
  products = { data: [] };
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api) {
    this.api.storage.get('recent_products')
      .then((recent_products) => {
        if (recent_products) {
          this.products = recent_products;
        }
      });
  }

  ionViewDidLoad() {
  }
  search() {
    this.api.get(`products?whereLike[name]=${this.query}&paginate=50&with[]=image`)
      .then((data: any) => {
        this.products = data;
        this.api.storage.set('recent_products', data);
      })
      .catch(console.error)
  }
  cancel() {
    this.viewctrl.dismiss(null, "cancel");
  }
  select(product) {
    this.viewctrl.dismiss(product, "accept");
  }
}
