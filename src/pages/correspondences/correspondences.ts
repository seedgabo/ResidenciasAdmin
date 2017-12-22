import { Api } from './../../providers/api';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Events, Refresher } from 'ionic-angular';
import * as moment from 'moment'
@IonicPage()
@Component({
  selector: 'page-correspondences',
  templateUrl: 'correspondences.html',
})
export class CorrespondencesPage {
  @ViewChild(Refresher) refresher: Refresher;

  order_by = 'date'
  query = "";
  correspondences = [];
  handler = (data) => {
    this.getCorrespondences();
  }
  filter_status = '';
  filtered = [];
  translations = {
    'today': 'Hoy',
    'yesterday': 'Ayer',
    'week': 'Esta Semana',
    'last_week': 'La Semana Pasada',
    'month': 'Este Mes',
    'last_month': 'El Mes Pasado',
    'older': 'Antiguos'
  }
  groups = {}
  constructor(public navCtrl: NavController, public navParams: NavParams, public action: ActionSheetController, public api: Api, public events: Events) {
  }

  ionViewDidLoad() {
    this.refresher._top = "50px"
    this.refresher.state = "refreshing"
    this.refresher._beginRefresh()
    // this.getCorrespondences();
    this.events.subscribe("CorrespondenceCreated", this.handler);
  }

  ionViewDidLeave() {
    this.events.unsubscribe("CorrespondenceCreated", this.handler);
  }

  getCorrespondences(refresher = null) {
    this.api.ready.then(() => {
      this.api.get('correspondences?order[status]=desc&order[id]=desc&with[]=user&with[]=residence&with[]=receptor&limit=500')
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
    })
  }

  changeOrder() {
    if (this.order_by == 'date') {
      this.order_by = 'status'
    }
    else {
      this.order_by = 'date'
    }
  }

  filter() {
    if (this.query === "") {
      this.filtered = this.correspondences.filter((corres) => {
        return corres.status.toLowerCase().indexOf(this.filter_status) > -1
      });
    }
    else {
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
    this.groups = this.groupByDates(this.filtered, 'created_at');
  }

  groupByDates(array, key) {
    if (key == null) {
      key = 'date';
    }
    var now = moment();
    var ordered = {
      today: [],
      yesterday: [],
      week: [],
      last_week: [],
      month: [],
      last_month: [],
      older: []
    };
    for (var i = 0, len = array.length; i < len; i++) {
      var item = array[i];
      var date = moment(item[key]);
      if (now.isSame(date, 'day')) {
        ordered.today[ordered.today.length] = item;
      } else if (now.clone().subtract(1, 'day').isSame(date, 'day')) {
        ordered.yesterday[ordered.yesterday.length] = item;
      } else if (now.clone().isSame(date, 'week')) {
        ordered.week[ordered.week.length] = item;
      } else if (now.clone().subtract(1, 'week').isSame(date, 'week')) {
        ordered.last_week[ordered.last_week.length] = item;
      } else if (now.clone().isSame(date, 'month')) {
        ordered.month[ordered.month.length] = item;
      } else if (now.clone().subtract(1, 'month').isSame(date, 'month')) {
        ordered.last_month[ordered.last_month.length] = item;
      } else {
        ordered.older[ordered.older.length] = item;
      }
    }
    return ordered;
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
