import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-add-correspondence',
  templateUrl: 'add-correspondence.html',
})
export class AddCorrespondencePage {
  correspondence = {
    user_id: null,
    residence_id: null,
    receptor_id: null,
    item: "",
    quantity: 1,
    status: 'arrival'
  }
  person = null;
  residences = []
  loading = false;
  multiple = true
  constructor(public navCtrl: NavController, public navParams: NavParams, public modal: ModalController, public api: Api) {
    if (navParams.get('multiple') !== undefined)
      this.multiple = navParams.get('multiple')
  }

  ionViewDidLoad() {

  }

  canSave() {
    var condition = false;
    if (this.multiple) {
      condition = (this.residences.length > 0)
    } else {
      condition = (this.correspondence.user_id && this.correspondence.residence_id)
    }
    return condition &&
      this.correspondence.item.length > 2 && this.correspondence.quantity > 0
      && this.correspondence.status.length > 0;
  }

  selectPerson() {
    var modal = this.modal.create('PersonFinderPage', {
      users: true,
      visitors: false,
      workers: false,
      multiple: this.multiple
    })
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        this.person = null;
        this.correspondence.user_id = null;
        this.correspondence.residence_id = null;
        return;
      }
      console.log(data);
      this.correspondence.user_id = data.person.id;
      this.correspondence.residence_id = data.person.residence_id;
      this.person = data.person;
    })
  }

  selectResidences() {
    var modal = this.modal.create('ResidenceFinderPage', {
      multiple: this.multiple,
      selecteds: this.residences
    })
    modal.present();
    modal.onDidDismiss((data) => {
      if (data && data.selecteds) {
        this.residences = data.selecteds;
      }
    })
  }


  save() {
    this.loading = true;
    if (!this.correspondence.receptor_id) {
      this.correspondence.receptor_id = this.api.user.id;
    }
    this.api.post('correspondences', this.correspondence)
      .then((data) => {
        this.close()
        this.loading = false;
      })
      .catch((err) => {
        this.loading = false;
        this.api.Error(err);
        console.error(err)
      })
  }

  saveMultiple() {
    this.loading = true;
    var data = {
      receptor_id: this.correspondence.receptor_id,
      item: this.correspondence.item,
      quantity: this.correspondence.item,
      status: 'arrival',
      residences_ids: []
    }
    this.residences.forEach((res) => {
      data.residences_ids[data.residences_ids.length] = res.id
    })
    if (!data.receptor_id) {
      data.receptor_id = this.api.user.id;
    }

    this.api.post('correspondences/multiple', data)
      .then((data) => {
        this.close()
        this.loading = false;
      })
      .catch((err) => {
        this.loading = false;
        this.api.Error(err);
        console.error(err)
      })
  }

  close() {
    this.navCtrl.pop();
  }

}
