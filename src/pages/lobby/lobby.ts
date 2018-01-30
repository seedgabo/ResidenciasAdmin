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
  /** 
   * TODO:
   * Fingerprint integration
   * Users and workers 
  **/
  constructor(public navCtrl: NavController, public navParams: NavParams, public api:Api, public modal:ModalController, public toast:ToastController, public actionsheet:ActionSheetController) {
    this.api.ready.then(()=>{
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

  ionViewDidEnter(){
    if(this.ready)
      this.searchVisitor()
  }

  searchVisitor() {
    if(this.query == ""){
      this.person = null
      this.type = null
      this.no_results = false
      return
    }
    this.loading = true
    this.person = null;
    for (var i = 0; i < this.api.objects.visitors.length; i++) {
      var item = this.api.objects.visitors[i];
      if(this.query.toLowerCase() == item.document.toLowerCase()){
        this.person = item
        break;
      }
    }
    (this.person)? this.no_results = false : this.no_results = true;
    (this.person)? this.type = "visitor" : null;
    this.loading = false
    console.log(this.person)
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
  
  clear (){
    this.person = null
    this.no_results = false
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
    var modal = this .modal .create('PersonFinderPage', {
        users: true,
        visitors: true,
        workers: true
      })
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        this.person = null;
        return;
      }
      console.log(data);
      this.person = data;
      this.type = data.type
    })

  }

  canSave(){
    return this.person.name && this.person.name.length > 3 && this.person.document && this.person.residence_id;
  }

  private done(){
    this.toast.create({
      message: this.api.trans("literals.done"),
      duration: 3000
    }).present();
    this.person = null;
    this.type = null;
  }

  more(v){
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
    if(this.person){
      buttons.push({
        text: this.api.trans('crud.add') + " " + this.api.trans('__.advanced visit'),
        icon: 'more',
        cssClass: 'icon-secondary',
        handler: () => { this.visitModal(this.person)}
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

  visitModal(visitor = null) {
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
  

}
