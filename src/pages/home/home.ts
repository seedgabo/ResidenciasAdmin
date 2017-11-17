import { Component } from '@angular/core';
import { NavController, ActionSheetController, ModalController, ToastController } from 'ionic-angular';
import { Api } from "../../providers/api";
import { VisitorPage } from "../visitor/visitor";
import { VisitCreatorPage } from "../visit-creator/visit-creator";
import { VisitPage } from "../visit/visit";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  query: string = "";
  visitor_image;
  constructor(public navCtrl: NavController, public api: Api, public actionsheet: ActionSheetController, public modal: ModalController, public toast: ToastController) {
  }

  ionViewDidLoad() {
    this.api.storage.get('visits_approved').then((visits_approved) => {
      if (visits_approved)
        this.api.visits_approved = visits_approved
    });
    this.loadVisitors();
  }

  loadVisitors(refresher = null) {
    this.api.get('visitors?with[]=residence&with[]=image').then((data: any) => {
      console.log(data);
      this.api.visitors = data;
      if (refresher) refresher.complete();
    }).catch((err) => {
      console.error(err);
      if (refresher) refresher.complete();
    });
  }



  getVisitors() {
    if (this.query == "")
      return this.api.visitors.slice(0, 100);

    return this.api.visitors.filter((visitor) => {
      if (visitor.name.toLowerCase().indexOf(this.query.toLowerCase()) > -1
        || visitor.document.toLowerCase().indexOf(this.query.toLowerCase()) > -1)
        return true;
      if (this.api.residences_collection[visitor.residence_id] && this.api.residences_collection[visitor.residence_id].name.toLowerCase().indexOf(this.query.toLowerCase()) > -1)
        return true;
      return false;
    }).slice(0, 100);
  }

  actions(visitor) {
    this.actionsheet.create({
      title: this.api.trans('literals.actions') + " | " + visitor.name,
      buttons: [
        {
          text: this.api.trans('literals.generate') + " " + this.api.trans('literals.visit'),
          icon: 'person-add',
          cssClass: 'icon-primary',
          handler: () => { this.visitModal(visitor) }
        },
        {
          text: this.api.trans('crud.edit') + " " + this.api.trans('literals.image'),
          icon: 'camera',
          cssClass: 'icon-secondary',
          handler: () => { this.askFile(visitor) }
        },
        {
          text: this.api.trans('crud.edit'),
          icon: 'create',
          cssClass: 'icon-warning',
          handler: () => { this.visitorModal(visitor) }
        },
        {
          text: this.api.trans('crud.delete'),
          icon: 'trash',
          role: 'destructive',
          cssClass: 'icon-danger',
          handler: () => { this.delete(visitor) }
        }

      ]
    }).present();
  }

  more() {
    this.actionsheet.create({
      title: this.api.trans('literals.actions'),
      buttons: [
        {
          text: this.api.trans('crud.add') + " " + this.api.trans('literals.person'),
          icon: 'person-add',
          cssClass: 'icon-primary',
          handler: () => { this.visitModal() }
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
      ]
    }).present();
  }

  viewVisit(visit, index) {
    this.navCtrl.push(VisitPage, {
      visit: visit,
      done: () => {
        this.dismissPreApproved(visit, index)
      }
    });
  }

  visitorModal(visitor = null) {
    this.modal.create(VisitorPage, { visitor: visitor }, { showBackdrop: true, enableBackdropDismiss: true }).present();
  }

  delete(visitor) {
    this.api.delete('visitors/' + visitor.id).then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err);
    });
  }

  visitModal(visitor = null) {
    this.modal.create(VisitCreatorPage, { visitor: visitor }, { showBackdrop: true, enableBackdropDismiss: true }).present();

  }

  dismissPreApproved(visit, index) {
    this.api.visits_approved.splice(index, 1);
  }



  askFile(visitor) {
    this.visitor_image = visitor;
    var filer: any = document.querySelector("#input-file")
    filer.click();
  }

  readFile(event) {
    try {
      var reader: any = new FileReader();
      reader.readAsDataURL(event.target.files[0])
      reader.onload = (result) => {
        this.visitor_image.image_url = result.target.result;
        this.uploadImage(this.visitor_image.id)
      };
    } catch (error) {
      console.error(error)
    }
  }

  uploadImage(id) {
    return this.api.post('images/upload/visitor/' + id, { image: this.visitor_image.image_url })
      .then((data: any) => {
        console.log(data);
        this.visitor_image.image = data.image;
        this.toast.create({
          message: this.api.trans("literals.image") + " " + this.api.trans("crud.updated"),
          duration: 1500,
          showCloseButton: true,
        }).present();
      })
      .catch(console.error)
  }

}
