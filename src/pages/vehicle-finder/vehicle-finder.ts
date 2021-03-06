import { Api } from './../../providers/api';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ModalController, ActionSheetController, ToastController } from 'ionic-angular';
// @IonicPage()
@Component({
  selector: 'page-vehicle-finder',
  templateUrl: 'vehicle-finder.html',
})
export class VehicleFinderPage {
  vehicle_image: any;
  vehicles: any = [];
  query = "";
  loading = false;
  ready = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewctrl: ViewController, public api: Api, public modal: ModalController, public actionsheet: ActionSheetController,
    public toast: ToastController) {
    this.api.storage.get('recent_vehicles')
      .then((recent_vehicles) => {
        if (recent_vehicles) {
          this.vehicles = recent_vehicles;
        }
      });
    this.api.load('vehicles')
      .then((resp) => {
        this.search();
        this.ready = true;
      })
  }

  ionViewDidLoad() {
  }

  search() {
    this.loading = true;
    var limit = 100;
    var filter = this.query.toLowerCase()
    var results = [];
    for (var i = 0; i < this.api.objects.vehicles.length; i++) {
      var item = this.api.objects.vehicles[i];
      if (
        (item.name && item.name.toLowerCase().indexOf(filter) > -1) ||
        (item.plate && item.plate.toLowerCase().indexOf(filter) > -1) ||
        (item.make && item.make.toLowerCase().indexOf(filter) > -1) ||
        (item.model && item.model.toLowerCase().indexOf(filter) > -1) ||
        (item.color && item.color.toLowerCase().indexOf(filter) > -1) ||
        (item.residence && item.residence.name && item.residence.name.toLowerCase().indexOf(filter) > -1)
      ) {
        results.push(item);
      }
      if (results.length == limit) {
        break;
      }

    }
    this.vehicles = results
    this.api.storage.set('recent_vehicles', this.vehicles);
    this.loading = false;
  }

  cancel() {
    this.viewctrl.dismiss(null, "cancel");
  }

  select(vehicle) {
    this.viewctrl.dismiss(vehicle, "accept");
  }

  addQuickVehicle() {
    var modal = this.modal.create('VehicleEditorPage', { vehicle: null });
    modal.present();
    modal.onDidDismiss((data, role) => {
      if (data) {
        if (this.canAddVehicle(data)) {
          this.addVehicle(data);
        }
      }
    });
    // this.alert.create({
    //   title: this.api.trans('crud.add') + ' ' + this.api.trans('literals.vehicle'),
    //   inputs: [
    //     {
    //       label: this.api.trans('literals.plate'),
    //       placeholder: this.api.trans('literals.plate'),
    //       name: 'plate',
    //     },
    //     {
    //       label: this.api.trans('literals.make'),
    //       placeholder: this.api.trans('literals.make'),
    //       name: 'make',
    //     },
    //     {
    //       label: this.api.trans('literals.model'),
    //       placeholder: this.api.trans('literals.model'),
    //       name: 'model',
    //     },
    //     {
    //       label: this.api.trans('literals.color'),
    //       placeholder: this.api.trans('literals.color'),
    //       name: 'color',
    //     },
    //   ],
    //   buttons: [
    //     {
    //       role: 'destructive',
    //       text: this.api.trans('crud.cancel'),
    //       handler: (data) => {

    //       }
    //     },
    //     {
    //       role: 'creative',
    //       text: this.api.trans('crud.add'),
    //       handler: (data) => {
    //         console.log(data);
    //         if (this.canAddVehicle(data))
    //           this.addVehicle(data);
    //       }
    //     }
    //   ]
    // }).present();
  }


  canAddVehicle(vehicle) {
    return vehicle.model.length > 0 && vehicle.plate.length > 0 && vehicle.make.length > 0
  }

  addVehicle(vehicle) {
    vehicle.residence_id = this.navParams.get('residence_id');
    this.api.post('vehicles', vehicle)
      .then((resp) => {
        this.vehicles.data = [resp];
      })
      .catch(console.error)
  }

  updateVehicle(vehicle, data) {
    this.api.put('vehicles/' + vehicle.id + '?with[]=image', data)
      .then((resp) => {
        this.vehicles.data = [resp];
      })
      .catch(console.error)
  }

  editQuickVehicle(vehicle) {
    var modal = this.modal.create('VehicleEditorPage', { vehicle: null });
    modal.present();
    modal.onDidDismiss((data, role) => {
      console.log(data);
      if (data) {
        if (this.canAddVehicle(data)) {
          this.updateVehicle(vehicle, data);
        }
      }
    });
  }

  actions(vehicle) {
    this.actionsheet.create({
      title: this.api.trans('literals.actions') + " | " + vehicle.name,
      buttons: [
        {
          text: this.api.trans('crud.edit') + " " + this.api.trans('literals.image'),
          icon: 'camera',
          cssClass: 'icon-secondary',
          handler: () => { this.askFile(vehicle) }
        },
        {
          text: this.api.trans('crud.edit'),
          icon: 'create',
          cssClass: 'icon-warning',
          handler: () => { this.editQuickVehicle(vehicle) }
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

  askFile(vehicle) {
    this.vehicle_image = vehicle;
    var filer: any = document.querySelector("#input-file")
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





}
