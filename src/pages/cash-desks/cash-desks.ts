import { Api } from './../../providers/api';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Refresher, ActionSheetController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-cash-desks',
  templateUrl: 'cash-desks.html',
})
export class CashDesksPage {
  @ViewChild(Refresher) refresher: Refresher;
  cash_desks = []
  loading =false

  constructor(public navCtrl: NavController, public navParams: NavParams, public api:Api, public actionsheet:ActionSheetController) {
  }

  ionViewDidLoad() {
    this.api.ready.then(()=>{
      this.refresher._top = "50px"
      this.refresher.state = "refreshing"
      this.refresher._beginRefresh()
    })
  }
  
  getCashDesks(refresher){
    this.loading =true;
    this.api.get(`cash_desks?where[user_id]=${this.api.user.id}&order[from]=desc&with[]=invoices.items&with[]=receipts&limit=60`)
    .then((data:any)=>{
      console.log(data)
      this.cash_desks = data;
      this.loading =false
      if(refresher){ refresher.complete() }
    })
    .catch((err)=>{
      this.loading =false
      if(refresher){ refresher.complete() }
      this.api.Error(err)
    })

  }

  actions(cashdesk){
    var sheet = this.actionsheet.create({
        title: this.api.trans('literals.actions') + " " + this.api.trans('literals.cash_desk'),
        buttons:[
          {
            text:  this.api.trans('literals.print') + " - " + this.api.trans('__.Consolidado de Productos'),
            handler: ()=>{
              this.printCashDesk(cashdesk)
            }
          },
          {
            text: this.api.trans('literals.print') + " - " + this.api.trans('__.Consolidado de Categorias'),
            handler: ()=>{
              this.printCashDesk(cashdesk,true)
            }
          }
        ]
    })

    sheet.present()
  }

  printCashDesk(cashdesk, show_categories = false){
    this.navCtrl.push("ConsolidateSellPage", { invoices: cashdesk.invoices, 'receipts': cashdesk.receipts, cashdesk: cashdesk, show_categories: show_categories, show_products:!show_categories });
  }

}
