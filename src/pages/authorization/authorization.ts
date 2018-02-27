import { Printer } from '@ionic-native/printer';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Api } from '../../providers/api';

@IonicPage()
@Component({
  selector: 'page-authorization',
  templateUrl: 'authorization.html',
})
export class AuthorizationPage {
  authorization: any = {}
  printing = false;
  editor = true;
  loading = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public printer: Printer, public platform: Platform) {
    if (this.navParams.get('authorization')) {
      this.authorization = this.navParams.get('authorization')
    }

    if (this.navParams.get('print'))
      this.printing = true;
    if (this.navParams.get('editor'))
      this.editor = true;
  }

  save() {
    this.loading = true
    var data = {
      id: this.authorization.id,
      reference: this.authorization.reference,
      start_at: this.authorization.start_at,
      end_at: this.authorization.end_at,
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
      promise = this.api.put('authorizations/', data)
    }
    promise
      .then((data) => {
        this.authorization.id = data.id;
        this.editor = false
        this.loading = false
      })
      .catch((error) => {
        this.loading = false
        this.api.Error(error)
      })
    return promise
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

}
