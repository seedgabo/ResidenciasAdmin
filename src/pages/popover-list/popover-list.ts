import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import * as moment from 'moment';
@IonicPage()
@Component({
  selector: 'page-popover-list',
  templateUrl: 'popover-list.html',
})
export class PopoverListPage {
  from = moment().format("YYYY-MM-DD")
  to = moment().add(1, 'day').format("YYYY-MM-DD")
  only_user = true;
  search;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController) {
    if (navParams.get('from'))
      this.from = moment(this.navParams.get('from')).format("YYYY-MM-DD")
    if (navParams.get('to'))
      this.to = moment(this.navParams.get('to')).format("YYYY-MM-DD")
    if (navParams.get('only_user'))
      this.only_user = navParams.get('only_user')
  }

  ionViewDidLoad() {

  }
  exec() {
    this.viewctrl.dismiss({
      action: 'search',
      from: this.from,
      to: this.to,
      only_user: this.only_user
    });
  }

  clear() {
    this.viewctrl.dismiss({
      action: 'clear',
      from: this.from,
      to: this.to,
    });
  }

  changeTo() {
    // this.to = moment(this.from).add(1, 'day').format("YYYY-MM-DD")
  }

  close() {
    this.viewctrl.dismiss();
  }

}
