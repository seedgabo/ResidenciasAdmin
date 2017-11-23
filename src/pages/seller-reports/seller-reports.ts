import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../providers/api';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ActionSheetController } from 'ionic-angular/components/action-sheet/action-sheet-controller';

@IonicPage()
@Component({
  selector: 'page-seller-reports',
  templateUrl: 'seller-reports.html',
})
export class SellerReportsPage {

  invoices = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public modal: ModalController, public actionsheet: ActionSheetController) {
    this.invoices = navParams.get('invoices');
  }
  ionViewDidLoad() {
  }

  actions() {
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
