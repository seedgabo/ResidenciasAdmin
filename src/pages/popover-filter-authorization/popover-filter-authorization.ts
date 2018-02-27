import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import moment from 'moment';
@IonicPage()
@Component({
  selector: 'page-popover-filter-authorization',
  templateUrl: 'popover-filter-authorization.html',
})
export class PopoverFilterAuthorizationPage {
  filters = {
    active: true,
    start: moment().startOf('day').subtract(1, 'day').format('YYYY-MM-DD'),
    end: moment().startOf('day').add(1, 'day').format('YYYY-MM-DD'),
  }
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PopoverFilterAuthorizationPage');
  }

  close() {
    this.viewCtrl.dismiss(this.filters);
  }

}
