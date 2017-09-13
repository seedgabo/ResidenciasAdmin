import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import moment from 'moment';
moment.locale("es");
@Component({
  selector: 'page-panic',
  templateUrl: 'panic.html',
})
export class PanicPage {

  user: any = {};
  residence: any = {};
  location = null;
  datetime = moment.utc();
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController) {

    this.user = navParams.get('user')

    this.residence = navParams.get('residence')

    if (navParams.get('location'))
      this.location = navParams.get('location');

    if (navParams.get('datetime'))
      this.datetime = moment.utc(navParams.get('datetime').date);
    if (!this.datetime.isValid())
      this.datetime = moment.utc();

  }

  ionViewDidLoad() {
  }

  close() {
    if (this.navParams.get('sound'))
      this.navParams.get('sound').pause()
    this.viewctrl.dismiss();
  }

}
