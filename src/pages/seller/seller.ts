import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Api } from '../../providers/api';
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
  items = [{
    concept: '',
    amount: 0,
    quantity: 0,
  }];
  residences = [];
  residents = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }

  ionViewDidLoad() {
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
    this.residences = [];
    this.residents = [];
  }
  addItem() {
    this.items.push({
      concept: '',
      amount: 0,
      quantity: 0,
    })
  }
  removeItem(index) {
    this.items.splice(index, 1);
  }

}
