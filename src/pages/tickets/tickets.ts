import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Api } from '../../providers/api';
@IonicPage()
@Component({
  selector: 'page-tickets',
  templateUrl: 'tickets.html',
})
export class TicketsPage {
  tickets = [];
  _tickets = [];
  query = ""
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api) {
  }

  ionViewDidLoad() {
  }

  getWaitingTickets() {
    this.api.ready.then(() => {
      this.api.get("ticktes?scope[waiting]=&paginate=100&with[]=user&with[]=user.residence")
        .then((data) => {
          this.tickets = this._tickets = data
        })
        .catch((err) => {
          this.api.Error(err)
        })

    })
  }

  filter() {
    if (this.query == "") {
      return this.tickets = this._tickets;
    }
    var filter = this.query.toLowerCase()
    this.tickets = this._tickets.filter(t => {
      return t.subject.toLowerCase().indexOf(filter) > -1
        || t.text.toLowerCase().indexOf(filter) > -1
        || (t.user && t.user.name.toLowerCase().indexOf(filter) > -1)
        || (t.user && t.user.residence && t.user.residence.name.toLowerCase().indexOf(filter) > -1)

    });
  }

}
