import { AlertController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-invoice',
  templateUrl: 'invoice.html',
})
export class InvoicePage {
  invoice:any = {}
  constructor(public navCtrl: NavController, public navParams: NavParams, public api:Api, public actionsheet:ActionSheetController, public toast:ToastController, public modal:ModalController, public alert:AlertController) {
    this.invoice = this.navParams.get('invoice')
  }

  ionViewDidLoad() {
    this.getData()
  }

  getData(){
    this.api.get(`invoices/${this.invoice.id}?with[]=items&with[]=residence&with[]=receipts&append[]=person`)
    .then((data)=>{
      this.invoice = data;
    })
    .catch((err)=>{
      this.api.Error(err)
    })
  }

  actions(){
    var buttons = []

    if(this.invoice.status !== 'paid'){
      buttons.push({
        text: this.api.trans("literals.mark_as") + " " + this.api.trans("literals.paid"),
        handler: ()=>{
            this.askForPayment(this.invoice.total)
            .then((resp)=>{
              this.Payment({transaction: resp})
            })
            .catch(console.log)
        }
      })
    }

    if(this.invoice.status == 'unpaid'){
      buttons.push({
        text: this.api.trans("literals.mark_as") + " " + this.api.trans("literals.partially paid"),
        handler: ()=>{
          this.askforMount()
          .then((amount)=>{
            this.askForPayment(amount)
              .then((resp) => {
                this.Payment({ transaction: resp })
              })
              .catch(console.log)
          })
        }
      })
    }

    buttons.push({
      text: this.api.trans('literals.print'),
      handler: () => { 
        this.print()
      }
    })

    buttons.push({
      text: this.api.trans('crud.cancel'),
      role: 'cancel',
      handler: ()=>{}
    })


    this.actionsheet.create({
      title: this.api.trans('literals.actions'),
      buttons: buttons,

    }).present()
  }

  print(){
    this.navCtrl.push("PrintInvoicePage", { invoice: this.invoice, receipt: this.invoice.receipts.length > 0? this.invoice.receipts[0]:null });
  }

  askforMount(){
    return new Promise((resolve, reject) => {
      this.alert.create({
        title: this.api.trans('literals.amount'),
        inputs: [
          {
            type: 'number',
            label: this.api.trans('literals.amount'),
            value: this.invoice.total,
          }
        ],
        buttons: [
          {
            role: 'destructive',
            text: this .api .trans('crud.cancel'),
            handler: (data) => {
              reject();
            }
          }, {
            role: 'accept',
            text: this.api.trans('crud.add'),
            handler: (data) => {
              if(data && Number(data.amount) > 0)
                resolve(Number(data.amount));
              else
                reject();
            }
          }
        ]
      })
        .present();
    }) 
  }

  askForPayment(total) {
    return new Promise((resolve, reject) => {
      this .alert .create({
          title: this.api.trans('crud.select') + " " + this.api.trans('literals.method'),
          inputs: [
            {
              type: 'radio',
              label: this
                .api
                .trans('literals.cash'),
              value: 'cash',
              checked: true
            }, {
              type: 'radio',
              label: this
                .api
                .trans('literals.debit_card'),
              value: 'debit card'
            }, {
              type: 'radio',
              label: this
                .api
                .trans('literals.credit_card'),
              value: 'credit card'
            }, {
              type: 'radio',
              label: this
                .api
                .trans('literals.transfer'),
              value: 'transfer'
            }, {
              type: 'radio',
              label: this
                .api
                .trans('literals.deposit'),
              value: 'deposit'
            }, {
              type: 'radio',
              label: this .api .trans('literals.detailed'),
              value: 'detailed'
            }
          ],
          buttons: [
            {
              role: 'destructive',
              text: this
                .api
                .trans('crud.cancel'),
              handler: (data) => {
                reject();
              }
            }, {
              role: 'accept',
              text: this .api .trans('crud.add'),
              handler: (data) => {
                console.log("transaction", data);
                if (data == 'detailed') {
                  var modal = this.modal.create("PaymentsPage", { total: total })
                  modal.present()
                  modal.onDidDismiss((data, role) => {
                    if (role == 'accept') {
                      resolve(JSON.stringify(data));
                    } else {
                      reject(data);
                    }
                  })

                } else {
                  resolve(data);
                }
              }
            }
          ]
        })
        .present();
    })
  }

  Payment(data){
    this.api.post(`invoices/${this.invoice.id}/Payment`, data)
    .then((resp)=>{
        this.invoice.status = 'paid';
        this.done()
    })
    .catch((err)=>{
      this.api.Error(err)
    })
  }

  private done() {
    this.toast.create({
      message: this.api.trans("literals.done"),
      duration: 3000
    }).present();
  }

}
