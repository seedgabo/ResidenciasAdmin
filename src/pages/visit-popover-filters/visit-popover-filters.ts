import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-visit-popover-filters',
  templateUrl: 'visit-popover-filters.html',
})
export class VisitPopoverFiltersPage {
  filters = {
    residence: null,
    visitor: null,
    from: null,
    to: null
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api, public modal: ModalController) {
    this.filters = navParams.get('filters')
  }

  ionViewDidLoad() {
  }

  selectResidence() {
    var modal = this.modal.create("ResidenceFinderPage", {});
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.filters.residence = data
      }
      else {
        this.filters.residence = null;
      }
    });
  }

  selectPerson() {
    var modal = this.modal.create('PersonFinderPage', {
      users: false,
      visitors: true,
      workers: false
    })
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        this.filters.visitor = null;
        return;
      }

      this.filters.visitor = data.person;
    })

  }
  clear() {
    this.filters = {
      residence: null,
      visitor: null,
      from: null,
      to: null
    }
    this.dismiss()
  }
  search() {
    this.dismiss()
  }

  dismiss() {
    this.viewctrl.dismiss(this.filters)
  }

}
