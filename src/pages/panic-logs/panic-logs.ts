import { Events } from 'ionic-angular';
import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { NavController, NavParams, Platform, IonicPage, ActionSheetController, AlertController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-panic-logs',
  templateUrl: 'panic-logs.html',
})
export class PanicLogsPage {
  panics: any = { data: [] };
  loading = false;
  handler = () => {
    this.getPanics()
  }
  constructor(public navCtrl: NavController, public navParams: NavParams, public api: Api, public platform: Platform, public actionsheet: ActionSheetController, public alert: AlertController, public events:Events) {
  }

  ionViewDidLoad() {
    this.events.subscribe('panic', this.handler)
    this.getPanics()
  }

  ionViewWillUnload(){
    this.events.unsubscribe('panic',this.handler)
  }

  getPanics() {
    this.loading = true;
    this.api.get('panics?with[]=user&with[]=residence&order[created_at]=desc&paginate=500')
      .then((data: any) => {
        console.log(data);
        this.panics = data;
        this.loading = false;
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
      })
  }

  actions(panic) {
    this.actionsheet.create({
      buttons: [
        {
          text: this.api.trans('crud.add') + " " + this.api.trans('literals.note'),
          handler: () => {
            this.addNote(panic)
          }

        },
        {
          text: this.api.trans('crud.cancel')
        }
      ]
    }).present()
  }

  addNote(panic) {
    this.alert.create({
      title: this.api.trans("crud.add") + " " + this.api.trans('literals.note'),
      inputs: [{
        name: 'note',
        placeholder: this.api.trans('literals.note'),
        value: panic.note
      }],
      buttons: [{
        text: 'OK',
        handler: (data) => {
          if (data && data.note) {
            this.api.put('panics/' + panic.id, { note: data.note })
              .then((resp) => {
                panic.note = data.note
              })
              .catch((err) => {
                this.api.Error(err)
              })
          }
        }
      }, {
        text: this.api.trans('crud.cancel')
      }]
    }).present();
  }

  openMap(panic) {
    if (!panic.location) {
      return;
    }
    var addressLongLat = panic.location.latitude + ',' + panic.location.longitude;
    window.open("http://maps.google.com/?q=" + addressLongLat, "_system");
  }

}
