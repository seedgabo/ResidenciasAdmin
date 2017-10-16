import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
/**
 * Generated class for the PersonFinderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-person-finder',
  templateUrl: 'person-finder.html',
})
export class PersonFinderPage {
  findFor = {
    users: true,
    visitors: false,
    workers: false
  };
  selected = null;
  query = "";
  results = {
    users: null,
    visitors: null,
    workers: null,
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api) {
    if (navParams.get('users') !== undefined)
      this.findFor.users = navParams.get('users');
    if (navParams.get('visitors') !== undefined)
      this.findFor.visitors = navParams.get('visitors')
    if (navParams.get('workers') !== undefined)
      this.findFor.workers = navParams.get('workers')

    this.api.storage.get('recent_users').then((value) => {
      if (value) {
        this.results.users = value
      }
    })
    this.api.storage.get('recent_visitors').then((value) => {
      if (value) {
        this.results.visitors = value
      }
    })
    this.api.storage.get('recent_visitors').then((value) => {
      if (value) {
        this.results.visitors = value
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PersonFinderPage');
  }

  search() {
    this.api.get(`users?orWhereLike[name]=${this.query}&orWhereLike[document]=${this.query}&with[]=image&with[]=residence&paginate=50`)
      .then((data) => {
        this.results.users = data;
        this.api.storage.set('recent_users', data);

      })
      .catch(console.error);



    if (this.findFor.visitors) {
      this.api.get(`visitors?orWhereLike[name]=${this.query}&orWhereLike[document]=${this.query}&with[]=image&with[]=residence&paginate=50`)
        .then((data) => {
          this.results.visitors = data;
          this.api.storage.set('recent_visitors', data);
        })
        .catch(console.error);
    }


    if (this.findFor.workers) {
      this.api.get(`workers?orWhereLike[name]=${this.query}&orWhereLike[document]=${this.query}&with[]=image&with[]=residence&paginate=50`)
        .then((data) => {
          this.results.workers = data;
          this.api.storage.set('recent_workers', data);
        })
        .catch(console.error);

    }
  }

  cancel() {
    this.viewctrl.dismiss(null, 'cancel');
  }

  select(person, type = 'user') {
    this.viewctrl.dismiss({ person: person, type: type });
  }

}
