import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { VisitorPage } from '../visitor/visitor';
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
  ready = false;
  local = true
  loading = false
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public modal: ModalController, public api: Api) {
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

    var promises = [];
    if (this.local) {
      if (this.findFor.users)
        promises.push(this.api.load("users"))

      if (this.findFor.visitors)
        promises.push(this.api.load("visitors"))

      if (this.findFor.workers)
        promises.push(this.api.load("workers"))
    }
    Promise.all(promises).then(() => {
      this.ready = true
    })
  }

  ionViewDidLoad() {

  }

  search() {
    this.loading = true;
    if (this.local) {
      return this.searchLocal();
    }


    if (this.findFor.users) {
      this.api.get(`users?orWhereLike[name]=${this.query}&orWhereLike[document]=${this.query}&orWhereHas[residence][whereLike][name]=${this.query}&with[]=residence&paginate=25`)
        .then((data) => {
          this.results.users = data;
          this.api.storage.set('recent_users', data);
          this.loading = false
        })
        .catch(console.error);
    }


    if (this.findFor.visitors) {
      this.api.get(`visitors?orWhereLike[name]=${this.query}&orWhereLike[document]=${this.query}&orWhereHas[residence][whereLike][name]=${this.query}&with[]=residence&paginate=25`)
        .then((data) => {
          this.results.visitors = data;
          this.api.storage.set('recent_visitors', data);
          this.loading = false
        })
        .catch(console.error);
    }


    if (this.findFor.workers) {
      this.api.get(`workers?orWhereLike[name]=${this.query}&orWhereLike[document]=${this.query}&orWhereHas[residence][whereLike][name]=${this.query}&with[]=residence&paginate=25`)
        .then((data) => {
          this.results.workers = data;
          this.api.storage.set('recent_workers', data);
          this.loading = false
        })
        .catch(console.error);

    }
  }

  searchLocal() {
    this.loading = true;
    var limit = 25;
    var filter = this.query.toLowerCase();
    this.findUsers(filter, limit)
    this.findVisitors(filter, limit)
    this.findWorkers(filter, limit)
    this.loading = false;
  }

  findUsers(filter, limit) {
    if (this.findFor.users) {
      this.results.users = { data: [] };
      var results = [];
      for (var i = 0; i < this.api.objects.users.length; i++) {
        var item = this.api.objects.users[i];
        if (
          (item.name && item.name.toLowerCase().indexOf(filter) > -1) ||
          (item.document && item.document.toLowerCase().indexOf(filter) > -1) ||
          (item.residence && item.residence.name && item.residence.name.toLowerCase().indexOf(filter) > -1)
        ) {
          // console.log(item)
          results.push(item);
        }
        if (results.length == limit) {
          break;
        }

      }
      this.results.users.data = results
      this.api.storage.set('recent_users', this.results.users);
    }
  }

  findVisitors(filter, limit) {
    if (this.findFor.visitors) {
      this.results.visitors = { data: [] };
      var results = [];
      for (var i = 0; i < this.api.objects.visitors.length; i++) {
        var item = this.api.objects.visitors[i];
        if (
          (item.name && item.name.toLowerCase().indexOf(filter) > -1) ||
          (item.document && item.document.toLowerCase().indexOf(filter) > -1) ||
          (item.residence && item.residence.name && item.residence.name.toLowerCase().indexOf(filter) > -1)
        )

          results.push(item);
        if (results.length == limit) {
          break;
        }

      }
      this.results.visitors.data = results
      this.api.storage.set('recent_visitors', this.results.visitors);
    }
  }

  findWorkers(filter, limit) {
    if (this.findFor.workers) {
      this.results.workers = { data: [] };
      var results = [];
      for (var i = 0; i < this.api.objects.workers.length; i++) {
        var item = this.api.objects.workers[i];
        if (
          (item.name && item.name.toLowerCase().indexOf(filter) > -1) ||
          (item.document && item.document.toLowerCase().indexOf(filter) > -1) ||
          (item.residence && item.residence.name && item.residence.name.toLowerCase().indexOf(filter) > -1)
        )
          results.push(item);
        if (results.length == limit) {
          break;
        }

      }
      this.results.workers.data = results
      this.api.storage.set('recent_workers', this.results.workers);
    }
  }

  cancel() {
    this.viewctrl.dismiss(null, 'cancel');
  }

  visitorModal(visitor = null) {
    var residence
    if(visitor){
      residence = visitor.residence
    }
    var modal = this.modal.create(VisitorPage, { visitor: visitor, residence:residence, show_visits_button: false})
    modal.present();
    modal.onDidDismiss((data) => {
      if (data) {
        this.results.users = null;
        this.results.visitors = { data: [data] };
        this.results.workers = null;
        this.api.storage.set('recent_visitors', { data: [data] });
      }
    })
  }

  select(person, type = 'user') {
    this.viewctrl.dismiss({ person: person, type: type });
  }

}
