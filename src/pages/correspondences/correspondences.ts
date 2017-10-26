import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Events } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-correspondences',
  templateUrl: 'correspondences.html',
})
export class CorrespondencesPage {

  query = "";
  correspondences = [];
  handler = (data) => {
    this.getCorrespondences();
  }
  filter_status = '';
  filtered = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public action: ActionSheetController, public api: Api, public events: Events) {
  }

  ionViewDidLoad() {
    this.getCorrespondences();
    this.events.subscribe("CorrespondenceCreated", this.handler);
  }

  ionViewDidLeave() {
    this.events.unsubscribe("CorrespondenceCreated", this.handler);
  }

  getCorrespondences(refresher = null) {
    this.api.get('correspondences?order[status]=desc&order[id]=desc&with[]=user&with[]=residence&with[]=receptor&limit=1000')
      .then((data: any) => {
        console.log(data);
        this.correspondences = data;
        this.filter();
        if (refresher) {
          refresher.complete();
        }
      })
      .catch((err) => {
        this.api.Error(err);
        if (refresher) {
          refresher.complete();
        }
        console.error(err);
      })
  }

  filter() {
    if (this.query === "") {
      this.filtered = this.correspondences.filter((corres) => {
        return corres.status.toLowerCase().indexOf(this.filter_status) > -1
      });
    }
    var finder = this.query.toLowerCase();
    this.filtered = this.correspondences.filter((corres) => {
      return corres.status.toLowerCase().indexOf(this.filter_status) > -1
        && (corres.item.toLowerCase().indexOf(finder) > -1
          || (corres.user && corres.user.name.toLowerCase().indexOf(finder) > -1)
          || (corres.residence && corres.residence.name.toLowerCase().indexOf(finder) > -1)
          || (corres.residence && corres.residence.name.toLowerCase().indexOf(finder) > -1)
          || (corres.receptor && corres.receptor.name.toLowerCase().indexOf(finder) > -1)
        )
    });
  }

  addCorrespondece() {
    this.navCtrl.push('AddCorrespondencePage');
  }

  actions(corres) {
    var actions = this.action.create({
      title: this.api.trans("literals.correspondence") + " - " + corres.user.name,
      buttons: [
        {
          text: this.api.trans('__.marcar como recogido'),
          icon: 'checkmark-circle-outline',
          handler: () => {
            this.checkDone(corres);
          }
        },
        {
          text: this.api.trans('literals.view_resource'),
          icon: 'eye',
          handler: () => {

          }
        },
        {
          role: 'destructive',
          text: this.api.trans('crud.delete'),
          icon: 'trash',
          handler: () => {
            this.deleteCorrespondence(corres)
          }
        },
        {
          role: 'cancel',
          icon: 'close',
          text: this.api.trans('crud.cancel'),
          handler: () => {
          }
        }
      ],

    });

    actions.present();
  }

  checkDone(correspondence) {
    this.api.post('correspondences/' + correspondence.id + "/deliver", {})
      .then((data) => {
        this.getCorrespondences();
      })
      .catch(console.error)
  }

  deleteCorrespondence(correspondence) {
    this.api.delete('correspondences/' + correspondence.id)
      .then((data) => {
        this.getCorrespondences()
      })
      .catch(console.error)
  }

  filterActions() {
    var actions = this.action.create({
      title: this.api.trans("literals.correspondences"),
      buttons: [
        {
          text: this.api.trans('literals.view_resource') + " " + this.api.trans('literals.all') + 's',
          icon: 'checkmark-circle-outline',
          handler: () => {
            this.filter_status = "";
            this.filter()
          }
        },
        {
          text: this.api.trans('literals.view_resource') + " " + this.api.trans('literals.delivered') + 's',
          icon: 'checkmark-circle-outline',
          handler: () => {
            this.filter_status = "delivered";
            this.filter()
          }
        },
        {
          text: this.api.trans('literals.view_resource') + " " + this.api.trans('literals.arrival') + 's',
          icon: 'eye',
          handler: () => {
            this.filter_status = "arrival";
            this.filter()
          }
        },
        {
          role: 'cancel',
          icon: 'close',
          text: this.api.trans('crud.cancel'),
          handler: () => {
          }
        }
      ],

    });

    actions.present();
  }
}
