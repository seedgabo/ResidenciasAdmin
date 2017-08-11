import { Component } from '@angular/core';
import { NavController, ActionSheetController, ModalController } from 'ionic-angular';
import { Api } from "../../providers/api";
import { VisitorPage } from "../visitor/visitor";
import { VisitCreatorPage } from "../visit-creator/visit-creator";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  query: string = "";

  constructor(public navCtrl: NavController, public api: Api, public actionsheet: ActionSheetController, public modal: ModalController) {
    // this.loadVisitors();
  }

  ionViewDidLoad() {
    this.api.storage.get('visits_approved').then((visits_approved) => {
      if (visits_approved)
        this.api.visits_approved = visits_approved
    });
  }

  loadVisitors(rerfresher = null) {
    this.api.get('visitors?with[]=image').then((data: any) => {
      console.log(data);
      this.api.visitors = data;
      if (rerfresher) rerfresher.complete();
    }).catch((err) => {
      console.error(err);
      if (rerfresher) rerfresher.complete();
    });
  }

  getVisitors() {
    if (this.query == "")
      return this.api.visitors;

    return this.api.visitors.filter((visitor) => {
      if (visitor.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1
        || visitor.document.toLowerCase().indexOf(this.query.toLowerCase()) > -1)
        return true;
      if (this.api.residences_collection[visitor.residence_id] && this.api.residences_collection[visitor.residence_id].name.toLowerCase().indexOf(this.query.toLowerCase()) > -1)
        return true;
      return false;
    });
  }

  actions(visitor) {
    this.actionsheet.create({
      title: this.api.trans('literals.actions') + " | " + visitor.name,
      buttons: [
        {
          text: this.api.trans('literals.generate') + " " + this.api.trans('literals.visit'),
          icon: 'person-add',
          cssClass: 'icon-primary',
          handler: () => { this.visitModal(visitor) }
        },
        {
          text: this.api.trans('crud.edit'),
          icon: 'create',
          cssClass: 'icon-secondary',
          handler: () => { this.visitorModal(visitor) }
        },
        {
          text: this.api.trans('crud.delete'),
          icon: 'trash',
          role: 'destructive',
          cssClass: 'icon-danger',
          handler: () => { this.delete(visitor) }
        }

      ]
    }).present();
  }

  visitorModal(visitor = null) {
    this.modal.create(VisitorPage, { visitor: visitor }, { showBackdrop: true, enableBackdropDismiss: true }).present();
  }

  delete(visitor) {
    this.api.delete('visitors/' + visitor.id).then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err);
    });
  }

  visitModal(visitor) {
    this.modal.create(VisitCreatorPage, { visitor: visitor }, { showBackdrop: true, enableBackdropDismiss: true }).present();

  }

  dismissPreApproved(visit, index) {
    this.api.visits_approved.splice(index, 1);
  }

}
