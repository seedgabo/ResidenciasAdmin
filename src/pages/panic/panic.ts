import { Events } from 'ionic-angular';
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
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public events: Events) {
    this.user = this.navParams.get('user')

    this.residence = this.navParams.get('residence')

    if (this.navParams.get('location'))
      this.location = this.navParams.get('location');

    if (this.navParams.get('datetime'))
      this.datetime = moment.utc(this.navParams.get('datetime').date);

    if (!this.datetime.isValid())
      this.datetime = moment.utc();


  }

  prepareData(data) {
    this.user = data.user;
    this.residence = data.residence;
    this.location = data.location;
    if (data.datetime)
      this.datetime = moment.utc(data.date);

    if (!this.datetime.isValid())
      this.datetime = moment.utc();
  }

  ionViewDidLoad() {
    this.events.subscribe("panic", this.prepareData);
  }

  close() {
    if (this.navParams.get('sound'))
      this.navParams.get('sound').pause()
    this.viewctrl.dismiss();
    this.events.unsubscribe("panic", this.prepareData);
  }

  openInMaps() {
    if (!this.location) {
      return
    }
    var addressLongLat = this.location.latitude + ',' + this.location.longitude;
    window.open("http://maps.google.com/?q=" + addressLongLat, "_system");

  }

}
