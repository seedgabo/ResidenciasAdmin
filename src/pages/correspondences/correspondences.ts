import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-correspondences',
  templateUrl: 'correspondences.html',
})
export class CorrespondencesPage {

  query = "";
  correspondences = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public action: ActionSheetController, public api: Api) {
  }

  ionViewDidLoad() {
    this.getCorrespondences();
  }

  getCorrespondences(refresher = null) {
    this.api.get('correspondences?whereNot[status]=delivered&order[residence_id]=asc&with[]=user&with[]=residence&with[]=receptor')
      .then((data: any) => {
        console.log(data);
        this.correspondences = data;
        if (refresher) {
          refresher.complete();
        }
      })
      .catch(console.error)
  }

  filter() {
    if (this.query === "") {
      return this.correspondences;
    }
    var finder = this.query.toLowerCase();
    return this.correspondences.filter((corres) => {
      return corres.item.toLowerCase().indexOf(finder) > -1
        || (corres.user && corres.user.name.toLowerCase().indexOf(finder) > -1)
        || (corres.residence && corres.residence.name.toLowerCase().indexOf(finder) > -1)
        || (corres.residence && corres.residence.name.toLowerCase().indexOf(finder) > -1)
        || (corres.receptor && corres.receptor.name.toLowerCase().indexOf(finder) > -1)
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
    this.api.put('correspondences/' + correspondence.id, {
      status: 'delivered'
    })
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

}
