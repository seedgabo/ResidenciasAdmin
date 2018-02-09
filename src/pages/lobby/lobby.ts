import { VisitPage } from './../visit/visit';
import { VisitCreatorPage } from './../visit-creator/visit-creator';
import { VisitorPage } from './../visitor/visitor';
import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController, ModalController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-lobby',
  templateUrl: 'lobby.html',
})
export class LobbyPage {
  query = "";
  loading = false
  ready = false
  no_results = false
  person
  visitors = [];
  type
  visits = [];
  _visits = { data: [], total: null };
  /**
   * TODO:
   * Fingerprint integration
   * Register entries for worker and users
  **/
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public modal: ModalController, public toast: ToastController, public actionsheet: ActionSheetController) {
    this.api.ready.then(() => {
      var promises = [
        this.api.load("users"),
        this.api.load("visitors"),
        this.api.load("workers"),
      ]
      Promise.all(promises).then(() => { this.ready = true })
    })
  }

  ionViewDidLoad() {

  }

  ionViewDidEnter() {
    if (this.ready) {
      this.searchPerson()
      this.getVisits()
      this.getVisitors()
    }
  }

  searchPerson() {
    this.loading = true
    this.person = null;
    this.type = null
    if (this.query == "") {
      this.no_results = false
      this.loading = false
      return
    }

    var query = this.query.toLowerCase()
    this.searchVisitor(query)
    if (!this.person)
      this.searchUser(query)
    if (!this.person)
      this.searchWorker(query)

    this.person ? this.no_results = false : this.no_results = true;
    this.loading = false
  }

  searchVisitor(query) {
    for (var i = 0; i < this.api.objects.visitors.length; i++) {
      var item = this.api.objects.visitors[i];
      if (item.document && query == item.document.toLowerCase()) {
        this.person = item
        break;
      }
    }
    (this.person) ? this.type = "visitor" : null;
  }

  searchUser(query) {
    for (var i = 0; i < this.api.objects.users.length; i++) {
      var item = this.api.objects.users[i];
      if (item.document && query == item.document.toLowerCase()) {
        this.person = item
        break;
      }
    }
    this.person ? this.type = "user" : null;
  }

  searchWorker(query) {
    this.loading = true
    this.person = null;
    for (var i = 0; i < this.api.objects.workers.length; i++) {
      var item = this.api.objects.workers[i];
      if (item.document && query == item.document.toLowerCase()) {
        this.person = item
        break;
      }
    }
    this.person ? this.type = "user" : null;

  }

  selectResidence() {
    var modal = this.modal.create("ResidenceFinderPage", {});
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.person.residence = data;
        this.person.residence_id = data.id;
      }
      else {
        this.person.residence_id = null;
        this.person.residence = null;
      }
    });
  }

  clear() {
    this.person = null
    this.no_results = false
  }


  getVisits() {
    this.api.get('visits?with[]=residence&with[]=user&with[]=vehicle&with[]=visitor&withCount[]=visitors' + this.append()).then((data: any) => {
      console.log(data);
      this.visits = this._visits = data;
      this.filter()
    }).catch((err) => {
      console.error(err);
    });
  }

  getVisitors() {
    if (this.query == "")
      return this.visitors = this.api.objects.visitors.slice(0, 100);

    return this.visitors = this.api.objects.visitors.filter((visitor) => {
      if (visitor.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1
        || visitor.document.toLowerCase().indexOf(this.query.toLowerCase()) > -1)
        return true;
      if (this.api.residences_collection[visitor.residence_id] && this.api.residences_collection[visitor.residence_id].name.toLowerCase().indexOf(this.query.toLowerCase()) > -1)
        return true;
      return false;
    }).slice(0, 100);
  }

  filter() {
    if (this.query == "") {
      return this.visits = this._visits.data;
    }
    var array = [];
    for (var index = 0; index < this._visits.data.length; index++) {
      var element = this._visits.data[index];
      if (
        (element.visitor && element.visitor.name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1) ||
        (element.visitor && element.visitor.document && element.visitor.document.toLowerCase().indexOf(this.query.toLowerCase()) !== -1) ||
        (element.guest && element.guest.name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1) ||
        (element.residence && element.residence.name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1) ||
        (element.user && element.user.name.toLowerCase().indexOf(this.query.toLowerCase()) !== -1)
      )
        array[array.length] = element;

      if (array.length == 200) {
        break;
      }
    }
    console.log(array);
    return this.visits = array;
  }

  append() {
    var append = "&append[]=guest&order[id]=desc&paginate=500";
    return append;
  }


  addVisit(visitor) {
    this.loading = true
    var visit: any = {
      status: "waiting for confirmation",
      visitor_id: visitor.id,
      residence_id: visitor.residence_id
    }
    this.api.post(`visitors/${visitor.id}/visit`, visit).then((response) => {
      console.log(response);
      this.done()
      this.loading = false;
    }).catch((err) => {
      this.api.Error(err)
      this.loading = false;
    });
  }

  findPerson() {
    var modal = this.modal.create('PersonFinderPage', {
      users: true,
      visitors: true,
      workers: true
    })
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data || !data.person) {
        this.person = null;
        this.type = null;
        return;
      }
      this.person = data.person;
      this.type = data.type
    })

  }

  canSave() {
    return this.person.name && this.person.name.length > 3 && this.person.document && this.person.residence_id;
  }

  private done() {
    this.toast.create({
      message: this.api.trans("literals.done"),
      duration: 3000
    }).present();
    this.person = null;
    this.type = null;
  }

  more(v) {
    var buttons = [
      {
        text: this.api.trans('crud.add') + " " + this.api.trans('literals.person'),
        icon: 'person-add',
        cssClass: 'icon-primary',
        handler: () => { this.visitorModal() }
      },
      {
        text: this.api.trans('crud.add') + " " + this.api.trans('literals.delivery'),
        icon: 'basket',
        cssClass: 'icon-favorite',
        handler: () => {
          var modal = this.modal.create("CreateVisitGuestPage", {})
          modal.present();
          modal.onWillDismiss(() => {
          })
        }
      }
    ];
    if (this.person) {
      buttons.push({
        text: this.api.trans('literals.configure') + " " + this.api.trans('literals.visit'),
        icon: 'more',
        cssClass: 'icon-secondary',
        handler: () => { this.visitModal(this.person) }
      })
    }
    this.actionsheet.create({
      title: this.api.trans('literals.actions'),
      buttons: buttons
    }).present();
  }


  visitorModal(visitor = null) {
    var residence
    if (visitor && visitor.residence) {
      residence = visitor.residence
    }
    var modal = this.modal.create(VisitorPage, { visitor: visitor, residence: residence }, { showBackdrop: true, enableBackdropDismiss: true })
    modal.present();
    modal.onDidDismiss((data) => {
      if (data) {
        this.type = "visitor"
        this.person = data;
      }
    })
  }

  visitModal(visitor = undefined) {
    this.modal.create(VisitCreatorPage, { visitor: visitor }, { showBackdrop: true, enableBackdropDismiss: true }).present();

  }


  viewVisit(visit, index) {
    this.navCtrl.push(VisitPage, {
      visit: visit,
      done: () => {
        this.dismissPreApproved(visit, index)
      }
    });
  }

  dismissPreApproved(visit, index) {
    this.api.visits_approved.splice(index, 1);
    this.api.storage.set('visits_approved', this.api.visits_approved);
  }


  askFile() {
    var filer: any = document.querySelector("#input-file-person")
    filer.click();
  }

  readFile(event) {
    try {
      var reader: any = new FileReader();
      reader.readAsDataURL(event.target.files[0])
      reader.onload = (result) => {
        this.person.image_url = result.target.result;
        this.uploadImage(this.person.id)
      };
    } catch (error) {
      console.error(error)
    }
  }

  uploadImage(id) {
    return this.api.post('images/upload/visitor/' + id, { image: this.person.image_url })
      .then((data: any) => {
        console.log(data);
        this.person.image = data.image;
        this.toast.create({
          message: this.api.trans("literals.image") + " " + this.api.trans("crud.updated"),
          duration: 1500,
          showCloseButton: true,
        }).present();
      })
      .catch(console.error)
  }




  gotoVisits() {
    this.navCtrl.push('ListPage');
  }
  gotoVisitors() {
    this.navCtrl.push('HomePage');
  }
}
