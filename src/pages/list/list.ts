import { VisitPage } from './../visit/visit';
import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, ModalController } from 'ionic-angular';
import { Api } from "../../providers/api";
import { VisitorPage } from "../visitor/visitor";
import moment from 'moment';
@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  query = "";
  visits = [];
  loading = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public actionsheet: ActionSheetController, public modal: ModalController) {
  }

  ionViewDidLoad() {
    this.getVisits();
  }

  getVisits() {
    this.loading = true
    this.api.get('visits?with[]=residence&with[]=user&with[]=vehicle&with[]=visitor&withCount[]=visitors' + this.filters()).then((data: any) => {
      console.log(data);
      this.api.visits = data;
      this.loading = false
      this.filter()
    }).catch((err) => {
      console.error(err);
      this.loading = false
    });
  }

  filter() {
    if (this.query == "") {
      return this.visits = this.api.visits.slice(0, 200);
    }
    var array = [];
    for (var index = 0; index < this.api.visits.length; index++) {
      var element = this.api.visits[index];
      if (
        (element.visitor && element.visitor.name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1) ||
        (element.residence && element.residence.name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1) ||
        (element.user && element.user.name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1)
      )
        array[array.length] = element;

      if (array.length == 200) {
        break;
      }
    }
    console.log(array);
    return this.visits = array;
  }

  filters() {
    return "&append[]=guest&order[id]=desc&limit=5000";
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
      text: this.api.trans('literals.view_resource') + " " + this.api.trans('literals.visit'),
      icon: 'eye',
      // cssClass: 'icon-danger',
      handler: () => { this.viewVisit(visit) }
    });
    if (visit.visitor)
      buttons.push({
        text: this.api.trans('crud.edit') + " " + this.api.trans('literals.visitor'),
        icon: 'contact',
        handler: () => { this.editVisitor(visit.visitor) }
      });

    buttons.push({
      text: this.api.trans('crud.delete') + " " + this.api.trans('literals.visit'),
      icon: 'trash',
      cssClass: 'icon-danger',
      role: 'destructive',
      handler: () => { this.deleteVisit(visit) }
    });


    this.actionsheet.create({
      title: this.api.trans('literals.visit') + " " + this.api.trans('__.from') + " " +
        (visit.visitor ? visit.visitor.name : visit.guest ? visit.guest.name : ''),
      buttons: buttons
    }).present();
  }

  approve(visit) {
    this.api.put('visits/' + visit.id, { status: 'approved', departured_at: moment.utc().toString() })
      .then((data) => {
        console.log(data);
        visit.status = 'approved';
      })
      .catch((err) => {
        console.error(err);
      });
  }

  departure(visit) {
    this.api.put('visits/' + visit.id, { status: 'departured', departured_at: moment.utc().toString() })
      .then((data) => {
        console.log(data);
        visit.status = 'departured';
      })
      .catch((err) => {
        console.error(err);
      });
  }

  editVisitor(visitor = null) {
    this.modal.create(VisitorPage, { visitor: visitor }, { showBackdrop: true, enableBackdropDismiss: true }).present();
  }

  deleteVisit(visit) {
    this.api.delete('visits/' + visit.id)
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.error(err);
      })

  }

  viewVisit(visit) {
    this.navCtrl.push(VisitPage, {
      visit: visit,
      done: () => {
        this.api.put("visits/" + visit.id, { status: "departured" })
          .then(() => {
            visit.status = "departured";

          })
          .catch(console.error)
      }
    });
  }

}
