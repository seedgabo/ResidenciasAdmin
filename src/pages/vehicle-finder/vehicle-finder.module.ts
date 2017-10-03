import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VehicleFinderPage } from './vehicle-finder';

@NgModule({
  declarations: [
    VehicleFinderPage,
  ],
  imports: [
    IonicPageModule.forChild(VehicleFinderPage),
  ],
})
export class VehicleFinderPageModule {}
