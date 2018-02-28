import { Printer } from '@ionic-native/printer';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, ModalController, ToastController } from 'ionic-angular';
import { Api } from '../../providers/api';
import { VehicleFinderPage } from '../vehicle-finder/vehicle-finder';
import moment from 'moment'
moment.locale('es');
@IonicPage()
@Component({
  selector: 'page-authorization',
  templateUrl: 'authorization.html',
})
export class AuthorizationPage {
  authorization: any = {
    description: "",
    _start: moment().add(1, 'day').startOf('day').format("YYYY-MM-DDTHH:mm"),
    start_at: moment().add(1, 'day').startOf('day'),
    _end: moment().add(2, 'day').startOf('day').format("YYYY-MM-DDTHH:mm"),
    end_at: moment().add(2, 'day').startOf('day'),
  }
  printing = false;
  editor = false;
  loading = false;
  person = null;
  type = null;
  constructor(public navCtrl: NavController, public viewCtrl: ViewController, public navParams: NavParams, public modal: ModalController, public api: Api, public printer: Printer, public platform: Platform, public toast: ToastController) {
    if (this.navParams.get('authorization')) {
      this.authorization = this.navParams.get('authorization')
      this.authorization.start_at = moment(this.authorization.start_at)
      this.authorization._start = moment(this.authorization.start_at).format("YYYY-MM-DDTHH:mm")
      this.authorization.end_at = moment(this.authorization.end_at)
      this.authorization._end = moment(this.authorization.end_at).format("YYYY-MM-DDTHH:mm")
      if (this.authorization.visitor) {
        this.authorization.visitor_id = this.authorization.visitor.id;
        this.person = this.authorization.visitor
        this.type = 'visitor'
      }
      if (this.authorization.worker) {
        this.authorization.worker_id = this.authorization.worker.id;
        this.person = this.authorization.worker
        this.type = 'worker'
      }
      if (this.authorization.user) {
        this.authorization.user_id = this.authorization.user.id;
        this.person = this.authorization.user
        this.type = 'user'
      }
      if (this.authorization.vehicle) {
        this.authorization.vehicle_id = this.authorization.vehicle.id;
      }
      if (this.authorization.pet) {
        this.authorization.pet_id = this.authorization.pet.id;
      }
    }

    if (this.navParams.get('print'))
      this.printing = true;
    if (this.navParams.get('editor'))
      this.editor = true;
  }


  print() {
    setTimeout(() => {
      if (!this.platform.is('mobile')) {
        return this.toPrintCallback();
      };
      this.printer.print(document.getElementById('toPrint'))
    }, 1200);
  }

  toPrintCallback() {
    window.print();
  }

  close() {
    this.viewCtrl.dismiss();
  }

  canSave() {
    return this.authorization.start_at &&
      this.authorization.end_at &&
      this.authorization.description.length > 3
      && (
        this.authorization.visitor ||
        this.authorization.worker ||
        this.authorization.user ||
        this.authorization.vehicle ||
        this.authorization.pet
      )
  }


  calculateDate(key = "start") {
    this.authorization[key + "_at"] = moment(this.authorization["_" + key])
    if (key == 'start' && this.authorization.end == null) {
      this.authorization._end = this.authorization[key + "_at"].clone().add(1, 'day').format("YYYY-MM-DDTHH:mm")
    }
  }


  selectPerson() {
    var modal = this.modal.create('PersonFinderPage', {
      users: true,
      visitors: true,
      workers: true
    })
    modal.present();
    modal.onDidDismiss((data) => {
      if (!data) {
        this.authorization.visitor = null;
        this.authorization.worker = null;
        this.authorization.user = null;
        this.authorization.visitor_id = null;
        this.authorization.worker_id = null;
        this.authorization.user_id = null;
        this.person = null;
        this.type = null;
        return;
      }
      console.log(data);
      if (data.type == 'user') {
        this.authorization.visitor = null;
        this.authorization.worker = null;
        this.authorization.user = data.person;
        this.authorization.visitor_id = null;
        this.authorization.worker_id = null;
        this.authorization.user_id = data.person.id;
      }
      if (data.type == 'visitor') {
        this.authorization.visitor = data.person;
        this.authorization.worker = null;
        this.authorization.user = null;
        this.authorization.visitor_id = data.person.id;
        this.authorization.worker_id = null;
        this.authorization.user_id = null;
      }
      if (data.type == 'user') {
        this.authorization.visitor = null;
        this.authorization.worker = data.person;
        this.authorization.user = null;
        this.authorization.visitor_id = null;
        this.authorization.worker_id = data.person.id;
        this.authorization.user_id = null;
      }
      this.person = data.person
      this.type = data.type;
    })

  }

  selectVehicle() {
    var modal = this.modal.create(VehicleFinderPage);
    modal.present()
    modal.onDidDismiss((data) => {
      if (data && data.id) {
        this.authorization.vehicle_id = data.id;
        this.authorization.vehicle = data;
      }
    });
  }

  save() {
    this.loading = true
    var data = {
      id: this.authorization.id,
      reference: this.authorization.reference,
      start_at: this.authorization.start_at.format("YYYY-MM-DD HH:mm:ss"),
      end_at: this.authorization.end_at.format("YYYY-MM-DD HH:mm:ss"),
      vehicle_id: this.authorization.vehicle_id,
      pet_id: this.authorization.pet_id,
      visitor_id: this.authorization.visitor_id,
      worker_id: this.authorization.worker_id,
      user_id: this.authorization.user_id,
      description: this.authorization.description,
    }
    var promise;
    if (this.authorization.id) {
      promise = this.api.put('authorizations/' + this.authorization.id, data)
    } else {
      promise = this.api.post('authorizations', data)
    }
    promise
      .then((data) => {
        this.authorization.id = data.id;
        this.editor = false
        this.loading = false
        this.toast.create({
          message: this.api.trans('__.updated_successfully'),
          duration: 1500,
        }).present()
      })
      .catch((error) => {
        this.loading = false
        this.api.Error(error)
      })
    return promise
  }
}
