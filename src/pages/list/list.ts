import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { Api } from "../../providers/api";

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public actionsheet: ActionSheetController) {
  }

  ionViewDidLoad() {
    this.getVisits();
  }

  getVisits() {
    this.api.get('visits?with[]=residence&with[]=user&with[]=vehicle&with[]=visitor' + this.filters()).then((data: any) => {
      console.log(data);
      this.api.visits = data;
    }).catch((err) => {
      console.error(err);
    });
  }

  filters() {
    return "&limit=500";
  }
  actions(visit) {
    var buttons = [];
    if (visit.status == 'waiting for confirmation') {
      buttons.push({
        text: this.api.trans('__.approve'),
        icon: 'checkbox',
        cssClass: 'icon-secondary',
        handler: () => { this.approve(visit) }
      })
    }
    if (visit.status != 'departured') {
      buttons.push({
        text: this.api.trans('__.set departure'),
        icon: 'log-out',
        cssClass: 'icon-primary',
        handler: () => { this.departure(visit); }
      })
    }
    buttons.push({
      text: this.api.trans('crud.edit') + " " + this.api.trans('literals.visitor'),
      icon: 'contact',
      handler: () => { this.editVisitor(visit.visitor) }
    });
    buttons.push({
      text: this.api.trans('crud.delete') + " " + this.api.trans('literals.visit'),
      icon: 'trash',
      cssClass: 'icon-danger',
      role: 'ddestructive',
      handler: () => { this.deleteVisit(visit) }
    });


    this.actionsheet.create({
      title: this.api.trans('literals.visit') + " " + this.api.trans('__.from') + " " + visit.visitor.name,
      buttons: buttons
    }).present();
  }
  approve(visit) {

  }
  departure(visit) {

  }
  editVisitor(visitor) {
  }
  deleteVisit(visit) { }

}
