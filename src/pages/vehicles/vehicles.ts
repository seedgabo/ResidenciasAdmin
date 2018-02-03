import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController, ModalController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-vehicles',
  templateUrl: 'vehicles.html',
})
export class VehiclesPage {
  vehicles = [];
  _vehicles = [];
  loading = false;
  query = "";
  vehicle_image
  constructor(public navCtrl: NavController, public navParams: NavParams, public action: ActionSheetController, public api: Api, public toast: ToastController, public modal: ModalController) {
  }

  ionViewDidLoad() {
    this.getVehicles();
  }

  getVehicles(refresher = null) {
    this.loading = true;
    this.query = "";
    this.api.ready.then(() => {
      this.api.load("vehicles")
        .then((data: any) => {
          this.vehicles = data;
          this._vehicles = data;
          this.loading = false;
          if (refresher)
            refresher.complete();
        })
        .catch((err) => {
          this.api.Error(err);
          this.loading = false;
          if (refresher)
            refresher.complete();
        });
    })
  }

  filter() {
    if (this.query === "")
      return this.vehicles = this._vehicles;
    var finder = this.query.toLowerCase();
    this.vehicles = this._vehicles.filter((v) => {
      return v.name.toLowerCase().indexOf(finder) > - 1
        || v.plate.toLowerCase().indexOf(finder) > - 1
        || (v.owner && v.owner.name.toLowerCase().indexOf(finder) > - 1)
        || (v.owner && v.owner.document && v.owner.document.toLowerCase().indexOf(finder) > - 1)
        || (v.residence && v.residence.name.toLowerCase().indexOf(finder) > - 1)
        || (v.residence && v.residence.name.toLowerCase().indexOf(finder) > - 1)
        || (v.visitor && v.visitor.name.toLowerCase().indexOf(finder) > - 1)
        || (v.visitor && v.visitor.document && v.visitor.document.toLowerCase().indexOf(finder) > - 1)
    });

  }

  askFile(vehicle) {
    this.vehicle_image = vehicle;
    var filer: any = document.querySelector("#input-file-vehicle")
    filer.click();
  }

  readFile(event) {
    try {
      var reader: any = new FileReader();
      reader.readAsDataURL(event.target.files[0])
      reader.onload = (result) => {
        this.vehicle_image.image_url = result.target.result;
        this.uploadImage(this.vehicle_image.id)
      };
    } catch (error) {
      console.error(error)
    }
  }

  uploadImage(id) {
    return this.api.post('images/upload/vehicle/' + id, { image: this.vehicle_image.image_url })
      .then((data: any) => {
        console.log(data);
        this.vehicle_image.image = data.image;
        this.toast.create({
          message: this.api.trans("literals.image") + " " + this.api.trans("crud.updated"),
          duration: 1500,
          showCloseButton: true,
        }).present();
      })
      .catch(console.error)
  }

  canAddVehicle(vehicle) {
    return vehicle.model.length > 0 && vehicle.plate.length > 0 && vehicle.make.length > 0
  }



  saveVehicle(vehicle, data) {
    var dataToSend = {
      make: data.make,
      plate: data.plate,
      model: data.model,
      type: data.type,
      color: data.color,
      owner_id: data.owner_id,
      residence_id: data.residence_id,
      visitor_id: data.visitor_id,
    }

    var promise
    if (vehicle && vehicle.id) {
      promise = this.api.put('vehicles/' + vehicle.id + '?with[]=image', dataToSend)
      promise.then((resp) => {
        vehicle = resp;
      })
    } else {
      promise = this.api.post('vehicles', dataToSend)
      promise.then((resp) => {
        this.vehicles.push(resp);
      })
    }

    promise
      .then((resp) => {
        this.done()
      })
      .catch((err) => {
        this.api.Error(err)
      })
  }

  addQuickVehicle() {
    var modal = this.modal.create('VehicleEditorPage', { vehicle: null });
    modal.present();
    modal.onDidDismiss((data, role) => {
      if (data) {
        if (this.canAddVehicle(data)) {
          this.saveVehicle(null, data);
        }
      }
    });
  }

  editQuickVehicle(vehicle) {

    var modal = this.modal.create('VehicleEditorPage', { vehicle: vehicle });
    modal.present();
    modal.onDidDismiss((data, role) => {
      console.log(data);
      if (data) {
        if (this.canAddVehicle(data)) {
          this.saveVehicle(vehicle, data);
        }
      }
    });
  }

  actions(vehicle) {
    this.action.create({
      title: this.api.trans('literals.actions') + " | " + vehicle.name,
      buttons: [
        {
          text: this.api.trans('crud.edit'),
          icon: 'create',
          // cssClass: 'icon-warning',
          handler: () => { this.editQuickVehicle(vehicle) }
        },
        {
          text: this.api.trans('crud.edit') + " " + this.api.trans('literals.image'),
          icon: 'camera',
          // cssClass: 'icon-secondary',
          handler: () => { this.askFile(vehicle) }
        },
        // {
        //   text: this.api.trans('crud.delete'),
        //   icon: 'trash',
        //   role: 'destructive',
        //   cssClass: 'icon-danger',
        //   handler: () => { this.delete(vehicle) }
        // }

      ]
    }).present();
  }

  done() {
    this.toast.create({
      message: this.api.trans('literals.done'),
      duration: 2500
    }).present()
  }

}
